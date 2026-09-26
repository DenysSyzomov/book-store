# AGENT WORKFLOW

**Project:** Book Store
**Version:** 1.0
**Purpose:** Define how AI coding agents work on this repository.

---

# 1. Purpose

This document defines the workflow every AI coding agent must follow while working on the project.

The project is developed in sequential phases.

Each agent has a limited responsibility.

Agents must not treat the repository as a blank project unless the assigned phase explicitly requires initialization.

The existing codebase is the source of truth for the current implementation state.

The documentation is the source of truth for the intended architecture and requirements.

---

# 2. Core Development Flow

Every agent follows this exact high-level process:

```text
Agent starts
      ↓
reads docs
      ↓
inspects existing project
      ↓
implements assigned scope
      ↓
tests implementation
      ↓
reports changes and concerns
      ↓
you review
      ↓
Git commit
      ↓
next agent
```

This flow must not be skipped.

The user remains the final reviewer between development phases.

---

# 3. Source of Truth

Agents must understand the difference between project requirements and implementation.

## Requirements

```text
docs/MASTER-PROJECT-SPEC.md
```

Defines what the project should contain.

## Agent process

```text
docs/AGENT-WORKFLOW.md
```

Defines how agents should work.

## Technical architecture

```text
docs/ARCHITECTURE.md
```

Defines how the application is structured.

## Visual system

```text
docs/DESIGN-SYSTEM.md
```

Defines the visual language extracted from Figma.

## Security

```text
docs/SECURITY.md
```

Defines security decisions and audit findings.

---

# 4. Rules For Every Agent

Before changing anything:

1. Read `MASTER-PROJECT-SPEC.md`.
2. Read `AGENT-WORKFLOW.md`.
3. Read relevant documentation.
4. Inspect the repository.
5. Inspect existing implementation.
6. Identify the current project state.
7. Confirm the requested scope.
8. Only then make changes.

---

# 5. Do Not Rewrite Working Code

Agents must not rewrite existing working code without a reason.

If existing code works and satisfies the specification:

```text
leave it unchanged
```

If existing code has a problem:

```text
identify the problem
explain why it matters
fix only what is necessary
```

Do not perform unrelated refactoring.

---

# 6. Scope Control

Every agent receives a specific responsibility.

The agent must only modify files required for its assigned task.

If an agent discovers an issue outside its scope:

```text
DO NOT automatically fix it.
```

Instead report:

```text
Issue discovered:
Why it matters:
Recommended next phase:
```

This prevents agents from unexpectedly changing architecture.

---

# 7. Dependency Rules

Before adding a dependency, ask:

1. Is it actually required?
2. Can Astro provide this functionality?
3. Can a browser API provide this functionality?
4. Is the dependency already installed?
5. Does the dependency increase complexity?
6. Is the dependency maintained?
7. Does the dependency introduce security or performance concerns?

Do not install dependencies simply because they are convenient.

---

# 8. Code Quality Rules

All agents should prefer:

- TypeScript
- `const`
- Explicit types for domain data
- Small focused functions
- Clear naming
- Semantic HTML
- Minimal JavaScript
- Reusable components where appropriate
- Simple architecture
- Server-side validation
- Accessible interactions

Avoid:

- `any`
- Global mutable state without a reason
- Duplicate logic
- Magic values
- Unnecessary abstractions
- Unnecessary client-side rendering
- Unnecessary dependencies
- Large monolithic components

---

# 9. Astro Rules

Astro should remain the primary application framework.

Do not introduce React, Vue, Svelte, or another UI framework unless there is a documented architectural reason.

Prefer:

```text
Astro component
      ↓
server-rendered HTML
      ↓
small client-side behavior where required
```

rather than:

```text
entire page
      ↓
client-rendered application
```

---

# 10. Data Access Rules

Components must not directly communicate with external data services.

Incorrect:

```text
BookCard.astro
      ↓
Supabase
```

Correct:

```text
BookCard.astro
      ↓
page / server logic
      ↓
src/lib/books.ts
      ↓
data source
```

The same rule applies to Sanity.

---

# 11. Agent Handoff

An agent must leave the repository in a state that the next agent can understand.

Before finishing, the agent must verify:

- What was implemented
- Which files changed
- Which architecture decisions were made
- Which tests were run
- Whether the build passes
- Whether anything remains unfinished

If architecture changed, update:

```text
docs/ARCHITECTURE.md
```

If security architecture changed, update:

```text
docs/SECURITY.md
```

If visual decisions changed, update:

```text
docs/DESIGN-SYSTEM.md
```

---

# 12. Standard Agent Completion Report

Every agent should finish with a concise report using this structure:

```text
## Implementation

- ...

## Files Changed

- ...

## Tests

- npm run check
- npm run build
- npm run lint (if available)
- Manual testing: ...

## Architecture Decisions

- ...

## Known Issues

- ...

## Next Agent

- ...
```

---

# 13. Phase Workflow

The project is developed in the following order.

---

## Phase 0 — Project Architect

### Responsibility

Define the technical architecture before implementation begins.

