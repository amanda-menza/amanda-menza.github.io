# Abroad Hub

Abroad Hub is a full-stack study-abroad program management system. It supports student applications, administrator program management, partner and faculty views, secure document handling, recommendation letters, payment tracking, prerequisite checks, Duke SSO/ULink integration, JWT authentication, and optional MFA.

## Project structure

| Path | Purpose |
| --- | --- |
| `backend/` | Django project with REST API, PostgreSQL models, authentication, permissions, ULink helpers, audit logging, and tests. |
| `backend/README.md` | Backend-specific setup, environment, API, and security notes. |
| `frontend/` | Next.js application with student, administrator, partner, authentication, profile, application, and program-management routes. |
| `guides/` | Deployment, feature, security, and backup documentation. |
| `backups/` | Shell scripts and cron config for database backup workflows. |
| `.github/workflows/` | CI or deployment automation, if enabled. |

## Core features

- Role-aware workflows for `Student`, `Administrator`, `Reviewer`, `Faculty`, and `Partner` users.
- Program creation, editing, browsing, faculty assignment, provider partner assignment, and application-count dashboards.
- Application creation, review, status changes, document upload, secure document viewing, confidential notes, and payment-status tracking.
- Recommendation-letter request and token-based public submission flow.
- ULink transcript integration and prerequisite checking.
- JWT access/refresh tokens plus Duke NetID SSO support.
- Optional TOTP MFA for non-SSO users.
- Audit logging middleware and secure media endpoints for sensitive documents.

## Backend setup

Requirements:

- Python 3.11 or newer recommended.
- PostgreSQL database.
- Environment variables listed below.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The `backend/requirements.txt` file is stored as UTF-8 so `pip` and review tools can read it normally.

## Backend environment variables

Create `backend/.env` with values appropriate for local or deployed use:

```env
SECRET_KEY=replace-me
DB_NAME=abroadhub
DB_USER=postgres
DB_PWD=replace-me
DB_HOST=localhost
DB_PORT=5432
SSO_CLIENT_ID=replace-me
SSO_REDIRECT_URL=http://localhost:3000/oauth/consume
SSO_AUTH_URL=replace-me
SSO_TOKEN_URL=replace-me
SSO_SECRET=replace-me
SSO_USER_INFO_URL=replace-me
MAILCHIMP_API_KEY=replace-me
BASE_URL=http://localhost:3000
```

The Django settings currently keep `DEBUG = True`; change that before production deployment.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The frontend expects the Django API to be available locally unless the API base URL is changed in the frontend code.

## Useful commands

Backend:

```bash
cd backend
python manage.py test
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run test
```

## API areas

The main URL configuration lives in `backend/abroadhub/urls.py`. Major endpoint groups include:

- `api/applications/` for application CRUD, status updates, payment updates, documents, notes, and recommendation letters.
- `api/programs/` for program CRUD and program-specific admin/partner views.
- `api/user-management/`, `api/current-user/`, and `api/user/profile/` for account and profile workflows.
- `api/sso-auth-redirect/` and `api/sso-token-redirect/` for SSO login.
- `api/verify-ulink-account/`, `api/connect-ulink-account/`, and `api/user-transcript/` for ULink integration.
- `api/secure-document/` and `api/secure-recommendation-letter/` for permission-checked media serving.

## Security notes

- Sensitive uploaded documents are not served directly from public media URLs.
- Secure document endpoints enforce authentication, authorization, path validation, and document-type checks.
- Recommendation-letter uploads are accessed through permission-checked endpoints or token-scoped public submission links.
- File uploads should stay size-limited and content-validated, especially for PDFs.
- Keep `.env`, media files, logs, and database backups out of git.

## Maintenance notes

- Keep `backend/requirements.txt` UTF-8 encoded so Python tooling can read it consistently.
- Keep `.DS_Store` files out of git.
- Keep `backend/media/`, logs, `.next/`, `node_modules/`, and virtual environments ignored.
- Review `guides/*.pdf` alongside their Markdown equivalents when updating operational documentation.
