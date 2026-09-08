from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import Optional
from ..models import VoiceResponse, User
from ..auth import get_current_user
from ..services.stt_service import transcribe_audio
from ..services.ai_service import generate_ai_response

router = APIRouter(prefix="/api", tags=["Voice Assistant"])

@router.post("/voice", response_model=VoiceResponse)
async def voice_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Voice Assistant endpoint. Converts audio container to text (Speech-To-Text),
    then injects context dump + DB user doc + prompt into AI completion service.
    """
    # 1. Transcribe audio to text
    transcript = await transcribe_audio(file)
    
    # 2. Feed transcribed text to AI service pipeline
    ai_result = await generate_ai_response(
        prompt=transcript,
        history=[],
        user=current_user
    )

    return VoiceResponse(
        transcript=transcript,
        response=ai_result["response"],
        suggestions=ai_result.get("suggestions", [])
    )
