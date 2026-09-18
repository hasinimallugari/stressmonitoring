"""
Create a default test user in the application's database.

Run this script from the repo root with the project's virtualenv active:
    . .venv\Scripts\Activate.ps1
    python Backend\create_default_user.py

It will create a user only if the email does not already exist.
"""
from sqlalchemy.orm import Session
from .database import SessionLocal, init_db
from .models import User

DEFAULT_EMAIL = "test@example.com"
DEFAULT_PASSWORD = "password123"
DEFAULT_NAME = "Test User"


def create_default_user():
    init_db()
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == DEFAULT_EMAIL).first()
        if existing:
            print(f"User {DEFAULT_EMAIL} already exists (id={existing.id}).")
            return

        user = User(
            email=DEFAULT_EMAIL,
            password=DEFAULT_PASSWORD,
            name=DEFAULT_NAME,
            role="Student / User",
            wellbeing_score=0,
            wellbeing_status="Not assessed yet",
            user_document=None,
            submitted_form=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created default user: {DEFAULT_EMAIL} (id={user.id})")
    finally:
        db.close()


if __name__ == "__main__":
    create_default_user()
