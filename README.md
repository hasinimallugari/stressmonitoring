# Deployment Guide

Short instructions to deploy the frontend to Vercel and recommended options for the backend.

Frontend (Vite)

- Ensure the project is committed to a Git provider (GitHub recommended).
- In the `Frontend` folder we use a static build; `vercel.json` is provided.
- From the `Frontend` folder you can deploy with the Vercel CLI:

```bash
npm i -g vercel
cd Frontend
vercel login
vercel --prod
```

- Alternatively, connect the GitHub repo in the Vercel dashboard:
  - Project settings: Build Command = `npm run build`
  - Output Directory = `dist`

Backend (recommendation)

The backend is a FastAPI app (`Backend/main.py`). Vercel is not ideal for long-running ASGI apps that build indexes at startup. Recommended options:

- Render / Railway / Fly / Heroku (simple deployments that run Uvicorn):
  - Connect GitHub repository
  - Set environment variables (from `Backend/.env.example`) in the host dashboard: `GEMINI_API_KEY`, `STT_API_KEY`, `CONTEXT_DUMP_DIR`, `DATABASE_URL`, etc.
  - Start command example: `uvicorn Backend.main:app --host 0.0.0.0 --port $PORT`

- Notes about the database and files:
  - `DATABASE_URL` currently points to a local SQLite file. For production use a managed DB (Postgres). SQLite on ephemeral hosts is not durable.
  - `CONTEXT_DUMP_DIR` must be present on the host or you should load the context into a persistent storage or storage bucket.

Quick Vercel-specific notes

- The `Frontend/vercel.json` is set to use `@vercel/static-build` and serve the `dist` directory produced by `npm run build`.
- If you still want to run the Python backend on Vercel, it is possible to use Vercel Serverless Functions with Python, but that requires rewriting endpoints into individual serverless functions and will have cold-start and execution-time constraints. I can help with that conversion if you want.

If you want, I can:
- Push a minimal `vercel` deployment configuration to this repo and run `vercel --prod` here, or
- Prepare step-by-step instructions for deploying the backend to Render (including a sample `render.yaml`), or
- Convert the backend endpoints to Vercel serverless functions.

Tell me which option you prefer.
