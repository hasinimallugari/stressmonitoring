from fastapi import APIRouter, Depends
from ..models import ChatRequest, ChatResponse, User
from ..auth import get_current_user
from ..services.ai_service import generate_ai_response

router = APIRouter(prefix="/api", tags=["Chatbot"])

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Chatbot endpoint. Requires X-User-Email and X-User-Password headers.
    Injects context dump files + DB user document + system prompt into AI completion context.
    """
    result = await generate_ai_response(
        prompt=request.prompt,
        history=request.history or [],
        user=current_user
    )
    return ChatResponse(
        response=result["response"],
        suggestions=result.get("suggestions", [])
    )
