"""
context_loader.py

Previously this module read all context-dump files and returned them as one
giant string for prompt injection.  That approach has been replaced by the
RAG retriever (retriever.py) which embeds and indexes the documents at startup
and returns only the passages relevant to each query.

This file is kept as a compatibility shim and is no longer called directly
from ai_service.py.  The retriever imports text-extraction logic independently.
"""

# Nothing to export — retriever.py handles all document loading.
