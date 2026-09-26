# MASTER PROJECT SPECIFICATION

**Project:** Book Store
**Version:** 1.0
**Status:** Initial Blueprint
**Primary Framework:** Astro
**Language:** TypeScript
**Deployment:** Vercel
**Repository:** GitHub

---

# 1. Project Overview

This project is a small production-oriented book e-commerce website built with Astro.

The project is primarily a learning project, but it must be developed using production-quality architecture, code organization, accessibility, SEO, security, testing, Git workflow, and deployment practices.

The project will start with local mock book data and later migrate product data to Supabase.

Editorial content will later be managed through Sanity CMS.

The project does not include online payments.

The primary goal is to learn how to build a modern Astro application from an empty folder to a production deployment while understanding the architecture and code instead of treating Astro as a black box.

---

# 2. Project Goals

The project must demonstrate:

- Modern Astro architecture
- TypeScript
- Component-based development
- Semantic HTML
- Responsive design
- Accessible UI
- Client-side JavaScript only where necessary
- Server/client boundaries
- Local data → Supabase migration
- Sanity CMS integration
- Shopping cart functionality
- Form validation
- SEO
- Structured data
- Security
- Git/GitHub workflow
- Vercel deployment
- Preview/staging environments
- Production deployment
- GSAP animations
- Swiper-based book slider
- Production-oriented code quality

---

# 3. Non-Goals

The following are intentionally outside the initial project scope:

- Online payment processing
- User authentication
- User accounts
- Customer dashboards
- Product reviews
- Wishlist functionality
- Complex inventory management
- Coupons
- Discounts
- Multi-language support
- Multi-currency support
- Advanced search
- Recommendation engine
- Admin dashboard built inside Astro

These features may be considered later but must not be introduced during the initial implementation unless explicitly requested.

---

# 4. Technology Stack

## Core

- Astro
- TypeScript
- HTML
- CSS
- JavaScript

## UI

- Astro components
- Native browser APIs
- Swiper
- GSAP

## Data

Initial:

- Local TypeScript mock data

Later:

- Supabase for product/commercial data
- Sanity for editorial/content data

## Deployment

- GitHub
- Vercel

## Development

- VS Code / compatible IDE
- Git
- Node.js
- npm

---

# 5. Architectural Principles

The project must follow these principles:

1. Astro is the primary UI framework.
2. Do not introduce React, Vue, Svelte, or another UI framework without an explicit architectural reason.
3. Prefer Astro components for static and server-rendered UI.
4. Use client-side JavaScript only when interaction requires it.
5. Keep the server/client boundary explicit.
6. Components must not directly query Supabase.
7. Components must not directly query Sanity.
8. Data access belongs in `src/lib`.
9. Product data belongs to Supabase.
10. Editorial content belongs to Sanity.
11. Client-side cart state is not authoritative.
12. Prices and stock must never be trusted from the browser.
13. Server-side validation is required for order submission.
14. Secrets must never be exposed to client-side code.
15. Avoid unnecessary dependencies.
16. Prefer browser APIs when they are sufficient.
17. Avoid abstractions that are not reused.
18. Keep components focused on one responsibility.
19. Prefer clear code over clever code.
20. Every architectural decision should have a reason.

---

# 6. Project Structure

The expected project structure is:

