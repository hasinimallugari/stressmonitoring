from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="Student / User")
    wellbeing_score = Column(Integer, default=0)
    wellbeing_status = Column(String, default="Not assessed yet")
    user_document = Column(Text, nullable=True)   # Rich JSON context document
    submitted_form = Column(Boolean, default=False, nullable=False)  # Initial assessment

# Pydantic Schemas
class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    wellbeing_score: int
    wellbeing_status: str
    user_document: Optional[str] = None
    submitted_form: bool = False

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserDocUpdateRequest(BaseModel):
    user_document: Optional[str] = None
    wellbeing_score: Optional[int] = None
    wellbeing_status: Optional[str] = None

class FormSubmitRequest(BaseModel):
    """Payload for the initial assessment form submission."""
    responses: Dict[str, Any]  # keyed by question id e.g. {"q1": "Good", "q20": ["Talk to a counsellor"]}

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant' or 'system'")
    content: str

class ChatRequest(BaseModel):
    prompt: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []

class VoiceResponse(BaseModel):
    transcript: str
    response: str
    suggestions: List[str] = []