### Tasks

- Inspect project requirements.
- Confirm Astro architecture.
- Define folder structure.
- Define data boundaries.
- Define server/client boundaries.
- Define environment strategy.
- Define Git/Vercel architecture.
- Define major technical decisions.
- Create/update `ARCHITECTURE.md`.

### Must Not

- Build the UI.
- Implement the cart.
- Integrate Supabase.
- Integrate Sanity.
- Implement final visual design.

### Output

```text
docs/ARCHITECTURE.md
```

---

# 14. Phase 1 — Astro Foundation

### Responsibility

Create the clean Astro foundation.

### Tasks

- Initialize Astro.
- Configure TypeScript.
- Configure global styles.
- Configure basic project structure.
- Configure scripts.
- Configure `.gitignore`.
- Configure `.env.example`.
- Create base layout.
- Create initial page.
- Verify development server.
- Verify production build.

### Output

A clean working Astro application.

---

# 15. Phase 2 — Figma / Design System

### Responsibility

Analyze the provided Figma design.

### Tasks

Extract:

- Typography
- Colors
- Spacing
- Containers
- Grid
- Breakpoints
- Buttons
- Cards
- Header
- Footer
- Book slider
- Cart
- Responsive behavior
- Animation intentions

Create:

```text
docs/DESIGN-SYSTEM.md
```

### Important

This agent defines the visual system.

Other agents should use `DESIGN-SYSTEM.md` rather than repeatedly interpreting the Figma design independently.

---

# 16. Phase 3 — UI Components and Pages

### Responsibility

Build the main Astro UI.

### Tasks

Implement:

- Layout
- Header
- Footer
- Button
- Hero
- BookCard
- BookGrid
- BookSlider
- Books page
- Book detail page

Use local mock data.

Do not integrate Supabase yet.

Do not integrate Sanity yet.

---

# 17. Phase 4 — Cart

### Responsibility

Implement cart behavior.

### Tasks

- Cart state
- Add item
- Remove item
- Quantity changes
- Subtotal
- Empty state
- Drawer/popup
- Customer form
- Client validation
- Success state

The client must not be considered authoritative for product prices or stock.

---

# 18. Phase 5 — Animations and Interactions

### Responsibility

Implement:

- GSAP reveal animations
- Swiper behavior
- Required interaction polish

Requirements:

- Minimal JavaScript
- No duplicate initialization
- Respect reduced motion
- Avoid unnecessary global scripts

---

# 19. Phase 6 — SEO and Structured Data

### Responsibility

Implement:

- SEO component
- Titles
- Meta descriptions
- Canonicals
- Open Graph
- Sitemap
- Robots configuration
- Product structured data
- Organization/WebSite structured data where appropriate

Verify generated HTML.

---

# 20. Phase 7 — Supabase

### Responsibility

Replace local product data with Supabase.

### Tasks

- Create database migration.
- Create books table.
- Add constraints.
- Enable RLS.
- Create appropriate policies.
- Configure environment variables.
- Implement Supabase client.
- Update `src/lib/books.ts`.
- Preserve existing UI interfaces.
- Add data validation.
- Test database access.

The UI should not need to know that the source changed from local data to Supabase.

---

# 21. Phase 8 — Sanity CMS

### Responsibility

Integrate editorial content.

### Tasks

- Create Sanity project configuration.
- Create schemas.
- Define editorial content models.
- Configure GROQ queries.
- Create Sanity data layer.
- Replace hardcoded editorial content where appropriate.
- Preserve Supabase ownership of commercial product data.

---

# 22. Phase 9 — Security Audit

### Responsibility

Review the complete application from a security perspective.

Check:

- Environment variables
- Secrets
- Supabase RLS
- API routes
- Input validation
- Price validation
- Stock validation
- Client/server boundaries
- Third-party scripts
- Dependencies
- Headers where appropriate
- Preview/staging exposure

Create/update:

```text
docs/SECURITY.md
```

---

# 23. Phase 10 — GitHub and Vercel

### Responsibility

Configure deployment.

### Tasks

- GitHub repository workflow
- Branch strategy
- Vercel project
- Preview deployments
- Production deployment
- Environment variables
- Preview protection
- Production configuration

Production branch:

```text
main
```

---

# 24. Phase 11 — Final QA

### Responsibility

Test the complete project.

Check:

## Functional

- Homepage
- Books page
- Book detail
- Cart
- Form
- Success state

## Responsive

- Mobile
- Tablet
- Desktop
- Large desktop

## Accessibility

- Keyboard
- Focus
- Forms
- Semantic structure
- Dialog behavior
- Reduced motion

## SEO

- Metadata
- Canonical
- Sitemap
- Robots
- Structured data

## Performance

- JavaScript usage
- Images
- Unnecessary dependencies
- Client hydration
- Third-party scripts

## Security

- Secrets
- RLS
- API validation
- Client/server boundaries

## Deployment

- Preview
- Production
- Environment variables

---

# 25. Phase 12 — Teacher / Code Review

### Responsibility

Explain the finished code to the developer.

This phase is educational.

