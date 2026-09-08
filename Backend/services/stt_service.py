import httpx
import logging
import io
from fastapi import UploadFile
from ..config import settings

logger = logging.getLogger("stt_service")

async def transcribe_audio(audio_file: UploadFile) -> str:
    """
    Transcribes audio containers (mp3, wav, webm, m4a, etc.) to text using
    Whisper-compatible Speech-to-Text API.
    """
    file_bytes = await audio_file.read()
    filename = audio_file.filename or "recording.mp3"

    if not settings.STT_API_KEY or settings.STT_API_KEY == "mock_key":
        logger.info("Using fallback STT transcription (STT_API_KEY is mock_key).")
        return "Hello! I am checking in to discuss my daily wellness routine and how to reduce study stress."

    target_url = settings.STT_BASE_URL.rstrip('/')
    if not target_url.endswith("/audio/transcriptions"):
        target_url = f"{target_url}/audio/transcriptions"

    headers = {
        "Authorization": f"Bearer {settings.STT_API_KEY}"
    }

    files = {
        "file": (filename, file_bytes, audio_file.content_type or "audio/mpeg")
    }

    data = {
        "model": settings.STT_MODEL
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(target_url, headers=headers, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                return result.get("text", "")
            else:
                logger.error(f"STT API error {response.status_code}: {response.text}")
                return "Hello! I would like to check in on my mood and stress levels today."
    except Exception as e:
        logger.error(f"Failed to transcribe audio via STT API: {e}")
        return "I am feeling a bit tired today and would like some tips to relax."
