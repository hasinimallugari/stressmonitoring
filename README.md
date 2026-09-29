## Deployment Guide

### Frontend — Vite + React

The frontend can be deployed easily using **Vercel**.

#### Option 1: Deploy using Vercel CLI

Make sure the project is pushed to GitHub first.

```bash
npm install -g vercel
cd Frontend
vercel login
vercel --prod
```

#### Option 2: Deploy using Vercel Dashboard

1. Open [Vercel](https://vercel.com/) and sign in with GitHub.
2. Import your GitHub repository.
3. Select the **Frontend** folder as the project root directory.
4. Use the following settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

5. Click **Deploy**.

The provided `Frontend/vercel.json` contains the required Vercel configuration.

---

### Backend — FastAPI

The backend is built using **FastAPI** and is located in:

```text
Backend/main.py
```

For the backend, platforms such as **Render, Railway, Fly.io, or Heroku** can be used.

A typical deployment process is:

1. Connect the GitHub repository to the hosting platform.
2. Configure the required environment variables.
3. Install the Python dependencies.
4. Start the FastAPI application using Uvicorn.

Example start command:

```bash
uvicorn Backend.main:app --host 0.0.0.0 --port $PORT
```

Configure the environment variables listed in:

```text
Backend/.env.example
```

For example:

```text
GEMINI_API_KEY
STT_API_KEY
CONTEXT_DUMP_DIR
DATABASE_URL
```

> **Important:** Never commit `.env` files or API keys to GitHub.

---

### Database and File Storage

The current project uses SQLite for local development.

```text
DATABASE_URL=sqlite:///...
```

For production deployment, a managed database such as **PostgreSQL** is recommended because SQLite files may not persist on some cloud hosting platforms.

The `CONTEXT_DUMP_DIR` directory must also be available to the deployed backend. For production, persistent storage or a cloud storage bucket can be used if required.

---

### Frontend + Backend Deployment

A typical production setup is:

```text
GitHub Repository
       |
       +---- Frontend
       |       |
       |       +---- Vercel
       |
       +---- Backend
               |
               +---- Render / Railway / Fly.io
                       |
                       +---- PostgreSQL
```

After deploying the backend, update the frontend API URL so that the frontend communicates with the deployed FastAPI backend instead of the local development server.

---

### Local Development

#### Frontend

```bash
cd Frontend
npm install
npm run dev
```

#### Backend

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The frontend and backend can then be run separately during development.

---

### Deployment Notes

* Push the latest code to GitHub before deploying.
* Keep API keys and other secrets in environment variables.
* Do not commit `.env` files.
* Use PostgreSQL or another persistent database for production.
* Make sure the frontend API URL points to the deployed backend.
* Test the backend API before connecting it to the deployed frontend.
