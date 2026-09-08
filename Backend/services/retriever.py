"""
retriever.py — Lightweight RAG retrieval layer.

How it works
============
Startup (build_index):
  1. Scan CONTEXT_DUMP_DIR for readable files (PDF, txt, md).
  2. Extract text from each file.
  3. Split text into overlapping chunks (~400 tokens / ~1600 chars).
  4. Embed every chunk with a local sentence-transformer model
     (all-MiniLM-L6-v2, ~80 MB, no API key required).
  5. Store embeddings in a NumPy matrix for cosine-similarity search.

Query time (retrieve):
  1. Embed the user prompt with the same model.
  2. Compute cosine similarity against all chunk embeddings.
  3. Return the top-K chunks (default 4) sorted by relevance score.

This means the AI receives only the context passages that are actually
relevant to what the user said — not the entire document corpus.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import List

import numpy as np

from ..config import settings

logger = logging.getLogger("retriever")

# ---------------------------------------------------------------------------
# Module-level state — populated once by build_index() at startup
# ---------------------------------------------------------------------------
_chunks: List[str] = []          # raw text of each chunk
_embeddings: np.ndarray | None = None  # shape (N, D), float32
_model = None                     # SentenceTransformer instance


# ---------------------------------------------------------------------------
# Text extraction helpers
# ---------------------------------------------------------------------------

def _extract_text_from_file(path: Path) -> str:
    """Return plain text from a PDF, txt, or md file."""
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        try:
            import pdfplumber  # type: ignore
            text_parts: List[str] = []
            with pdfplumber.open(str(path)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        except ImportError:
            logger.warning("pdfplumber not installed — cannot extract PDF: %s", path.name)
            return ""
        except Exception as exc:
            logger.warning("Failed to extract PDF %s: %s", path.name, exc)
            return ""

    if suffix in (".txt", ".md"):
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception as exc:
            logger.warning("Failed to read %s: %s", path.name, exc)
            return ""

    # Unsupported file type — skip silently
    return ""


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

def _split_into_chunks(text: str, chunk_size: int = 1600, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping character-level chunks.
    Tries to break on paragraph/sentence boundaries for cleaner context.
    """
    # Normalise whitespace
    text = re.sub(r"\n{3,}", "\n\n", text.strip())

    if len(text) <= chunk_size:
        return [text] if text else []

    chunks: List[str] = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        if end < len(text):
            # Try to break on a paragraph boundary
            para_break = text.rfind("\n\n", start, end)
            if para_break != -1 and para_break > start + chunk_size // 2:
                end = para_break
            else:
                # Fall back to sentence boundary (. or ! or ?)
                sent_break = max(
                    text.rfind(". ", start, end),
                    text.rfind("! ", start, end),
                    text.rfind("? ", start, end),
                )
                if sent_break != -1 and sent_break > start + chunk_size // 2:
                    end = sent_break + 1  # include the punctuation

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Move forward with overlap so context isn't lost at boundaries
        start = end - overlap if end - overlap > start else end

    return chunks


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_index() -> None:
    """
    Load all context-dump documents, chunk them, and embed every chunk.
    Call this once at application startup.
    """
    global _chunks, _embeddings, _model

    # Resolve context dump directory
    dump_path = Path(settings.CONTEXT_DUMP_DIR)
    if not dump_path.is_absolute():
        base_dir = Path(__file__).parent.parent
        dump_path = (base_dir / settings.CONTEXT_DUMP_DIR).resolve()
        if not dump_path.exists():
            dump_path = (base_dir.parent / "context-dump").resolve()

    if not dump_path.exists() or not dump_path.is_dir():
        logger.warning("Context dump directory not found at %s — RAG index will be empty.", dump_path)
        _chunks = []
        _embeddings = None
        return

    # ── 1. Load & chunk documents ────────────────────────────────────────────
    all_chunks: List[str] = []
    for file_path in sorted(dump_path.rglob("*")):
        if not file_path.is_file() or file_path.name.startswith("."):
            continue
        text = _extract_text_from_file(file_path)
        if not text.strip():
            continue
        file_chunks = _split_into_chunks(text)
        # Tag each chunk with its source filename for traceability
        tagged = [f"[Source: {file_path.name}]\n{c}" for c in file_chunks]
        all_chunks.extend(tagged)
        logger.info("Indexed %d chunks from %s", len(file_chunks), file_path.name)

    if not all_chunks:
        logger.warning("No text content found in context dump — RAG index is empty.")
        _chunks = []
        _embeddings = None
        return

    # ── 2. Load embedding model ───────────────────────────────────────────────
    try:
        from sentence_transformers import SentenceTransformer  # type: ignore
    except ImportError:
        logger.error(
            "sentence-transformers is not installed. "
            "Run: pip install sentence-transformers pdfplumber"
        )
        _chunks = all_chunks  # store chunks but no embeddings (fallback to keyword search)
        _embeddings = None
        return

    logger.info("Loading embedding model (all-MiniLM-L6-v2)…")
    _model = SentenceTransformer("all-MiniLM-L6-v2")

    # ── 3. Embed all chunks ───────────────────────────────────────────────────
    logger.info("Embedding %d chunks…", len(all_chunks))
    embeddings = _model.encode(all_chunks, batch_size=32, show_progress_bar=False, normalize_embeddings=True)
    _chunks = all_chunks
    _embeddings = np.array(embeddings, dtype=np.float32)
    logger.info("RAG index ready: %d chunks embedded.", len(_chunks))


def retrieve(query: str, top_k: int = 4) -> str:
    """
    Return the top-K most relevant context chunks for the given query,
    formatted as a single string ready for prompt injection.

    Falls back to simple keyword matching when the embedding model isn't
    available (e.g. sentence-transformers not installed).
    """
    if not _chunks:
        return "[No context documents loaded]"

    # ── Embedding-based retrieval ─────────────────────────────────────────────
    if _embeddings is not None and _model is not None:
        query_vec = _model.encode([query], normalize_embeddings=True)
        query_vec = np.array(query_vec, dtype=np.float32)  # shape (1, D)

        # Cosine similarity (embeddings are already L2-normalised)
        scores = (_embeddings @ query_vec.T).flatten()  # shape (N,)

        # Pick top-K indices, highest score first
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score < 0.15:
                # Below relevance threshold — not useful
                break
            results.append(_chunks[idx])

        if results:
            return "\n\n---\n\n".join(results)

    # ── Keyword fallback ──────────────────────────────────────────────────────
    # If embeddings aren't available, return chunks that contain any word
    # from the query (simple BM25-style keyword filter).
    query_words = set(re.findall(r"\w+", query.lower()))
    scored: List[tuple[int, int]] = []
    for i, chunk in enumerate(_chunks):
        chunk_words = set(re.findall(r"\w+", chunk.lower()))
        overlap = len(query_words & chunk_words)
        if overlap > 0:
            scored.append((overlap, i))

    scored.sort(reverse=True)
    top = [_chunks[i] for _, i in scored[:top_k]]

    if top:
        return "\n\n---\n\n".join(top)

    return "[No relevant context found for this query]"


def index_size() -> int:
    """Return the number of indexed chunks (useful for health checks)."""
    return len(_chunks)
