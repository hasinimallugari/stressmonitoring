from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from .database import get_db
from .models import User

def get_current_user(
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    x_user_password: Optional[str] = Header(None, alias="X-User-Password"),
    email: Optional[str] = Header(None, alias="email"),
    password: Optional[str] = Header(None, alias="password"),
    db: Session = Depends(get_db)
) -> User:
    # Accept header parameters in X-User-Email / X-User-Password or simple email/password
    user_email = x_user_email or email
    user_password = x_user_password or password

    if not user_email or not user_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication headers. Provide 'X-User-Email' and 'X-User-Password'.",
            headers={"WWW-Authenticate": "Header"}
        )

    # Query DB for user
    user = db.query(User).filter(User.email == user_email).first()
    if not user or user.password != user_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials in request headers."
        )

    return user
