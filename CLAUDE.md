# CLAUDE.md

## Project

This is a production-oriented learning project: a small book e-commerce website built with Astro and TypeScript.

The project is designed to teach and demonstrate modern frontend architecture, not just to produce a working website.

---

## Source of Truth

Before making any changes, read these documents:

- `docs/MASTER-PROJECT-SPEC.md` — what the project is and what it must contain.
- `docs/AGENT-WORKFLOW.md` — how agents must work on the project.
- `docs/ARCHITECTURE.md` — how the project is technically structured, when available.
- `docs/DESIGN-SYSTEM.md` — visual system extracted from Figma, when available.
- `docs/SECURITY.md` — security architecture and audit findings, when available.

Do not duplicate or redefine requirements from these documents here.

If this file conflicts with a more detailed project document, the detailed project documentation takes precedence unless the conflict concerns one of the non-negotiable rules below.

---

## Non-Negotiable Rules

1. Astro is the primary UI framework.
2. Use TypeScript throughout the project.
3. Do not introduce React, Vue, Svelte, or another framework without a documented architectural reason.
4. Prefer server-rendered Astro components and minimal client-side JavaScript.
5. Components must not directly query Supabase.
6. Components must not directly query Sanity.
7. External data access belongs in `src/lib`.
8. Supabase owns commercial/product data.
9. Sanity owns editorial/content data.
10. Never expose server-only secrets to the browser.
11. Never expose Supabase service-role credentials to client-side code.
12. Never trust client-provided prices or stock.
13. Validate external input on the server.
14. Do not add dependencies without a clear reason.
15. Do not rewrite working code without a reason.
16. Do not perform unrelated refactoring.
17. Do not modify files outside the assigned scope unless required.
18. If an architectural problem is discovered outside the current scope, report it instead of silently fixing it.
19. Keep accessibility, SEO, security, and responsive behavior in mind for every relevant implementation.
20. Do not claim that something works unless it has been tested.

---

## Agent Workflow

Every agent follows this workflow:

```text
Agent starts
      ↓
reads docs
      ↓
inspects existing project
      ↓
implements assigned scope
      ↓
tests
      ↓
reports changes and concerns
      ↓
you review
      ↓
Git commit
      ↓
next agent
```

Do not skip the documentation or inspection steps.

Do not automatically continue into the next project phase after completing the assigned task.

---

## Before Coding

Always:

1. Read the relevant project documentation.
2. Inspect the existing implementation.
3. Understand the current project state.
4. Confirm the assigned scope.
5. Identify dependencies and architectural constraints.
6. Only then make changes.

---

## After Coding

Always:

- Run TypeScript checks.
- Run linting if configured.
- Run the production build.
- Test the relevant functionality.
- Check for unintended side effects.
- Report changed files.
- Report tests performed.
- Report known issues or open questions.

---

## Scope

Work only on the task assigned to the current agent.

Do not:

- redesign unrelated components;
- refactor unrelated code;
- change architecture without documenting the reason;
- install unnecessary dependencies;
- modify project requirements silently.

When a change affects architecture, update the appropriate documentation.

---

## Documentation Hierarchy

Use the documentation according to its purpose:

```text
CLAUDE.md
    ↓
project entry point and non-negotiable rules

MASTER-PROJECT-SPEC.md
    ↓
what the project must be

AGENT-WORKFLOW.md
    ↓
how agents must work

ARCHITECTURE.md
    ↓
how the application is structured

DESIGN-SYSTEM.md
    ↓
how the interface should look

SECURITY.md
    ↓
how security is implemented
```

Keep this file short.

The detailed knowledge belongs in `docs/`.

---

## Final Principle

The goal is not only to make the website work.

The goal is to build a maintainable, secure, accessible, SEO-friendly Astro application while understanding why each architectural decision exists.
