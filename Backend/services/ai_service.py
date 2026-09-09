import httpx
import json
import logging
from typing import List, Dict, Any
from ..config import settings
from .retriever import retrieve          # RAG retrieval — replaces full context dump
from ..models import ChatMessage, User

logger = logging.getLogger("ai_service")


async def generate_ai_response(
    prompt: str,
    history: List[ChatMessage],
    user: User
) -> Dict[str, Any]:
    """
    Calls OpenAI / Gemini-compatible Chat Completions API.

    Context injection strategy (RAG):
      - The full context-dump corpus is indexed at startup (see retriever.py).
      - At query time only the top-K chunks most semantically similar to the
        user's prompt are retrieved and injected into the system message.
      - This keeps prompts short, reduces API cost, and avoids polluting the
        model with irrelevant documents.
    """
    # 1. Retrieve only the relevant context passages for this prompt
    relevant_context = retrieve(prompt, top_k=4)

    # 2. Extract database user doc
    user_doc = user.user_document or "No custom user document found."

    # 3. Assemble system prompt (compact — no full corpus dump)
    full_system_prompt = (
        f"{settings.SYSTEM_PROMPT}\n\n"
        f"--- RELEVANT KNOWLEDGE BASE EXCERPTS ---\n"
        f"{relevant_context}\n\n"
        f"--- USER PROFILE & HEALTH DATABASE DOCUMENT ---\n"
        f"User Email: {user.email}\n"
        f"User Name: {user.name}\n"
        f"Document:\n{user_doc}\n\n"
        f"Instruction: Use only the excerpts and user document above to provide "
        f"personalised, helpful answers. Do not fabricate facts not present in the context."
    )

    messages = [{"role": "system", "content": full_system_prompt}]

    # 4. Append conversation history
    if history:
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})

    # 5. Append current user prompt
    messages.append({"role": "user", "content": prompt})

    # Use the single Gemini API key
    active_api_key = settings.GEMINI_API_KEY

    # 6. Offline fallback if no real key is configured
    if not active_api_key or active_api_key in ["your_gemini_api_key_here"]:
        logger.info("Using mock AI completion (no valid API key configured).")
        return get_mock_response(prompt, user)

    # 7. Call the AI completions endpoint
    target_url = settings.AI_BASE_URL.rstrip("/")
    if not target_url.endswith("/chat/completions"):
        target_url = f"{target_url}/chat/completions"

    headers = {
        "Authorization": f"Bearer {active_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.AI_MODEL,
        "messages": messages,
        "temperature": 0.7,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(target_url, json=payload, headers=headers)

            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return {
                    "response": content,
                    "suggestions": generate_suggestions(prompt),
                }
            else:
                logger.error("AI API error %s: %s", response.status_code, response.text)
                return get_mock_response(prompt, user, error_msg=f"API Status {response.status_code}")

    except Exception as exc:
        logger.error("Failed to connect to AI provider: %s", exc)
        return get_mock_response(prompt, user, error_msg=str(exc))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def generate_suggestions(prompt: str) -> List[str]:
    prompt_lower = prompt.lower()
    if any(w in prompt_lower for w in ("stress", "overloaded", "overwhelmed", "anxious")):
        return ["Show 5-min breathing exercise", "View stress trend", "Talk to companion"]
    if any(w in prompt_lower for w in ("sleep", "tired", "exhausted", "insomnia")):
        return ["Check sleep average", "Set evening reminder", "View sleep tips"]
    if any(w in prompt_lower for w in ("schedule", "routine", "timetable", "plan")):
        return ["View today's timetable", "Adjust routine", "Check progress"]
    if any(w in prompt_lower for w in ("mood", "feeling", "emotion", "sad", "happy")):
        return ["View mood chart", "Log today's mood", "Talk to companion"]
    return ["Tell me more", "Show my dashboard", "Start a voice call"]


def get_mock_response(prompt: str, user: User, error_msg: str = None) -> Dict[str, Any]:
    import random
    user_name = user.name or "Friend"

    responses = [
        f"Thank you for sharing that, {user_name}. Based on your profile, taking regular "
        f"10-minute breaks during study sessions can significantly reduce stress.",
        f"I hear you, {user_name}. Let's look at your recent patterns and find a small "
        f"change that could make a real difference today.",
        f"That's completely understandable. Remember to stay hydrated, try a short "
        f"breathing exercise, and check your updated timetable for today.",
    ]
    selected = random.choice(responses)

    if error_msg:
        selected += f"\n\n*(Offline mode — provider error: {error_msg})*"

    return {
        "response": selected,
        "suggestions": generate_suggestions(prompt),
    }