The teacher agent should:

- Explain the architecture.
- Explain Astro concepts.
- Explain TypeScript used in the project.
- Explain component structure.
- Explain data flow.
- Explain client/server boundaries.
- Explain cart implementation.
- Explain Supabase integration.
- Explain Sanity integration.
- Explain security decisions.
- Explain deployment architecture.
- Identify concepts the developer should learn next.

The teacher agent should not make unnecessary code changes.

---

# 26. Agent Order

The final sequence is:

```text
Agent 0
Project Architect
      ↓
Agent 1
Astro Foundation
      ↓
Agent 2
Figma / Design System
      ↓
Agent 3
Components and Pages
      ↓
Agent 4
Cart
      ↓
Agent 5
Animations / Interactions
      ↓
Agent 6
SEO / Structured Data
      ↓
Agent 7
Supabase
      ↓
Agent 8
Sanity
      ↓
Agent 9
Security Audit
      ↓
Agent 10
GitHub / Vercel
      ↓
Agent 11
Final QA
      ↓
Agent 12
Teacher / Code Review
```

---

# 27. Review Gate

After every agent:

```text
Agent finishes
      ↓
Tests pass
      ↓
Agent reports results
      ↓
YOU REVIEW
      ↓
Git commit
      ↓
Next agent
```

The next agent should not start until the previous phase has been reviewed and committed.

This is intentional.

It creates a stable checkpoint after every architectural phase.

---

# 28. Git Checkpoint Strategy

After each completed phase, create a commit.

Example:

```text
docs: define project architecture
```

Then:

```text
feat: initialize Astro project
```

Then:

```text
docs: add design system
```

Then:

```text
feat: implement book pages
```

Then:

```text
feat: implement cart
```

And so on.

This makes it possible to identify exactly which phase introduced a problem.

---

# 29. If an Agent Breaks Something

Do not immediately ask another agent to blindly repair it.

First:

1. Inspect the change.
2. Check the agent report.
3. Run the relevant tests.
4. Determine whether the problem is local or architectural.
5. If necessary, revert to the last known-good Git commit.
6. Fix the problem.
7. Re-run tests.
8. Commit the corrected state.

---

# 30. If Requirements Change

Requirements should not be changed silently.

If a new requirement affects architecture:

```text
update MASTER-PROJECT-SPEC.md
```

If it affects implementation structure:

```text
update ARCHITECTURE.md
```

If it affects the visual system:

```text
update DESIGN-SYSTEM.md
```

If it affects security:

```text
update SECURITY.md
```

Then continue development from the updated source of truth.

---

# 31. Agent Prompt Template

Every specialized agent should receive a prompt following this structure:

```text
ROLE

You are the [ROLE] for this project.

CONTEXT

Read:
- docs/MASTER-PROJECT-SPEC.md
- docs/AGENT-WORKFLOW.md
- relevant project documentation

GOAL

[Specific goal]

REQUIREMENTS

[List of requirements]

DO NOT

[List of prohibited actions]

FILES YOU MAY MODIFY

[List]

FILES YOU MUST NOT MODIFY

[List]

ACCEPTANCE CRITERIA

[List]

TESTING

Run:
- npm run check
- npm run build
- npm run lint if available

Also manually test the relevant functionality.

FINAL REPORT

Report:
- what changed
- files changed
- tests performed
- architecture decisions
- known issues
- recommended next phase
```

---

# 32. Global Instruction For All Agents

The following instruction should be included in every agent prompt:

```text
Before making changes, inspect the existing project.

Do not rewrite working code without a reason.

Do not introduce a library when the existing platform or browser API is sufficient.

Do not create abstractions unless they are reused.

Do not modify files outside your responsibility.

If you discover an architectural problem outside your scope, report it instead of fixing it.

After implementation:

- run type checking
- run linting if configured
- run production build
- test the relevant functionality
- report what changed
- report any remaining concerns

Do not claim a feature works unless you actually tested it.
```

---

# 33. Definition of Done For Every Agent

An agent is finished only when:

```text
[ ] Assigned scope implemented
[ ] Existing project inspected
[ ] No unrelated refactoring
[ ] TypeScript passes
[ ] Relevant tests pass
[ ] Production build passes
[ ] Documentation updated if necessary
[ ] No secrets exposed
[ ] Final report written
[ ] User can review the changes
```

---

# 34. Important Principle

Agents are not independent developers working on isolated projects.

They are sequential contributors to one codebase.

Therefore:

```text
Every agent must respect previous work.
Every agent must read project documentation.
Every agent must leave the repository understandable.
Every agent must verify its implementation.
Every phase must have a review checkpoint.
```

The project should evolve like this:

```text
Specification
      ↓
Architecture
      ↓
Foundation
      ↓
Design System
      ↓
UI
      ↓
Interactions
      ↓
SEO
      ↓
Data
      ↓
CMS
      ↓
Security
      ↓
Deployment
      ↓
QA
      ↓
Learning / Review
```

The goal is not simply to make the website work.

The goal is to build a maintainable Astro project while understanding why each architectural decision exists.
