import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserOut, LoginRequest, RegisterRequest, UserDocUpdateRequest, FormSubmitRequest
from ..auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def create_default_user_doc(name: str, email: str) -> str:
    """
    Create a minimal, blank user document on registration.
    All metrics start at zero / neutral — they are populated as the user
    interacts with the app and logs data.  No fake/demo data is injected.
    """
    joined_date = datetime.utcnow().strftime("%B %Y")
    return json.dumps({
        "profile": {
            "name": name,
            "email": email,
            "role": "Student / User",
            "joined": joined_date
        },
        "health_metrics": {
            "wellbeing_score": 0,
            "wellbeing_status": "Not assessed yet",
            "mood_trend": None,
            "stress_trend": None,
            "sleep_average": None,
            "streak_days": 0,
            "weekly_mood": [],
            "weekly_stress": [],
            "weekly_sleep": [],
            "weekly_wellbeing": []
        },
        # Schedule starts empty — the user builds their own routine
        "schedule": [],
        "preferences": {
            "dailyReminder": True,
            "emailSummary": False,
            "darkTheme": False,
            "voiceCallAudio": True,
            "anonymousDataSharing": True
        },
        # Populated after the user submits the initial assessment form
        "form_response": None
    }, indent=2)

@router.post("/register", response_model=UserOut)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    email = request.email.strip().lower()
    name = request.name.strip()
    password = request.password.strip()

    if not email or not password or not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, email, and password are required for registration."
        )

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    user_doc = create_default_user_doc(name, email)

    new_user = User(
        email=email,
        password=password,
        name=name,
        role="Student / User",
        wellbeing_score=0,
        wellbeing_status="Not assessed yet",
        user_document=user_doc
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=UserOut)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email = request.email.strip().lower()
    password = request.password.strip()

    user = db.query(User).filter(User.email == email).first()

    # Use a single generic message for both "not found" and "wrong password"
    # to avoid leaking whether the email exists (user enumeration).
    if not user or user.password != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again."
        )

    return user

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(
    update_data: UserDocUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.user_document:
        current_user.user_document = update_data.user_document
    if update_data.wellbeing_score is not None:
        current_user.wellbeing_score = update_data.wellbeing_score
    if update_data.wellbeing_status:
        current_user.wellbeing_status = update_data.wellbeing_status

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/submit-form", response_model=UserOut)
def submit_form(
    payload: FormSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save the initial assessment form responses into the user document and
    mark submitted_form = True so the client skips the form on future logins.
    """
    if current_user.submitted_form:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment form has already been submitted."
        )

    # Merge form_response into the existing user document
    try:
        existing_doc = json.loads(current_user.user_document or "{}")
    except json.JSONDecodeError:
        existing_doc = {}

    existing_doc["form_response"] = {
        "submitted_at": datetime.utcnow().isoformat(),
        "responses": payload.responses
    }

    current_user.user_document = json.dumps(existing_doc, indent=2)
    current_user.submitted_form = True

    db.commit()
    db.refresh(current_user)
    return current_user
