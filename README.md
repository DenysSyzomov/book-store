# Book Store

A small, production-oriented book e-commerce site built with [Astro](https://astro.build) and TypeScript — a learning project focused on understanding *why* each architectural decision exists, not just shipping a working site.

Start with [`CLAUDE.md`](./CLAUDE.md) for the project's rules and documentation map. Full context lives in [`docs/`](./docs):

- [`docs/MASTER-PROJECT-SPEC.md`](./docs/MASTER-PROJECT-SPEC.md) — what the project is and what it must contain
- [`docs/AGENT-WORKFLOW.md`](./docs/AGENT-WORKFLOW.md) — how work on this repo is phased and reviewed
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — how the app is technically structured, and why
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — the visual system, extracted from Figma
- [`docs/SECURITY.md`](./docs/SECURITY.md) — security architecture and audit findings
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — Git workflow, Vercel environments, and the deployment checklist

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values locally — see below
npm run dev             # http://localhost:4321
```

## Environment variables

Documented in full (with the reasoning behind each one) in [`.env.example`](./.env.example). Never commit `.env` — copy the example file locally and fill in real values there. Names only, no values, ever belong in source control or in this table:

| Variable                     | Exposed to browser? | Used by                                       |
| ----------------------------- | -------------------- | ---------------------------------------------- |
| `PUBLIC_SITE_URL`              | Yes                  | Canonical/OG/sitemap URLs (`src/lib/seo.ts`)   |
| `PUBLIC_SUPABASE_URL`          | Yes                  | `src/lib/supabase.ts`                          |
| `PUBLIC_SUPABASE_ANON_KEY`     | Yes                  | `src/lib/supabase.ts`                          |
| `PUBLIC_SANITY_PROJECT_ID`     | Yes                  | `src/lib/sanity.ts`                            |
| `PUBLIC_SANITY_DATASET`        | Yes                  | `src/lib/sanity.ts`                            |
| `SUPABASE_SERVICE_ROLE_KEY`    | **No — server-only** | Reserved; not read by any code yet             |
| `SANITY_TOKEN`                 | **No — server-only** | Reserved; not read by any code yet             |
| `RESEND_API_KEY`               | **No — server-only** | Order notification email (`src/lib/notifications.ts`) |
| `ORDER_NOTIFICATION_EMAIL`     | **No — server-only** | Order notification email (`src/lib/notifications.ts`) |
| `VERCEL_ENV`                   | No (server-only)     | Set automatically by Vercel — nothing to configure |

## Git workflow

- `main` is production — every commit on `main` is deployable and maps to the Vercel Production environment.
- All work happens on `feature/*` branches, opened as a pull request into `main`.
- See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the full branching, environment, and deployment-protection setup.

## Commands

Run from the project root:

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server at `localhost:4321` |
| `npm run build` | Type-check via `astro check`, then build to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run `astro check` (TypeScript + template diagnostics) on its own |
| `npm run format` | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing changes |

## Status

Phase 10 of `docs/AGENT-WORKFLOW.md` (GitHub / Vercel). Phases 0–9 are complete — UI, cart, animations, SEO, Supabase, Sanity, and the security audit are all implemented and documented. This phase adds version control and the deployment pipeline; Phase 11 (Final QA) follows once a real deployment exists to test against.
