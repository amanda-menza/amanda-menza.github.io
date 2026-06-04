# Abroad Hub Frontend

This is the Next.js frontend for Abroad Hub. It provides the public landing/login flows plus authenticated student, administrator, partner, profile, program, application, payment, recommendation-letter, MFA, and ULink pages.

## Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Vitest and Testing Library
- Axios-based API calls to the Django backend

## Directory guide

| Path | Purpose |
| --- | --- |
| `src/app/` | Route tree for public pages, auth flows, dashboards, profile pages, program pages, and application pages. |
| `src/components/` | Reusable domain components such as application forms, program tables, profile forms, MFA settings, transcript display, and upload widgets. |
| `src/components/ui/` | Shared UI primitives built on Radix/Tailwind conventions. |
| `src/types/` | Shared TypeScript model definitions. |
| `src/constants.js` | Token/local-storage key constants. |
| `__tests__/` | Component and page tests using Vitest and Testing Library. |
| `public/` | Static assets served by Next.js. |

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run the Django backend separately from `../backend` so authenticated pages and API-driven flows can load real data.

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Create production build
npm run start    # Serve the production build
npm run test     # Run Vitest tests
```

The `lint` script currently calls `next lint`, which is no longer available in newer Next.js releases. Prefer using ESLint directly or update the script before relying on it in CI.

## Main route groups

- `/login`, `/signup`, `/logout`, `/sso/login`, and `/oauth/consume` handle authentication.
- `/dashboard` contains student application, program browsing, enrolled-program, and profile workflows.
- `/administrator/dashboard` contains program management, application review, user management, graphics, and admin profile workflows.
- `/partner` contains partner-scoped program and profile workflows.
- `/recommendation-letter/submit/[id]/[token]` handles token-based public recommendation-letter submission.
- `/ulink-connect` and profile ULink routes connect accounts and transcript/prerequisite data.

## Testing

```bash
npm run test
```

Tests are colocated in `__tests__/` and cover forms, tables, auth pages, dashboard pages, status badges, sidebars, and route-level behavior. Keep tests focused on user-visible states and API contract assumptions.

## Development notes

- Keep reusable table/form/display logic in `src/components/` rather than duplicating it inside route files.
- Keep generated `.next/`, coverage output, and `node_modules/` out of git.
- Coordinate API changes with `../backend/abroadhub/urls.py`, serializers, and views.
- Use `ProtectedRoute` and `ProtectedRole` for pages that require authentication or role constraints.
