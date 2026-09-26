# ARCHITECTURE

**Project:** Book Store
**Version:** 2.0
**Status:** Proposed — awaiting your approval before Phase 1 begins
**Audience:** Both the project's technical source of truth (per `CLAUDE.md`'s documentation hierarchy) **and** a teaching document. You know HTML/CSS well and have basic JavaScript — every non-trivial decision below explains _what it does_, _why it exists_, _why we're choosing it_, _what the alternatives were_, and _what breaks if it's done wrong_, so you understand the reasoning, not just the result.

Do not start implementing from this document yet. It is a proposal. Once you approve it (or ask for changes), Phase 1 (Astro Foundation) begins from the structure defined here.

---

# 1. Recommended Project Architecture

## The shape of the system

```text
                    ┌─────────────────────────────┐
                    │        Browser (client)      │
                    │  HTML + CSS + small JS islands│
                    └───────────────┬───────────────┘
                                    │ requests page / calls /api/*
                                    ▼
                    ┌─────────────────────────────┐
                    │   Astro app on Vercel         │
                    │   (server-rendered, islands)  │
                    │                                │
                    │   pages/*.astro ──► src/lib/*  │
                    │   pages/api/*.ts ──► src/lib/* │
                    └───────┬───────────────┬────────┘
                            │               │
                            ▼               ▼
                    ┌───────────────┐ ┌───────────────┐
                    │   Supabase     │ │    Sanity      │
                    │ (books, price, │ │ (hero copy,    │
                    │  stock, orders)│ │  nav, footer,  │
                    │                │ │  CTA labels)   │
                    └───────────────┘ └───────────────┘
```

Today, before Supabase/Sanity exist, the two boxes on the right are replaced by a single local file: `src/data/books.ts`. Nothing above that boundary changes when they're added later — that's the whole point of the data-access layer (§7).

## The core decision: Astro islands, server-rendered by default

**What it does:** Astro renders every page to plain HTML on the server (at build time when possible, at request time when not). JavaScript is added only to the specific elements that need it — a "hydrated island" — not to the whole page.

**Why it exists:** A book store is mostly _content_: book covers, titles, prices, descriptions. None of that needs JavaScript to display. Only a handful of things are truly interactive: the cart drawer, the quantity stepper, the slider, a reveal animation. Shipping a JavaScript framework to run the whole page just to display text and images is wasted bytes the visitor has to download, parse, and execute before they can even read the page.

