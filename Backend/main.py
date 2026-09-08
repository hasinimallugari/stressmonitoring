from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db
from .routers import auth_router, chat_router, voice_router
from .services.retriever import build_index, index_size


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialise database tables
    init_db()

    # 2. Build RAG index from context-dump documents.
    #    Only the top-K most relevant chunks are injected per query — the full
    #    corpus is never sent to the AI.
    build_index()

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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
