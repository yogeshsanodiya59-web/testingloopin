# Deployment Guide for Loop.in

This guide covers how to deploy the Loop.in application using Render.com or Docker.

## Prerequisites

1.  **Firebase Project**: You must have a Firebase project and a Service Account JSON file.
2.  **Google OAuth**: You need a Google Cloud Console project with OAuth credentials.
3.  **Database**: A PostgreSQL database is required.

---

## Option 1: Deploy to Render.com (Recommended)

The project includes a `render.yaml` file for Infrastructure as Code (IaC) deployment on Render.

1.  **Push to GitHub**: Ensure your code is in a public or private GitHub repository.
2.  **Create Render Account**: Go to [render.com](https://render.com) and sign up.
3.  **New Blueprint**: Click "New +" -> "Blueprint" and connect your repository.
4.  **Configure Environment Variables**:
    Render will detect the `render.yaml` and prompt you for the required environment variables.

    | Variable | Description |
    |Str |---|
    | `DATABASE_URL` | Connection string to your PostgreSQL DB (Render provides managed Postgres or you can use an external one) |
    | `SECRET_KEY` | A random long string for security |
    | `FIREBASE_CREDENTIALS_JSON` | **CRITICAL**: Paste the *contents* of your Firebase JSON file here as a single string. |
    | `GOOGLE_CLIENT_ID` | From Google Cloud Console |
    | `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
    | `GOOGLE_REDIRECT_URI` | Your production URL + `/auth/callback` (e.g. `https://loop-frontend.onrender.com/auth/callback`) |

5.  **Deploy**: Click "Apply" to deploy. Render will build both services.

---

## Option 2: Docker Compose (Local/VPS)

You can run the entire stack locally or on a VPS using Docker Compose.

1.  **Install Docker**: Ensure Docker and Docker Compose are installed.
2.  **Configure Env**:
    - Update `docker-compose.yml` or create a `.env` file with your credentials.
    - Specifically, ensure `FIREBASE_CREDENTIALS_JSON` is handled (either mount the file or pass string).
3.  **Run**:
    ```bash
    docker-compose up --build -d
    ```
4.  **Access**:
    - Frontend: `http://localhost:3000`
    - Backend: `http://localhost:8000`

---

## Important Configuration Notes

### Firebase Credentials
The backend expects `FIREBASE_CREDENTIALS_JSON` to be either:
1.  A **path** to a file (valid for local dev or volume mounts).
2.  A **JSON string** (valid for cloud deployments where you paste the content into an env var).

### CORS & Allowed Origins
The backend defaults to stricter CORS in production. You must set `BACKEND_CORS_ORIGINS` to your frontend's domain (e.g., `https://loop-frontend.onrender.com`).

### Frontend API URL
The frontend is built with `NEXT_PUBLIC_API_BASE_URL`.
- In **Docker**, this is set in `docker-compose.yml`.
- In **Render**, `render.yaml` automatically sets this to the backend's internal URL (or public URL if configured correctly). configuration.
