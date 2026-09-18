from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .config import settings
from contextlib import asynccontextmanager
from .database import init_db
from .routers import auth_router, chat_router, voice_router
from .services.retriever import build_index, index_size
import logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialise database tables
    init_db()

    # 2. Build RAG index from context-dump documents.
    #    Only the top-K most relevant chunks are injected per query — the full
    #    corpus is never sent to the AI.
    # Building the RAG index requires heavy ML dependencies. Allow skipping
    # during development with the SKIP_RAG_BUILD env var to speed startup.
    if os.getenv("SKIP_RAG_BUILD", "0") not in ("1", "true", "True"):
        try:
            build_index()
        except Exception as exc:
            logging.getLogger("main").warning("RAG index build failed or skipped: %s", exc)

    yield


app = FastAPI(
    title="Mental Health AI Companion API",
    description=(
        "FastAPI backend providing header-based Auth, RAG-based context retrieval, "
        "AI Chatbot, and STT Voice Assistant."
    ),
    version="1.1.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
# NOTE: allow_credentials requires an explicit origin list — wildcard + credentials
# is rejected by browsers per the CORS spec.
# Configure CORS origins. Prefer explicit origins to allow credentials safely.
frontend_origins = os.getenv("FRONTEND_ORIGINS")
if frontend_origins:
    allow_origins = [o.strip() for o in frontend_origins.split(",") if o.strip()]
else:
    # Default to local Vite dev server used during development
    allow_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

# By default we do not enable credentialed CORS (cookies). Set ALLOW_CREDENTIALS=1 to enable.
allow_credentials = os.getenv("ALLOW_CREDENTIALS", "0") in ("1", "true", "True")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router)
app.include_router(chat_router.router)
app.include_router(voice_router.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Mental Health AI Backend",
        "docs": "/docs",
        "rag_index_chunks": index_size(),
        "endpoints": {
            "auth_login": "POST /api/auth/login",
            "auth_me": "GET /api/auth/me",
            "chat": "POST /api/chat",
            "voice": "POST /api/voice",
        },
    }