```text
book-store/
├── docs/
│   ├── MASTER-PROJECT-SPEC.md
│   ├── AGENT-WORKFLOW.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN-SYSTEM.md
│   └── SECURITY.md
│
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Button.astro
│   │   ├── Hero.astro
│   │   ├── BookCard.astro
│   │   ├── BookGrid.astro
│   │   ├── BookSlider.astro
│   │   ├── Cart.astro
│   │   ├── CartItem.astro
│   │   ├── CartDrawer.astro
│   │   └── SEO.astro
│   │
│   ├── layouts/
│   │   └── Layout.astro
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── books/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── api/
│   │
│   ├── lib/
│   │   ├── books.ts
│   │   ├── cart.ts
│   │   ├── validation.ts
│   │   ├── supabase.ts
│   │   └── sanity.ts
│   │
│   ├── data/
│   │   └── books.ts
│   │
│   ├── types/
│   │   ├── book.ts
│   │   ├── cart.ts
│   │   └── content.ts
│   │
│   └── styles/
│       ├── global.css
│       ├── tokens.css
│       └── components/
│
├── public/
│   ├── fonts/
│   ├── icons/
│   └── favicon.svg
│
├── supabase/
│   ├── migrations/
│   └── tests/
│
├── studio/
│   ├── schemaTypes/
│   ├── sanity.config.ts
│   └── ...
│
├── .env.example
├── .gitignore
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

Agents may adjust this structure when there is a clear architectural reason.

Any structural change must be documented in `ARCHITECTURE.md`.

---

# 7. Routes

The initial website must contain:

```text
/
```

Homepage.

```text
/books
```

All books.

```text
/books/[slug]
```

Individual book detail page.

Future API endpoints may be created under:

```text
/api/*
```

API routes must only be added when required by actual functionality.

---

# 8. Homepage

The homepage must contain:

## Hero

- Main heading
- Supporting text if required by the design
- CTA button

## Book Slider

Each slide contains:

- Book image
- Book title
- Author
- Price
- CTA

The slider should use Swiper.

Swiper JavaScript must not be loaded globally when the component is not used.

## Footer

The footer must contain the required navigation/content from the design.

---

# 9. Books Page

Route:

```text
/books
```

The page must contain:

- Page heading
- Book collection/grid
- Book cards
- Links to individual book pages

Each book card should use the reusable `BookCard.astro` component.

---

# 10. Book Detail Page

Route:

```text
/books/[slug]
```

The page must contain:

- Product image
- Book title
- Author
- Description
- Price
- Availability/stock state where appropriate
- Add to cart button

The page must be generated from the book data source.

The UI must not care whether the data comes from:

- local TypeScript data
- Supabase

The data-access layer must hide that implementation detail.

---

# 11. Cart

The cart must be available from any page.

The initial cart UI should be a drawer/popup.

The cart must support:

- Add product
- Remove product
- Change quantity
- Display subtotal
- Empty-cart state
- Customer information form
- Submit order/request
- Success state

No online payment is required.

---

# 12. Cart Data Model

The client-side cart should contain only the minimum information necessary for the UI.

Example:

```ts
export interface CartItem {
  bookId: string;
  quantity: number;
}
```

The browser must not be treated as the source of truth for:

- Price
- Stock
- Product availability

Those values must be resolved from trusted server-side data when an order is submitted.

---

# 13. Book Type

The initial book model should follow this structure:

```ts
export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

The exact implementation may change after Supabase schema design.

---

# 14. Local Mock Data

Before Supabase integration, books must live in:

```text
src/data/books.ts
```

The application should access this data through:

```text
src/lib/books.ts
```

Components and pages should consume the data-access functions instead of importing mock data directly.

Example conceptual API:

```ts
getBooks();
getBookBySlug(slug);
getBookById(id);
```

This allows the data source to later change without rewriting the UI.

---

# 15. Supabase Architecture

Supabase is responsible for commercial/product data.

Supabase will manage:

- Books
- Price
- Stock
- Product image
- Active/inactive state
- Product metadata required for commerce

The first table should be:

```text
books
```

Expected fields:

```text
id
slug
title
author
description
price
image_url
stock
is_active
created_at
updated_at
```

Additional tables may be introduced later when required.

Potential future tables:

```text
orders
order_items
categories
authors
```

Do not create future tables without a concrete requirement.

---

# 16. Supabase Security

Supabase Row Level Security must be enabled on exposed tables.

Public users may only read appropriate active product data.

Public users must not receive unrestricted write access.

The Supabase service-role/secret key must never be exposed to browser JavaScript.

Environment variables must distinguish between:

```text
PUBLIC_*
```

and server-only secrets.

All server-side writes must validate:

- Product existence
- Product availability
- Quantity
- Current price
- Stock

Client-provided prices must never be trusted.

---

# 17. Sanity CMS Architecture

Sanity is responsible for editorial content.

Sanity may manage:

- Hero heading
- Hero description
- CTA labels
- Navigation labels
- Footer content
- Section headings
- SEO title
- SEO description
- Cart messages
- Empty cart message
- Success message
- Editorial text
- Other non-commercial site copy

Sanity must not become the source of truth for:

- Price
- Stock
- Inventory
- Product availability

Those belong to Supabase.

---

# 18. Content Ownership

| Content                | Owner    |
| ---------------------- | -------- |
| Hero copy              | Sanity   |
| CTA labels             | Sanity   |
| Navigation labels      | Sanity   |
| Footer content         | Sanity   |
| SEO editorial metadata | Sanity   |
| Cart messages          | Sanity   |
| Success messages       | Sanity   |
| Product title          | Supabase |
| Author                 | Supabase |
| Product description    | Supabase |
| Price                  | Supabase |
| Stock                  | Supabase |
| Product image          | Supabase |
| Active/inactive state  | Supabase |
| UI structure           | Code     |
| Business logic         | Code     |
| Accessibility behavior | Code     |
| Animations             | Code     |

---

# 19. Sanity Integration

Sanity should be integrated using the official Astro integration and GROQ queries where appropriate.

The application should access Sanity through:

```text
src/lib/sanity.ts
```

Components must not contain raw Sanity queries.

Content fetching should happen at the appropriate server/build boundary.

---

# 20. TypeScript Rules

TypeScript must be used throughout the application.

Rules:

- Avoid `any`.
- Define interfaces/types for domain data.
- Type component props.
- Type API responses.
- Type utility functions.
- Use strict TypeScript settings.
- Avoid unnecessary type assertions.
- Prefer narrowing over unsafe casts.

---

# 21. Component Rules

Components should:

- Have one clear responsibility.
- Receive typed props.
- Avoid direct database access.
- Avoid direct CMS access.
- Avoid unnecessary client-side JavaScript.
- Use semantic HTML.
- Be reusable where reuse provides actual value.

Do not create components simply to split a few lines of markup.

---

# 22. Layout

A shared layout must provide:

- `<html>`
- `<head>`
- `<body>`
- Global styles
- SEO defaults
- Global metadata
- Accessibility-related document attributes
- Shared site structure

The exact implementation should be documented in `ARCHITECTURE.md`.

---

# 23. Styling

The project must use a centralized styling system.

Global styles should define:

- CSS reset/normalize
- Typography
- Colors
- Spacing
- Container widths
- Breakpoints
- Focus styles
- Reduced-motion behavior

Design tokens should be centralized where practical.

Example:

```text
src/styles/tokens.css
```

Component-specific styles should remain close to the component unless there is a strong reason to centralize them.

---

# 24. Responsive Design

The site must work across:

- Mobile
- Tablet
- Desktop
- Large desktop

The responsive system must follow the Figma design.

Breakpoints must be documented in:

```text
docs/DESIGN-SYSTEM.md
```

Do not invent unnecessary breakpoints.

---

# 25. Accessibility

The application must follow modern accessibility practices.

Requirements include:

- Semantic HTML
- Correct heading hierarchy
- Keyboard navigation
- Visible focus states
- Accessible buttons
- Accessible links
- Accessible forms
- Form labels
- Meaningful alt text
- Proper dialog/drawer behavior
- Escape handling where appropriate
- Focus management where appropriate
- Reduced-motion support

Interactive elements must not rely exclusively on hover.

---

# 26. Animations

GSAP may be used for simple reveal animations.

Initial animation requirement:

- Elements reveal from below.
- Animation should be subtle.
- Animation must not block page interaction.
- Animation must respect `prefers-reduced-motion`.

Animations should be initialized only where needed.

Do not load GSAP globally if no animated component exists on the page.

---

# 27. Swiper

Swiper will be used for the book slider.

Requirements:

- Responsive behavior
- Keyboard accessibility where applicable
- Touch support
- Appropriate navigation
- No unnecessary global loading
- Clean initialization
- No duplicate initialization

Swiper should only be loaded when the relevant slider exists.

---

# 28. Client-Side JavaScript

JavaScript should be minimal.

Use client-side JavaScript for:

- Cart interactions
- Drawer interactions
- Form interactions
- Swiper
- GSAP
- Other functionality that cannot reasonably be implemented server-side

Do not convert static Astro pages into client-rendered applications without a concrete reason.

---

# 29. SEO

Every indexable page must have:

- Unique `<title>`
- Unique meta description
- Canonical URL
- Correct heading hierarchy
- Open Graph metadata
- Twitter/X metadata where appropriate
- Descriptive URLs
- Proper image alt text

The project must use the official Astro sitemap integration.

A sitemap must be generated for production.

---

# 30. Structured Data

Structured data should be implemented where appropriate.

Homepage may contain:

- Organization
- WebSite

Book detail pages should use appropriate `Product` structured data.

Where appropriate, product data should include:

- Name
- Image
- Description
- Price
- Currency
- Availability

Structured data must represent visible page content accurately.

Do not add schema simply for the sake of adding schema.

---

# 31. Robots and Indexing

Production:

- Publicly indexable
- Valid robots configuration
- Sitemap available

Preview/staging:

- Must not be publicly indexable
- Must use appropriate access protection
- Must include `noindex` where appropriate

`robots.txt` alone must not be treated as a security mechanism.

---

# 32. Security

Security requirements:

- Never commit secrets.
- Never expose server-only environment variables.
- Never expose Supabase service-role keys.
- Validate all external input.
- Validate customer form data.
- Validate quantities.
- Validate product IDs.
- Validate product availability.
- Recalculate prices on the server.
- Do not trust browser state.
- Protect API endpoints.
- Prevent unrestricted database writes.
- Enable Supabase RLS.
- Keep dependencies updated.
- Avoid unnecessary third-party scripts.

Security decisions must be documented in:

```text
docs/SECURITY.md
```

---

# 33. Environment Variables

Environment variables must be documented in:

```text
.env.example
```

No real credentials may be committed.

Example categories:

```text
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_API_VERSION
SANITY_TOKEN
```

Only variables that genuinely need to exist should be added.

Server-only variables must never be imported into client-side code.

---

# 34. Git Workflow

The primary branches are:

```text
main
feature/*
```

`main` represents production-ready code.

Development happens on feature branches.

Workflow:

```text
feature branch
      ↓
implementation
      ↓
tests
      ↓
review
      ↓
commit
      ↓
push
      ↓
merge into main
      ↓
production
```

Suggested commit format:

```text
docs: add project specification
docs: define project architecture
feat: initialize Astro project
feat: implement design system
feat: implement book pages
feat: implement cart
feat: integrate Supabase
feat: integrate Sanity
chore: configure deployment
fix: resolve security audit findings
```

---

# 35. Vercel Environments

The project must use separate environments where appropriate.

Conceptually:

```text
Production
    ↓
main
    ↓
public Vercel deployment

Preview
    ↓
feature branches / pull requests
    ↓
protected preview deployment
```

Preview environments must not accidentally expose production secrets or production-only functionality.

Environment variables must be configured separately for the appropriate environments.

---

# 36. Testing

Every implementation phase must perform appropriate testing.

Minimum checks:

```bash
npm run check
npm run build
```

If linting is configured:

```bash
npm run lint
```

Relevant functionality must also be manually tested.

Examples:

- Navigation
- Responsive layout
- Book links
- Book detail pages
- Cart behavior
- Form validation
- API endpoints
- Supabase access
- Sanity content
- SEO
- Accessibility
- Production build

---

# 37. Documentation

The repository must contain:

```text
docs/
├── MASTER-PROJECT-SPEC.md
├── AGENT-WORKFLOW.md
├── ARCHITECTURE.md
├── DESIGN-SYSTEM.md
└── SECURITY.md
```

Each document has a specific responsibility.

### MASTER-PROJECT-SPEC.md

Defines what the project is.

### AGENT-WORKFLOW.md

Defines how agents work on the project.

### ARCHITECTURE.md

Defines how the application is technically structured.

### DESIGN-SYSTEM.md

Defines the visual system extracted from Figma.

### SECURITY.md

Defines security architecture and audit findings.

---

# 38. Agent Development Flow

Every development phase follows the same workflow:

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

No agent should skip the documentation and inspection stages.

No agent should assume that previous implementation is correct without checking it.

---

# 39. Agent Rules

Every agent must:

1. Read `MASTER-PROJECT-SPEC.md`.
2. Read `AGENT-WORKFLOW.md`.
3. Read relevant project documentation.
4. Inspect the existing code before changing it.
5. Understand the current project state.
6. Modify only files within its responsibility.
7. Avoid unrelated refactoring.
8. Avoid unnecessary dependencies.
9. Run relevant tests.
10. Run a production build when appropriate.
11. Report what changed.
12. Report what was tested.
13. Report unresolved issues.
14. Stop when its assigned scope is complete.

---

# 40. Definition of Done

A feature is considered complete when:

- The implementation matches the specification.
- TypeScript passes.
- Production build passes.
- Relevant functionality works.
- Responsive behavior works.
- Accessibility requirements are satisfied.
- SEO requirements are satisfied where applicable.
- No unnecessary dependencies were introduced.
- No secrets were exposed.
- No unrelated files were modified.
- Documentation is updated when architecture changed.
- The agent has reported its work.
- The user has reviewed the changes.
- Changes have been committed to Git.

---

# 41. Project Completion Criteria

The project is considered production-ready when:

- All required pages exist.
- The Figma design has been implemented.
- Components are reusable and maintainable.
- Cart functionality works.
- Supabase integration works.
- Sanity integration works.
- Server/client boundaries are correct.
- Security audit passes.
- SEO audit passes.
- Accessibility audit passes.
- Production build passes.
- Vercel production deployment works.
- Preview/staging deployment is protected.
- Documentation is complete.
- No known critical issues remain.

---

# 42. Current Project Status

Status as of Agent 11 (Final QA), 2026-09-26:

```text
[✓] Project concept defined
[✓] Architecture direction defined
[✓] Data ownership defined
[✓] Agent workflow defined
[✓] Astro project initialized
[✓] Figma analyzed
[✓] Design system documented
[✓] Components implemented
[✓] Pages implemented
[✓] Cart implemented
[✓] Supabase integrated
[✓] Sanity integrated
[✓] SEO completed
[✓] Accessibility audit completed
[✓] Security audit completed
[ ] Vercel configured — vercel.json + @astrojs/vercel adapter exist and
    build correctly, but this has not been verified against a real
    deployment (see below)
[ ] Production deployment completed — no git repository exists yet
    (`git status` → "not a git repository"), so Phase 10 (GitHub/Vercel)
    has not actually shipped anything; there is nothing to deploy from
[✓] Final QA completed — full functional/responsive/accessibility/
    performance/SEO/security/code-quality/CMS audit performed against
    the local build (docs/AGENT-WORKFLOW.md §24). Two real defects
    fixed in this phase (missing phone/notes field-error UI in the
    checkout form; stale form errors surviving a drawer close). Two
    real gaps found and left unfixed as architectural/design decisions
    for a future phase: no web fonts are actually loaded anywhere
    (Cormorant Garamond/Inter silently fall back to Georgia/system-ui —
    see docs/DESIGN-SYSTEM.md's Typography section vs. what the browser
    actually renders), and Header.astro has no mobile navigation
    pattern (see docs/DESIGN-SYSTEM.md's Responsive Behavior addendum).
    Live-deployment-only checks (actual HTTP response headers, Vercel
    Preview protection, real cross-device testing) could not be
    performed — no deployment exists yet (see the two unchecked items
    above).
```

This document is the project's primary functional and architectural specification.

When requirements change, update this document deliberately rather than allowing requirements to exist only inside agent conversations.
