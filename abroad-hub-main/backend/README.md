# Abroad Hub Backend

This Django backend exposes the REST API for Abroad Hub. It owns user/role data, programs, applications, documents, recommendation letters, SSO/ULink integration, MFA, permissions, media access, and audit logging.

## Tech stack

- Django 5.1
- Django REST Framework
- PostgreSQL
- Simple JWT
- django-otp for TOTP MFA
- django-cors-headers
- Mailchimp Transactional/Mandrill hooks for email-related workflows

## Directory guide

| Path | Purpose |
| --- | --- |
| `backend/settings.py` | Django settings, installed apps, database config, auth config, CORS, media, email, and logging. |
| `backend/urls.py` | Project-level URL routing. |
| `abroadhub/models.py` | Domain models for users, profiles, programs, applications, notes, documents, and recommendation letters. |
| `abroadhub/serializers.py` | API serialization and validation. |
| `abroadhub/views.py` | API viewsets, SSO/ULink handlers, secure media endpoints, and dashboard data. |
| `abroadhub/urls.py` | App-level API route map. |
| `abroadhub/authentication.py` | JWT/NetID authentication helpers. |
| `abroadhub/permissions.py` | Role and object access rules. |
| `abroadhub/mfa/` | MFA-specific views. |
| `audit_logging/` | Request audit middleware. |
| `abroadhub/tests/` | Unit and URL/permission tests. |

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The `requirements.txt` file is UTF-8 encoded so `pip` and review tools can read it normally.

## Required environment

Create `.env` in this folder:

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

## Common commands

```bash
python manage.py test
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py initialize_default_data
python manage.py update_application_status
```

## API responsibilities

- Application lifecycle: create, update, review, status change, payment status, document upload, document retrieval, notes, and recommendation letters.
- Program lifecycle: create, update, browse, assign faculty/partners, track payment, and count applications.
- User lifecycle: profile updates, password changes, user management, role changes, MFA, and SSO-backed identity.
- Integrations: ULink account verification, transcript fetching, prerequisite checking, and SSO token exchange.
- Secure media: permission-checked document and recommendation-letter serving.

## Security and production notes

- Set `DEBUG = False` for production.
- Keep `.env`, media files, audit logs, backups, and generated static files out of git.
- Review `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `STATIC_ROOT`, and `MEDIA_ROOT` for each deployment environment.
- `SECRET_KEY`, database credentials, SSO secrets, and Mailchimp API keys must come from the environment.
- Preserve the secure document endpoints instead of exposing uploaded media directly.