**Why we're choosing it:** It directly satisfies the project's own non-negotiable rules (`CLAUDE.md` #1, #3, #4) and it's the natural fit for a catalog/content site. It also happens to be the best possible teaching setup for someone coming from HTML/CSS: an `.astro` file _is_ HTML with a `<script>`-like frontmatter, so the mental model transfers almost directly, and you add JavaScript only where you can point to a specific reason ("this element needs to react to a click").

**Alternatives considered:**

- **Full React/Next.js SPA** — rejected outright by the project's own non-negotiable rules, and it would mean shipping a JS framework runtime to render static book listings, which is the opposite of what this project is trying to teach.
- **Fully static site (Astro `output: 'static'`) with client-side Supabase calls** — simpler to deploy, but it pushes price/stock validation into the browser, which is exactly what we're not allowed to trust (§10). It also can't run a real server-side order-validation endpoint.
- **Traditional Node/Express backend + separate frontend** — far more moving parts (two deployments, two languages of config, CORS) for no benefit at this scale; Astro's own API routes already give us a server.

**What goes wrong if implemented incorrectly:** If islands aren't scoped tightly (e.g. wrapping a whole page in `client:load` "just to be safe"), you silently end up with the "SPA problem" anyway — a heavy JS bundle on every page — while believing you're using Astro correctly. The fix isn't a tool, it's discipline: every `client:*` directive should be justifiable by pointing at a specific interaction (see §5's responsibility map).

---

# 2. Folder Structure

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
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   └── Footer.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── IconButton.astro
│   │   │   ├── SectionHeading.astro
│   │   │   └── QuantityStepper.astro
│   │   ├── book/
│   │   │   ├── BookCard.astro
│   │   │   ├── BookGrid.astro
│   │   │   ├── BookSlider.astro
│   │   │   └── BookMetadataTable.astro
│   │   ├── cart/
│   │   │   ├── CartDrawer.astro
│   │   │   ├── CartItem.astro
│   │   │   ├── CartSummary.astro
│   │   │   └── CustomerForm.astro
│   │   ├── Hero.astro
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
│   │       └── cart/
│   │           ├── validate.ts
│   │           └── submit.ts
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
│   │   ├── order.ts
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
│   └── sanity.config.ts
│
├── .env.example
├── .gitignore
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

**What it does:** Groups files by _what they are_ (`ui/`, `book/`, `cart/`, `layout/`) rather than dumping every component into one flat `components/` folder.

**Why it exists:** Once a project has more than ~8-10 components, a flat folder stops being scannable — you have to read filenames carefully to know if `Button.astro` is a page-level thing or a tiny primitive. Grouping tells you that at a glance.

**Why we're choosing it:** This project's own component list (from `DESIGN-SYSTEM.md`) already spans four clear categories — generic UI primitives, book-specific pieces, cart-specific pieces, and page skeleton (header/footer). The grouping falls out naturally; we're not inventing categories for their own sake.

**Alternatives considered:** A flat `src/components/` (simpler for a _very_ small project, but this one will grow past ~12 components once cart, SEO, and metadata pieces exist); grouping by _page_ instead of by _type_ (e.g. `components/home/`, `components/books/`) — rejected because `BookCard` is used on three different pages, so page-based grouping would force an awkward "where does the shared thing live" decision immediately.

**What goes wrong if implemented incorrectly:** Over-grouping (a folder per component) adds navigation overhead for no benefit at this size. Under-grouping (flat forever) becomes a "junk drawer" that new contributors (including future-you) can't navigate without `grep`. The folder structure above is sized for _this_ project's actual component count, not a generic template.

---

# 3. Component Hierarchy

```text
Layout.astro                             ← <html>, <head>, SEO.astro, global styles
 ├── Header.astro                        ← brand, nav, cart trigger (Bag + count)
 ├── <slot />                            ← page content goes here
 └── CartDrawer.astro   (client:load)    ← mounted once, available on every page
      ├── CartItem.astro × N
      ├── CartSummary.astro
      └── CustomerForm.astro             ← shown after "Checkout" is pressed

index.astro (uses Layout)
 ├── Hero.astro
 ├── SectionHeading.astro
 ├── BookSlider.astro   (client:visible)
 │    └── BookCard.astro × N
 └── Footer.astro

books/index.astro (uses Layout)
 ├── SectionHeading.astro
 ├── BookGrid.astro
 │    └── BookCard.astro × N
 └── Footer.astro

books/[slug].astro (uses Layout)
 ├── Breadcrumbs (inline, small enough not to need its own file)
 ├── Purchase details block
 │    ├── QuantityStepper.astro   (client:idle)
 │    └── Button.astro  ("Add to bag")
 ├── BookMetadataTable.astro
 ├── SectionHeading.astro
 ├── BookGrid.astro (related books)
 │    └── BookCard.astro × N
 └── Footer.astro
```

**What it does:** Defines parent → child ownership: who renders whom, and who owns state vs. who just displays props.

**Why it exists:** Without an explicit hierarchy, it's tempting to let any component reach into `localStorage` or fire a fetch directly. A clear hierarchy tells you: `BookCard` is _purely presentational_ (it receives a `Book` object and renders it — it never fetches anything itself), while `CartDrawer` is the one place cart state is actually read and written.

**Why we're choosing it:** `BookCard` is reused in three different contexts (slider, grid, related-books) with three different parents. Keeping it "dumb" (props in, HTML out) is what makes that reuse trivial — the parent decides _which_ books to pass, `BookCard` doesn't know or care where it's being rendered.

**Alternatives considered:** Letting each page independently fetch and render its own book markup (no shared `BookCard`) — rejected, this is the literal definition of the duplicate logic `AGENT-WORKFLOW.md` §8 tells us to avoid, and `DESIGN-SYSTEM.md` confirms the three usages are pixel-identical.

**What goes wrong if implemented incorrectly:** If `BookCard` starts reading cart state or fetching data itself "for convenience," it stops being reusable and testable in isolation, and you get subtle bugs where the slider's copy of the card behaves differently from the grid's copy after an edit to one but not the other.

---

# 4. Data Model

## `Book` (extended from `MASTER-PROJECT-SPEC.md` §13 based on what Figma actually shows)

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
  category: string; // required — drives breadcrumbs + "related books"
  format?: string; // e.g. "Hardcover"
  publisher?: string;
  publishedAt?: string;
  pageCount?: number;
  isbn?: string;
  dimensions?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

**Why the extension:** The book-detail page in Figma shows publisher, ISBN, page count, dimensions, and language — fields the spec's baseline type didn't include. The spec itself says this type "may change after Supabase schema design" (§13), so this isn't a scope change, it's using that explicit escape hatch. `category` is the one _required_ addition — without it, breadcrumbs ("Books / Fiction /") and "You may also like" (same-category books) have nothing to query on.

## `CartItem` (unchanged from spec §12 — this is deliberate, see §6)

```ts
export interface CartItem {
  bookId: string;
  quantity: number;
}
```

## `Order` (new — needed for the "submit order" feature, not previously modeled)

```ts
export interface OrderItem {
  bookId: string;
  quantity: number;
  // price is intentionally NOT stored here from the client —
  // the server looks it up again at submission time (see §10)
}

export interface OrderInput {
  customerName: string;
  email: string;
  phone?: string;
  notes?: string;
  items: OrderItem[];
}
```

**Why it exists:** MASTER-PROJECT-SPEC §11 requires a customer-information form and order submission, but no such form appears in the Figma file (`DESIGN-SYSTEM.md` open question #7), so its exact fields aren't derivable from design. This is a minimal, defensible shape (name + email + optional phone/notes) that unblocks Phase 4 without inventing UI that isn't specified. **Where the order is persisted (Supabase `orders` table vs. an email notification vs. both) is deliberately left open here** — that's a Phase 7 decision once Supabase is wired up, and deciding it now would be designing ahead of the phase that owns it (`AGENT-WORKFLOW.md` §6).

## `ContentBlock` (Sanity-owned editorial fields, per the Content Ownership table in the spec)

```ts
export interface HomeContent {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroCtaLabel: string;
  heroSecondaryCtaLabel: string;
}

export interface SiteContent {
  navLabels: string[];
  footerDescription: string;
  footerColumns: {
    heading: string;
    links: { label: string; href: string }[];
  }[];
  cartEmptyMessage: string;
  orderSuccessMessage: string;
}
```

**Why this split exists (and must stay a hard boundary):** `Book` and `Order` describe _things that must be commercially correct_ — a wrong price or stock number costs real money and trust. `HomeContent`/`SiteContent` describe _words a marketer might want to change on a Tuesday afternoon_ — a typo in the hero heading is a copy edit, not a financial risk. That's the actual reason Supabase owns one and Sanity owns the other (§8 below), not an arbitrary rule.

---

# 5. Client/Server Responsibility Map

| Concern                                         | Runs on                                              | Why                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Page HTML (layout, book listings, book detail)  | **Server**, prerendered at build                     | Fast first paint, works with JS disabled, crawlable for SEO                                           |
| Reading book data (`getBooks`, `getBookBySlug`) | **Server** (build or request time)                   | Never expose Supabase queries or keys to the browser                                                  |
| Cart contents (add/remove/change quantity)      | **Client** (`localStorage`)                          | Needs instant feedback with zero network round-trips while browsing                                   |
| Cart badge count in header                      | **Client**, small script after hydration             | The server-rendered header can't know client-only cart state at request time                          |
| Price/stock shown while browsing                | **Server**-sourced (baked into the prerendered HTML) | Same trust boundary as any other book data                                                            |
| Price/stock **re-validation** before checkout   | **Server** (`/api/cart/validate`)                    | The client's copy of the price can be stale or tampered with — never trusted                          |
| Order submission                                | **Server** (`/api/cart/submit`)                      | Must validate input and (eventually) write to a trusted store                                         |
| Slider (Swiper)                                 | **Client** island (`client:visible`)                 | Needs touch/drag DOM APIs that don't exist on the server                                              |
| Reveal animation (GSAP)                         | **Client**, tiny scoped script                       | Purely presentational; must also respect `prefers-reduced-motion`, which is a client-only media query |
| SEO tags / JSON-LD                              | **Server**, baked into initial HTML                  | Must be present without JS execution for crawlers to read it                                          |

**What goes wrong if this map isn't followed:** The single most damaging mistake would be moving "price/stock re-validation" to the client — e.g. trusting a `price` field the browser sends back at checkout. That turns "no online payments" from a scope simplification into an active vulnerability, because _nothing_ would stop a request from claiming a $0 price for every item.

---

# 6. State Management for the Cart

**What it does:** `src/lib/cart.ts` holds cart state as `CartItem[]` in `localStorage`, with a tiny pub/sub (a `CustomEvent` dispatched on `window` whenever the cart changes) so the header badge and the drawer can both react without polling.

**Why it exists:** The cart has to survive page navigation (it's "available from every page" per the spec) without a server round-trip on every add/remove, and it has to be visible in two independent places (header badge, drawer) that both need to react to the same change.

**Why we're choosing it:** The actual state is tiny — an array of `{ bookId, quantity }` — and the only consumers are two components on the same page. That's a textbook case for "the platform is already enough": `localStorage` + one `CustomEvent` is maybe 30 lines of code, has zero dependencies, and — importantly for the teaching goal — is entirely readable with the JavaScript you already know, no library-specific concepts to learn first.

**Alternatives considered:**

- **A state library (Redux, Zustand, nanostores)** — each solves problems this project doesn't have: multiple deeply-nested components needing the same slice of state, complex derived state, time-travel debugging. Pulling one in here would violate `CLAUDE.md` rule #14 ("do not add dependencies without a clear reason") — there is no such reason at this scale.
- **A server-side session cart (cookie + server memory/DB)** — over-engineered for a no-accounts, no-payment store; it would also mean every "add to cart" click needs a network request, hurting the snappy feel the design implies.
- **React Context** — not applicable; Astro components aren't React, and pulling in a framework just for this would violate the project's most fundamental rule.

**What goes wrong if implemented incorrectly:**

- Storing the **price** inside `CartItem` (instead of just `bookId` + `quantity`) means a book's price changing after it's added to someone's cart shows them a stale number — and worse, invites exactly the "trust the client's price" bug from §10 if a developer later wires the checkout button to read that stored price instead of re-validating.
- Forgetting the `CustomEvent` broadcast means the header badge and the drawer can silently disagree with each other (e.g. badge says "3", drawer shows 2 items) after any change — a classic "two sources of truth" bug.
- Not guarding `localStorage` access (it can throw in private browsing or be unavailable) — every read/write should be wrapped so a blocked-storage browser degrades to "empty cart" instead of a crashed page.

---

# 7. Supabase Integration Strategy

**What it does:** Supabase (hosted Postgres + auto-generated APIs) becomes the source of truth for the `books` table — price, stock, active/inactive — replacing `src/data/books.ts` without changing anything above `src/lib/books.ts`.

**Why it exists:** Commercial data needs constraints a flat TypeScript file can't enforce (e.g. "stock can never go negative"), needs to be editable without a code deploy, and eventually needs row-level access rules (only active products are publicly readable).

**Why we're choosing it (as opposed to building this differently):**

- **All reads go through `src/lib/books.ts`**, which runs **server-side only** (inside prerendering/build or inside an API route). The browser never talks to Supabase directly — no `@supabase/supabase-js` import ever appears inside an `.astro` component's client-side script or inside a `client:*` island.
- **Row Level Security (RLS) is enabled from the first migration**, with exactly one public policy: `SELECT` where `is_active = true`. No public `INSERT`/`UPDATE`/`DELETE` policy exists at all — writes only ever happen through server code using the service-role key.
- **`SUPABASE_SERVICE_ROLE_KEY` lives only in server environment variables** (Vercel project settings, never a `PUBLIC_*` var, never committed) and is read only inside `src/lib/supabase.ts`.
- `supabase/migrations/` holds the SQL that creates the `books` table with real constraints: `price NUMERIC CHECK (price >= 0)`, `stock INTEGER CHECK (stock >= 0)`.

**Alternatives considered:**

- **Client-side Supabase queries with RLS as the only protection** — technically possible (Supabase is designed to allow this), but it means the browser needs to know the table schema and query shape, and every "trust boundary" decision has to be re-litigated inside RLS policy SQL instead of ordinary TypeScript. For a learning project, keeping all data access in one readable `src/lib/books.ts` file is far easier to reason about and to audit.
- **A traditional ORM (Prisma, Drizzle)** — adds a whole abstraction layer and a build step for a single table with four read functions. Not justified yet; revisit only if the schema grows meaningfully more complex.

**What goes wrong if implemented incorrectly:**

- Forgetting to enable RLS (or enabling it but leaving the default "no policies = no access" _or, worse,_ accidentally leaving a permissive default policy) is the single most common Supabase mistake — it either breaks the public site or, worse, exposes every row including inactive/hidden products to anyone.
- Putting the service-role key in a `PUBLIC_*` variable, or importing `src/lib/supabase.ts` from a `client:*` island, ships full read/write database access to every visitor's browser dev tools.
- Trusting a price read from Supabase _without_ re-reading it at the moment of order validation (e.g. caching it too long) reopens the same "stale price" problem described in §6 — the fix is that `/api/cart/validate` always does a fresh lookup, never relies on anything computed earlier in the request lifecycle.

---

# 8. Sanity Integration Strategy

**What it does:** Sanity (a hosted structured-content CMS with a visual editor) becomes the source of truth for editorial/marketing copy — hero heading, CTA labels, nav labels, footer content, cart messages — fetched via GROQ queries in `src/lib/sanity.ts`.

**Why it exists:** MASTER-PROJECT-SPEC's non-technical-manager requirement means copy changes (a new hero headline for a seasonal promotion, an updated footer address) shouldn't require a code change and a redeploy by a developer. A CMS with a real editing UI (`studio/`) is what makes that possible.

**Why we're choosing this split (Sanity ≠ Supabase, and never overlapping):** The dividing line isn't "which database is fancier" — it's **who owns the correctness guarantee**. A wrong hero headline is embarrassing; a wrong price is a financial and legal problem (charging the wrong amount, or implying stock that doesn't exist). Keeping commercial data out of Sanity means a content editor literally cannot cause a pricing bug, no matter what they type into the CMS.

**Alternatives considered:**

- **Hardcoding all copy in `.astro` files** — fails the explicit "non-technical managers must be able to use both systems" requirement outright.
- **One CMS for everything, including products** — rejected specifically because it removes the constraint guarantees (price ≥ 0, stock ≥ 0, RLS) that a real relational database gives you; a headless CMS's job is flexible content modeling, not transactional integrity.
- **Sanity Studio embedded as an Astro route vs. deployed separately** — either works technically; recommend deploying Studio separately (Sanity's own hosting or a small separate Vercel project) so a content editor's login/workflow is fully decoupled from the storefront's deploy pipeline. This is a Phase 8 detail, not decided further here.

**What goes wrong if implemented incorrectly:** If a "price" or "in stock" label ever gets modeled as free-text in Sanity (even for something that sounds harmless, like a promotional badge saying "Only 2 left!"), you've recreated the exact problem this split exists to prevent — a non-technical edit can now misrepresent real inventory with no validation catching it.

---

# 9. SEO Architecture

**What it does:** A single `SEO.astro` component, rendered inside `Layout.astro`, accepts `title`, `description`, `canonicalUrl`, and an optional `ogImage` / structured-data slot — every page is required to pass its own `title` and `description` (no silent fallback to a generic default), satisfying "every indexable page must have a unique title and description" (spec §29).

**Why it exists:** Search engines and social previews read `<head>` metadata, not what a human sees on screen — without it, the page still "works" for a visitor but is invisible or wrong in search results, Slack/iMessage link previews, etc.

**Why we're choosing this shape:**

- **Sitemap** via the official `@astrojs/sitemap` integration — generated automatically from the actual routes at build time, so it can never drift out of sync with the real page list (a hand-maintained `sitemap.xml` inevitably does).
- **robots.txt** differs by environment: production ships an indexable `robots.txt`; preview/staging deployments serve a `noindex` version and a `Disallow: /` robots file, driven by a build-time environment check (e.g. Vercel's `VERCEL_ENV`) — because `robots.txt` alone is advisory, not access control (spec §31), Vercel's Deployment Protection (§11) is the _real_ barrier; robots.txt is the courtesy layer on top.
- **JSON-LD structured data** is generated **server-side from the same `Book` object already rendered on the page** — never a hand-maintained duplicate. `Product` schema (name, image, description, price, currency, availability) on `/books/[slug]`; `Organization` + `WebSite` schema on `/`.

**Alternatives considered:**

- **A generic/shared meta description reused across pages** — technically works, but actively fails the spec's "unique per page" requirement and is worse for SEO than no description at all in some cases.
- **Injecting JSON-LD via client-side JavaScript** — rejected: Google generally does execute JS, but not reliably or immediately for every crawl, and it contradicts the whole "server-render by default" principle for something crawlers specifically need at first paint.

**What goes wrong if implemented incorrectly:** Structured data that doesn't match the visible page content (e.g. JSON-LD claiming "in stock" while the page shows "out of stock") is treated by Google as manipulative and can trigger a manual action against the whole site, not just that page — this is why deriving JSON-LD from the _same_ data object as the visible price/stock, in the same request, is non-negotiable rather than a nice-to-have. Missing canonical tags on `/books` (which will eventually paginate) can also cause duplicate-content dilution across `?page=2`, `?page=3`, etc.

---

# 10. Security Architecture

This section is the "why" behind `CLAUDE.md` rules #10–13 and MASTER-PROJECT-SPEC §32; a full audit checklist will live in `docs/SECURITY.md` at Phase 9, but the architecture that makes that audit meaningful is decided now.

## The order-submission trust boundary (the most important diagram in this document)

```text
Browser sends: { customerName, email, items: [{ bookId, quantity }] }
                          │
                          ▼
            POST /api/cart/submit  (server, Astro API route)
                          │
                          ▼
      For each item: look up the book fresh via src/lib/books.ts
      → does it exist? is it active? is quantity ≤ stock?
      → compute price × quantity from the SERVER's copy of price
                          │
                          ▼
      Reject the whole order if anything fails validation.
      Otherwise: respond with a server-computed subtotal
      and (Phase 7) persist the order.
```

The browser is never asked for, and never trusted for, a price. It only ever sends _identifiers and quantities_ — this single rule is what makes "no online payments, but still a real order flow" safe.

## Decision-by-decision

**Input validation — hand-rolled functions in `src/lib/validation.ts`, not a schema library (Zod, Yup, etc.) by default.**
_What it does:_ Small, explicit functions like `isValidQuantity(n)`, `isValidEmail(s)` that the API routes call before touching any data.
_Why we're choosing it over a library:_ `CLAUDE.md` rule #14 ("do not add dependencies without a clear reason") applies here — the validation surface is small (an email, a name, a quantity, a book ID) and hand-written checks are both sufficient and, for teaching purposes, fully transparent — you can read every rule instead of trusting a library's behavior. **If validation logic grows meaningfully more complex** (nested conditional rules, many form fields), that's the concrete trigger to revisit Zod — not before.
_What goes wrong if skipped:_ Any unvalidated field reaching the database or an email/notification step is a direct injection or data-corruption risk (e.g. a `quantity` of `-5` or `"DROP TABLE"` submitted as a "name").

**Output escaping — rely on Astro's default auto-escaping; explicitly avoid `set:html` for anything user-supplied.**
_What it does:_ Astro escapes `{expression}` output by default, the same way you'd expect from any modern templating system.
_Why it matters here specifically:_ The only user-supplied text this project renders back is customer form input (name, notes) — if that ever needs to be displayed anywhere (e.g. an order confirmation), it must go through the default escaped path, never `set:html`.
_What goes wrong if implemented incorrectly:_ `set:html`-ing anything derived from user input is a direct stored/reflected XSS vector.

**Secrets — strict `PUBLIC_*` vs. server-only separation, enforced by convention + code review, verified by the Phase 9 audit.**
_What it does:_ Only variables prefixed `PUBLIC_` may be referenced from client-side code; everything else (`SUPABASE_SERVICE_ROLE_KEY`, `SANITY_TOKEN`) is read only inside `src/lib/*.ts` server code paths.
_Why we're choosing convention over a tool:_ Astro/Vite already enforce this at the bundler level for anything using `import.meta.env` — a non-`PUBLIC_` variable literally isn't included in the client bundle by default. The discipline needed is not _technical_ (the tooling helps) but _procedural_: never manually pass a secret into props of a `client:*` component, never log it, never put it in a URL.
_What goes wrong if implemented incorrectly:_ A leaked service-role key is equivalent to leaking full database admin access — it bypasses RLS entirely.

**Least privilege — the anon key (if used client-side at all) can only ever read `is_active = true` rows (enforced by RLS, §7); the service-role key is used only inside API routes / build-time server code, never the general page-render path.**
_What goes wrong if implemented incorrectly:_ Using the service-role key for routine reads "because it's easier" (no RLS friction) means a single code mistake — accidentally forwarding that client to the browser — becomes a full database compromise instead of, at worst, an over-broad read.

---

# 11. Deployment Architecture

**What it does:** GitHub holds the source; Vercel builds and hosts it, with `main` deploying to production and every other branch/PR getting its own preview URL.

**Why we're choosing Vercel specifically:** It's already mandated by the spec, and it happens to be the best-supported host for Astro's `server` output mode (§1) — the `@astrojs/vercel` adapter turns our API routes into Vercel serverless functions with no extra infrastructure to manage.

**Preview protection:** Vercel's built-in **Deployment Protection** (password or Vercel-account-based access) is enabled for all non-production deployments — this is the _actual_ access control, not `robots.txt` (§9), which only ever discourages well-behaved crawlers.

**Environment variable scoping:** Vercel lets you scope env vars per environment (Production / Preview / Development). Production-only secrets (a live Supabase service-role key, if a separate staging Supabase project is used) are scoped to Production only — preview deployments get their own, lower-privilege values.

**Alternatives considered:** Netlify is a comparable option technically, but wasn't chosen — it's not what the spec specifies, and Vercel's first-party Astro support (including the adapter) is more actively maintained for this exact stack.

**What goes wrong if implemented incorrectly:** An unprotected preview deployment is a publicly reachable, search-indexable copy of the site running against whatever data it's configured with — if that preview happens to point at production Supabase (a very easy mistake when "just testing"), you've created an unauthenticated second front door to real commercial data.

**Staging (added Phase 10 — see `docs/DEPLOYMENT.md` §3 for the full setup):** a third, named tier sits between ordinary Preview URLs and Production — a long-lived `staging` branch pinned to a fixed subdomain, so reviewers get one stable URL instead of a new one per push. It is not a distinct Vercel product; it's an ordinary Preview deployment (same Deployment Protection, same `VERCEL_ENV !== "production"` → noindex behavior already described above and in `docs/SECURITY.md` §8) that happens to have a stable branch and domain assigned to it. No code change was required to add it.

---

# 12. Git Workflow

**What it does:** `main` = production-ready code only. All work happens on `feature/*` branches, merged via PR review, with conventional commit prefixes (`docs:`, `feat:`, `fix:`, `chore:`) and **one commit checkpoint per completed phase** (per `AGENT-WORKFLOW.md` §28).

**Why the per-phase checkpoint matters specifically for a learning project:** If something breaks three phases later, you can `git bisect` or simply diff against the last phase's checkpoint and know _exactly_ which phase's work introduced the regression — this is what `AGENT-WORKFLOW.md` §29 relies on when it says "revert to the last known-good commit" rather than blindly debugging forward.

**Alternatives considered:** Trunk-based development (commit straight to `main`) is faster for a solo hobby project, but skips the review gate the whole agent workflow is built around, and makes "what changed in this phase" much harder to answer later. Git-flow (`develop`/`release` branches) is the opposite problem — more ceremony than a project this size needs.

**What goes wrong if implemented incorrectly:** Committing directly to `main` mid-phase means there's no clean rollback point if a phase goes wrong halfway through — you either accept broken `main` temporarily or have to manually reconstruct a good state.

---

# 13. Development Phases, In Order

This is `AGENT-WORKFLOW.md`'s own phase list (§13–26); repeated here with the _why this order_ reasoning made explicit, since that's the part a fixed list doesn't explain on its own.

| #   | Phase                               | Why it must come at this point, not earlier or later                                                                                                                                                                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Project Architect (this document)   | Every later phase references folder structure, data shapes, and trust boundaries decided here — building UI or wiring data before this exists means redoing work once real decisions land.                                                                          |
| 1   | Astro Foundation                    | Needs the folder structure from Phase 0; nothing else can start without a working `astro dev`/`astro build`.                                                                                                                                                        |
| 2   | Figma / Design System               | Already done (`DESIGN-SYSTEM.md`) — intentionally _before_ Phase 3, so components are built once against real tokens instead of guessed-at ones, then reworked.                                                                                                     |
| 3   | Components & Pages (mock data)      | Uses **local mock data on purpose** — UI bugs and data/infra bugs are much easier to debug separately than simultaneously. Building against a live Supabase table this early would mean every UI glitch is also a "is it the network or the markup?" investigation. |
| 4   | Cart                                | Needs working pages/components to attach to; still uses mock data — cart logic (§6) doesn't actually depend on where book data comes from.                                                                                                                          |
| 5   | Animations / Interactions (GSAP)    | Deliberately _after_ the core UX works — polishing motion on a cart that doesn't function yet is wasted effort if the underlying flow changes.                                                                                                                      |
| 6   | SEO / Structured Data               | Needs real, finished page markup to describe accurately — writing JSON-LD against pages that are still changing shape guarantees rework.                                                                                                                            |
| 7   | Supabase                            | Only now does commercial data go live — by this point the "seam" (`src/lib/books.ts`) has been proven out against mock data, so swapping the source is a contained, well-tested change, not a foundation being built and validated simultaneously.                  |
| 8   | Sanity                              | After Supabase, not before — the higher-risk trust boundary (money-adjacent data) is proven first; editorial copy is lower stakes and can follow.                                                                                                                   |
| 9   | Security Audit                      | Needs _all_ integrations in place to be meaningful — auditing "Supabase access" before Supabase exists, or before Sanity's fetch patterns exist, would miss real issues. Still strictly before deployment.                                                          |
| 10  | GitHub / Vercel (production deploy) | Only after the security audit — deploying before auditing risks shipping exactly the kind of leaked-secret or missing-RLS mistake §10 describes.                                                                                                                    |
| 11  | Final QA                            | Needs a real deployed environment — responsive/perf/cross-device testing genuinely can't be done meaningfully against `localhost` alone.                                                                                                                            |
| 12  | Teacher / Code Review               | Last, deliberately — reviewing "why" decisions were made is most useful once the whole system exists to point at.                                                                                                                                                   |

**What goes wrong if phases are reordered:** The two riskiest reorderings, concretely — (a) wiring Supabase before the architecture/RLS strategy in §7 is settled tends to produce ad hoc, insecure queries baked directly into components because "it was faster"; (b) deploying before the security audit (swapping #9 and #10) means the audit becomes a post-incident cleanup instead of a gate, which defeats its entire purpose.

---

# Status

```text
[✓] Project concept defined
[✓] Architecture direction defined
[✓] Data ownership defined
[✓] Agent workflow defined
[✓] Figma analyzed
[✓] Design system documented
[✓] Technical architecture documented (this document)
[ ] Awaiting approval
[ ] Astro project initialized
[ ] Components implemented
[ ] Pages implemented
[ ] Cart implemented
[ ] Supabase integrated
[ ] Sanity integrated
[ ] SEO completed
[ ] Accessibility audit completed
[ ] Security audit completed
[ ] Vercel configured
[ ] Production deployment completed
[ ] Final QA completed
```

**This document is a proposal. Nothing has been implemented.** Please review and either approve it or flag what you'd like changed — Phase 1 (Astro Foundation) will start from exactly this structure once you do.
