# Book Store

A small, production-oriented book e-commerce site built with [Astro](https://astro.build) and TypeScript — a learning project focused on understanding *why* each architectural decision exists, not just shipping a working site.

Start with `docs/CLAUDE.md`'s parent, [`CLAUDE.md`](./CLAUDE.md), for the project's rules and documentation map. Full context lives in [`docs/`](./docs):

- [`docs/MASTER-PROJECT-SPEC.md`](./docs/MASTER-PROJECT-SPEC.md) — what the project is and what it must contain
- [`docs/AGENT-WORKFLOW.md`](./docs/AGENT-WORKFLOW.md) — how work on this repo is phased and reviewed
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — how the app is technically structured, and why
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — the visual system, extracted from Figma

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

Foundation phase (Phase 1 of `docs/AGENT-WORKFLOW.md`). Routing, the base layout, and global styles/tokens are wired up; the real UI (Header, Hero, BookCard, cart, etc.) is built in the next phase.
