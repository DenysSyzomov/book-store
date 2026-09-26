# SECURITY.md

Security architecture and audit findings for the Book Store project
(Phase 9 — Agent 9, per `docs/AGENT-WORKFLOW.md` §22 and
`docs/MASTER-PROJECT-SPEC.md` §32). This document is the source of
truth for security decisions; `CLAUDE.md` rule 18 applies here too — an
architectural security problem discovered outside a future agent's
assigned scope should be added to "Open Questions" below, not silently
fixed.

Audit date: 2026-09-26. Scope: the Astro storefront (`src/`), the
Supabase project it reads from (live-tested, not just reviewed as
SQL), the Sanity dataset it reads from (live-tested), and the project's
dependency tree (`npm audit`). The Sanity Studio app (`studio/`) was
reviewed for what it exposes to the storefront, not audited as its own
application — it's a separate, separately-deployed tool per
`docs/ARCHITECTURE.md` §8, out of this project's runtime.

---

## Summary

No secrets are committed, RLS was live-tested (not just read from the
migration file) and holds, and no XSS vector was found. Two real gaps
were found and fixed: the app shipped no HTTP security headers at all,
and the checkout API trusted unbounded input length and an unbounded
cart size. Everything else below is either already correct by design
or a recommendation for a later phase (persistence, auth, or
deployment configuration this project doesn't have yet).

| #   | Finding                                                                                                               | Severity      | Status                             |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------- |
| 1   | No HTTP security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, framing)            | Medium        | Fixed                              |
| 2   | Checkout API accepted unbounded-length name/email/phone/notes                                                         | Low–Medium    | Fixed                              |
| 3   | Checkout API accepted an unbounded `items` array (query-amplification)                                                | Low–Medium    | Fixed                              |
| 4   | No rate limiting / abuse protection on `/api/cart/*`                                                                  | Low           | Recommendation — not fixed         |
| 5   | `npm audit`: 16 advisories, all in build-time tooling pulled in by `sanity`/`@astrojs/vercel`                         | Low           | Recommendation — not fixed         |
| 6   | Root `package.json` carries the full `sanity` Studio package (and its peers) as a direct dependency of the storefront | Informational | Not changed — explained below      |
| 7   | No git repository yet; nothing to audit for leaked history                                                            | —             | N/A, noted for before first commit |

---

## 1. Secrets

**Environment variables.** `.env.example` documents every variable and
correctly marks `PUBLIC_*` ones as browser-exposed and the rest
(`SUPABASE_SERVICE_ROLE_KEY`, `SANITY_TOKEN`) as server-only. Verified:

- `SUPABASE_SERVICE_ROLE_KEY` and `SANITY_TOKEN` are **blank** in the
  real `.env` — no service-role key or write token exists anywhere in
  this project yet, which is the safest possible state for them to be
  in.
- `src/lib/supabase.ts` only ever builds a client from
  `PUBLIC_SUPABASE_ANON_KEY`. Nothing in `src/` imports or references
  `SUPABASE_SERVICE_ROLE_KEY`. Confirmed with `grep -r` across `src/`.
- `PUBLIC_SUPABASE_ANON_KEY` is a `sb_publishable_...` key — Supabase's
  new publishable-key format. It is meant to be public; RLS is what
  actually protects the data behind it (see §2).
- `PUBLIC_SANITY_PROJECT_ID` / `PUBLIC_SANITY_DATASET` are identifiers,
  not secrets — confirmed live: the `production` dataset answers
  unauthenticated GROQ queries over HTTPS with no token (§3). That's
  the intended design (public storefront content), not a leak.
- No hardcoded key/token/password pattern found anywhere in `src/` or
  `studio/schemaTypes` (`grep -niE` for `service_role`, `sk_live`,
  `sk_test`, `secret_key`, inline `api_key =`, inline `password =`).

**`.gitignore`.** `.env`, `.env.local`, and `.env.production` are all
excluded. `node_modules/`, build output (`dist/`, `.astro/`,
`.vercel/`), and `.DS_Store` are excluded too.

**Git history.** This directory is **not yet a git repository**
(`git status` → "not a git repository"). There is therefore no history
to leak secrets from — but that also means the very first commit is
the first place this could go wrong. Before running `git init` /
the first `git add`:

- Confirm `.env` is not staged (`git status` after `git add`, per this
  repo's own working agreement — see the system-level git safety
  rules).
- Consider a pre-commit secret scan (e.g. `gitleaks` or GitHub's push
  protection once a remote exists) so this stays true automatically
  rather than by discipline alone.

**Sanity Studio config** (`studio/sanity.cli.ts`, `studio/sanity.config.ts`)
hardcodes `projectId`/`dataset` — correct, these are identifiers, not
secrets, and Studio's actual access control is Sanity's own
project-member login, outside this codebase.

---

## 2. Supabase — RLS, grants, write access

`supabase/migrations/20260125000100_books_rls.sql` enables RLS, forces
it even for the table owner, grants `select` only to `anon`/
`authenticated`, and defines exactly one policy (`is_active = true`,
`SELECT` only). No `INSERT`/`UPDATE`/`DELETE` grant or policy exists
for either role — under RLS, "no matching policy" means denied, so
writes are already fully closed off without an explicit deny rule.

This was **live-tested** against the real project
(`ikmnlwwvpgzuhqaqmjac`, read via the public `sb_publishable_...` key,
zero side effects) rather than trusted from the SQL file alone
(`CLAUDE.md` rule 20):

| Test                                             | Result                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `SELECT` all books                               | Returns only the 8 `is_active = true` rows                                               |
| `SELECT ... is_active=eq.false`                  | `[]` — the inactive book is genuinely unreachable, not just filtered by the app          |
| `INSERT` as anon                                 | Rejected: `42501 new row violates row-level security policy`                             |
| `UPDATE price` on a real row, as anon            | `200` with `[]` (0 rows matched) — re-fetched afterward: price unchanged                 |
| `list_tables` on the live project                | Exactly one table, `public.books`, matching the migration — no undocumented table exists |
| Supabase's own security advisor (`get_advisors`) | Zero lint findings                                                                       |

**Storage.** No Supabase Storage bucket is used anywhere in this
project — book cover URLs are plain external `image_url` text values
(seed data uses `picsum.photos`; a real deployment would point these
at whatever CDN hosts real covers). Nothing to audit here yet; if
Storage is introduced later, its bucket policies need the same
anon-write-denied treatment as `books`.

**Service role.** No service-role client exists in the codebase at
all (`src/lib/supabase.ts`'s own header comment explains why: nothing
yet needs privileged writes). This is correct for the project's
current phase — see `docs/ARCHITECTURE.md` §7 for where a future
privileged write path must live if one is added.

---

## 3. Sanity

`src/lib/sanity.ts` uses `sanity:client` (the `@sanity/astro`
integration's virtual client) with no token — confirmed live: querying
the `production` dataset directly over HTTPS with no auth header
succeeds and returns only editorial copy (`siteName`, etc.), nothing
sensitive. This matches the documented design: the dataset's own
public read visibility is what makes this safe, not a missing check.

No write token (`SANITY_TOKEN`) exists anywhere (see §1). No component
queries Sanity directly — every fetch goes through the named functions
in `src/lib/sanity.ts` (`CLAUDE.md` rule 6). No Portable Text / rich
text field is used anywhere in the current schema
(`studio/schemaTypes`) — every field the storefront renders is a plain
string, so there is no rich-text-to-HTML rendering path to audit yet.
If one is added later (a blog, long-form editorial copy), it must go
through a sanitizing renderer, not raw HTML.

---

## 4. Input validation

`src/lib/validation.ts` and `src/lib/orders.ts` are the two files that
matter — both run **server-side**, inside `src/pages/api/cart/*.ts`,
re-checking everything a request claims regardless of whether it came
from the real form (`CLAUDE.md` rule 13).

**Found and fixed:** neither file previously bounded input length or
array size — a request could send a multi-megabyte `notes` string or a
huge `items` array and the server would process all of it.

- `validateCustomerFields` (`src/lib/validation.ts`) now enforces:
  `customerName` 2–200 chars, `email` ≤254 chars (RFC 5321) and
  pattern-checked, optional `phone` ≤32 chars and restricted to
  digits/`+()-.` characters, optional `notes` ≤2000 chars. Previously
  `phone` and `notes` were not validated at all.
  `CustomerForm.astro`'s inputs got matching `maxlength` attributes —
  belt-and-suspenders, not the real guarantee; the server check above
  is what actually decides.
- `validateOrderItems` (`src/lib/orders.ts`) now caps the `items` array
  at 50 entries (`items.slice(0, MAX_ITEMS)`) before doing anything
  else. A real cart never approaches this; it exists so one HTTP
  request can't force hundreds of sequential `getBookById` round-trips
  to Supabase.

**Already correct, verified by reading the code:**

- `src/pages/api/cart/submit.ts` and `validate.ts` both reject a
  non-JSON or malformed body (`400`) before doing anything else, and
  narrow every field with a runtime type guard (`isOrderItem`) rather
  than trusting the shape TypeScript claims at compile time — the
  compile-time type is not a runtime guarantee for a `request.json()`
  payload from an untrusted client.
- `getBookById` (`src/lib/books.ts`) treats a non-integer id as "not
  found" rather than forwarding a malformed value into a query.

---

## 5. Cart — price, stock, product existence

This is the one place `CLAUDE.md` rules 11/12 ("Supabase owns
commercial data", "never trust client-provided prices or stock") are
actually enforced, and it already does this correctly:

- `src/lib/cart.ts` (client-side) never stores a price — only
  `{ bookId, quantity }`. There is no stored number for a compromised
  or stale client to feed back to the server.
- `validateOrderItems` (`src/lib/orders.ts`) re-fetches every book by
  id from Supabase, ignores whatever quantity the client sent past
  real stock (`Math.min(requestedQuantity, book.stock)`), and computes
  `lineTotal` from the freshly-read `book.price` — never from anything
  the request body contains.
- A book that doesn't exist, or exists but is inactive
  (`getBookById`'s own `is_active = true` filter, backed by RLS — see
  §2), resolves to the `"unavailable"` issue and is dropped from the
  order rather than silently accepted.
- `/api/cart/submit` blocks the whole submission (`hasBlockingIssues`)
  if any item is unavailable or if nothing resolved at all — a request
  can't partially succeed with a product that no longer exists.

No order is persisted anywhere yet (`src/pages/api/cart/submit.ts`'s
own header comment — this is an explicit, documented Phase 7 decision,
not an oversight). Once persistence exists, the same re-validated
`resolvedItems`/`subtotal` this route already computes is what must be
written, not anything from the request body.

---

## 6. XSS

Audited every place user- or CMS-sourced data reaches the DOM:

- **`set:html` usages** (the only two in the project,
  `src/components/SEO.astro` and `src/layouts/Layout.astro`): both
  `JSON.stringify(...).replace(/</g, "\\u003c")` before embedding —
  a book title or description containing a literal `</script` cannot
  close the tag early. Confirmed by reading both call sites; this is
  the correct, standard mitigation for embedding JSON inside a
  `<script>` element.
- **Cart rendering** (`src/components/cart/CartDrawer.astro`): every
  dynamic value (book title, author, quantity, price, form errors) is
  set via `.textContent`, or via `<template>` cloning — never
  `.innerHTML` with interpolated data. The one `innerHTML` usage found
  (`itemsList.innerHTML = ""`) only clears a container; it never
  writes untrusted content.
- **Sanity content**: no Portable Text / rich text field exists in the
  current schema (§3) — every editorial string is rendered through
  Astro's normal `{}` expression syntax, which HTML-escapes by
  default. Nothing bypasses that.
- No `eval`, `new Function`, or `document.write` anywhere in `src/`.

No XSS vector was found. If a rich-text field is added later, it must
go through a sanitizer (e.g. `@portabletext/to-html` with a
restrictive serializer) — never raw HTML from a `set:html`.

---

## 7. HTTP / security headers

**Found:** the project shipped **no security headers at all** — no
`vercel.json`, no equivalent Astro middleware. Astro's `server` output
mode and the Vercel adapter don't add any of these by default.

**Fixed** — added `vercel.json` at the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
        },
        { "key": "Content-Security-Policy", "value": "..." }
      ]
    }
  ]
}
```

The CSP was built from what the production build actually emits, not
a generic template — verified by running `npm run build` and
inspecting `.vercel/output/static/**/*.html`:

- No inline `<style>` tag or `style="..."` attribute exists anywhere
  in the built output — Astro extracts all component styles into
  external stylesheets. So `style-src 'self'` needs no `'unsafe-inline'`.
- Exactly one inline, executable `<script>` exists project-wide (the
  `document.documentElement.classList.add("js")` line in
  `src/layouts/Layout.astro`, run before paint on purpose — see that
  file's own comment). Its content is byte-identical across every
  prerendered page. Rather than weaken `script-src` with
  `'unsafe-inline'`, the CSP allowlists its exact SHA-256 hash:
  `'sha256-ZnYJX5ypMaaAhxxWhSEjbMkhO2A9yPmbzEQH3LFaITA='`. The other
  two `<script>`/`set:html` uses in the project are
  `type="application/json"` / `type="application/ld+json"` — the
  browser never executes those as script, so they aren't governed by
  `script-src` at all.
- All other client scripts (cart logic, the reveal/Swiper modules) are
  bundled by Vite into same-origin `<script type="module" src="/_astro/...">`
  tags — already covered by `script-src 'self'`.
- No client-side code calls out to a third-party origin — the only
  `fetch()` calls in the project are same-origin, to `/api/cart/validate`
  and `/api/cart/submit` (`CartDrawer.astro`). `connect-src 'self'` is
  therefore sufficient; Supabase and Sanity are only ever called from
  server-side code (`src/lib/supabase.ts`, `src/lib/sanity.ts`), never
  from the browser.
- `img-src` was deliberately left as `'self' https: data:` rather than
  pinned to one CDN: `image_url` is a free-text column today (§2) and
  the real production image host isn't finalized yet. **This should be
  narrowed** once it is (e.g. to `'self' https://cdn.sanity.io
https://<real-image-host>`) — noted in Open Questions below.

**Known maintenance cost of the hash-based `script-src`:** if
`Layout.astro`'s inline script content ever changes (even
whitespace), the SHA-256 hash in `vercel.json` must be regenerated to
match, or that script silently stops running under CSP enforcement.
The failure mode is safe (the page just never gains the `.js` class,
so `[data-reveal]` elements stay visible and JS-only reveal animations
don't run — a visual regression, not a functional break), but it's
worth knowing about before touching that file. Regenerate with:

```js
// content = the exact text between <script> and </script> in a built
// page, e.g. via `npm run build` and reading .vercel/output/static/index.html
crypto.createHash("sha256").update(content, "utf8").digest("base64");
```

**Verification limitation, stated plainly (`CLAUDE.md` rule 20):**
these headers were verified by (a) reading them against the actual
production build's HTML/asset output, and (b) confirming `vercel.json`'s
`headers` block is the documented, standard mechanism Vercel applies
independently of `@astrojs/vercel`'s own Build Output API config. They
were **not** verified by an actual deployed HTTP response, because
this project has no live Vercel deployment yet (Phase 10 — see
`docs/AGENT-WORKFLOW.md` §23 — hasn't happened). **Before this ships:**
after the first deploy, run
`curl -I https://<the-real-deployment-url>/` and confirm every header
above is present, and paste the CSP into an evaluator
(e.g. Google's CSP Evaluator) to catch anything this review missed.

---

## 8. Staging / preview indexation

Already correct, no change needed:

- `src/lib/seo.ts`'s `isProductionSite()` checks `VERCEL_ENV ===
"production"` — anything else (local dev, a Preview deployment)
  defaults to **not indexable**, the safer default.
- `src/components/SEO.astro` sets `<meta name="robots" content="noindex, nofollow">`
  on every non-production build — this is the actual enforcement.
- `src/pages/robots.txt.ts` mirrors the same check and additionally
  omits the `Sitemap:` line on non-production, so a crawler that does
  respect `robots.txt` can't even enumerate URLs from it.
- `docs/MASTER-PROJECT-SPEC.md` §31 itself says `robots.txt` must not
  be treated as a security mechanism — correct, and this project
  doesn't rely on it as one; the meta tag is the real gate.

**Not yet configured (platform-level, outside this codebase):** Vercel
Deployment Protection (password or SSO-gated Preview URLs) is not
something a code change can turn on — it's a Vercel project setting.
Recommended for Phase 10 (`docs/AGENT-WORKFLOW.md` §23's "Preview
protection" line already calls this out) so a Preview URL leaked
outside the team isn't reachable at all, not just unindexed.

---

## 9. Dependencies

`npm audit` (root `package.json`): **16 advisories (6 high, 10
moderate, 0 critical)**. Traced every one to its actual source rather
than reporting the raw count:

| Package                      | Advisory                               | Where it actually lives                                                                                                    |
| ---------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `js-yaml` ≤3.15.1            | prototype pollution / ReDoS in `merge` | `@vercel/frameworks`'s own dependency, and inside `sanity`'s CLI build chain (`@sanity/cli-build` → `@sanity/runtime-cli`) |
| `smol-toml` ≤1.7.0           | DoS on malformed TOML                  | Same `sanity` CLI build chain                                                                                              |
| `uuid` <11.1.1               | buffer bounds check                    | `typeid-js`, a transitive dep inside `sanity`'s own tree                                                                   |
| `path-to-regexp` 4.0.0–6.2.2 | ReDoS                                  | `@vercel/routing-utils`, used by `@astrojs/vercel`                                                                         |

**Why this is Low, not High, despite the advisory severities:** none
of this code executes in the deployed storefront. `js-yaml`/`smol-toml`/
`uuid` only run inside the `sanity` package's own **CLI** tooling
(`sanity deploy`, `sanity build`, etc.) — this project's actual build
command is `astro check && astro build` (`package.json`'s own `build`
script), which never invokes the Sanity CLI from the root project.
`path-to-regexp` is inside `@vercel/routing-utils`, used by
`@astrojs/vercel` at **build time** to translate Astro's routes into
Vercel's routing config — not something that runs per-request against
untrusted input at runtime. This isn't a reason to ignore the
findings, just an honest statement of where the actual exposure is
(build-time supply chain, not the live site).

**Not force-upgraded.** `npm audit fix --force` would downgrade
`@astrojs/vercel` (11.0.11 → 8.0.4, a 3-major-version downgrade) and
`sanity` (6.16.0 → 5.14.1) to resolve these — both are breaking
changes npm itself flags, and `@astrojs/vercel` is the adapter this
entire deployment target depends on (`docs/ARCHITECTURE.md` §1).
Forcing that as part of a security-audit phase would risk breaking the
actual build to fix vulnerabilities that don't reach the running site
— the wrong trade to make silently (`CLAUDE.md` rules 15/18). **Recommendation:**
track upstream non-breaking patches for `sanity`/`@astrojs/vercel`
instead, and re-run `npm audit` on a normal cadence.

---

## 10. Unnecessary dependency footprint (informational, not changed)

The root `package.json` — the Astro storefront that actually ships to
visitors — carries `sanity`, `react`, `react-dom`, `react-is`, and
`styled-components` as **direct** dependencies, none of which is
imported anywhere in `src/`. This looked at first like leftover bloat
in violation of `CLAUDE.md` rule 14, and is what pulls in most of §9's
advisories, so it was investigated rather than assumed:

`@sanity/astro`, the official Astro integration this project uses
(`astro.config.mjs`), declares all five as **`peerDependencies`** (its
visual-editing overlay feature needs them). npm auto-installs peer
dependencies by default, so they'd be present in `node_modules` even
if removed from `package.json` entirely — removing the explicit
entries wouldn't actually shrink the install or resolve §9's
advisories, just make the real dependency footprint less visible.
That real footprint is a legitimate cost of using `@sanity/astro`
itself, not a mistake a previous phase introduced.

**Left unchanged** because there's nothing safe to fix here without a
larger architectural decision (e.g. dropping `@sanity/astro`'s
visual-editing feature for a thinner client) that's out of this
phase's scope per `CLAUDE.md` rule 18 — recorded in Open Questions
instead of silently acted on.

---

## 11. Rate limiting / abuse protection (recommendation, not fixed)

`/api/cart/validate` and `/api/cart/submit` are unauthenticated,
public POST endpoints with no rate limiting, CAPTCHA, or per-IP
throttling. Right now the practical impact is low — `submit` doesn't
persist anything yet (§5), so the worst case is wasted Vercel function
invocations, not fake orders or a polluted database. §4's new input
caps (50 items, bounded field lengths) already remove the cheapest
amplification angle.

**This needs to be revisited once persistence exists** (Phase 7, or
whenever an order actually gets written to Supabase or emailed) — at
that point an unrated `submit` endpoint can be used to flood a real
orders table or an inbox. Recommended then: a per-IP rate limit
(Vercel's own Edge Config / a KV-backed limiter, or a lightweight
in-memory one if a single-region deployment makes that acceptable) in
front of `submit` specifically.

---

## Testing performed

- `npx astro check` — 0 errors, 0 warnings, 0 hints (before and after
  the fixes in this phase).
- `npm run build` (`astro check && astro build`) — completed
  successfully, output inspected directly (`.vercel/output/static/**`)
  to verify the CSP against real build artifacts rather than
  assumptions.
- Live Supabase RLS test against the real project via its public
  anon/publishable key: active-book read, inactive-book read (blocked),
  `INSERT` (blocked), `UPDATE` (blocked, price re-verified unchanged
  afterward), full table listing (only `public.books` exists), and
  Supabase's own automated security advisor (zero findings). All via
  read requests or requests RLS is expected to reject — no data was
  modified.
- Live Sanity dataset test: confirmed the `production` dataset answers
  unauthenticated GROQ queries, and only returns non-sensitive
  editorial content.
- `npm audit --json`: full advisory list traced to its actual
  dependency path (§9), not just counted.
- Static review (`grep`) across `src/`, `studio/schemaTypes`, and
  `studio/structure` for hardcoded secrets, `innerHTML`/`set:html`/
  `eval` usage, and direct Supabase/Sanity imports outside `src/lib`.
- **Not tested:** actual HTTP response headers from a deployed URL (no
  deployment exists yet — see §7's stated limitation), and the
  checkout form's new server-side validation errors were not exercised
  through a running dev server / browser (no functional behavior
  changed for a well-formed request — only previously-unvalidated
  edge cases now get rejected — but this should still get a manual
  pass through the real form during Phase 11 QA, and Phase 10's
  post-deploy header check).

---

## Files changed in this phase

- `vercel.json` — new. HTTP security headers (§7).
- `src/lib/validation.ts` — length/format bounds on `phone`/`notes`,
  added max-length checks for `customerName`/`email` (§4).
- `src/lib/orders.ts` — `items` array capped at 50 entries (§4).
- `src/components/cart/CustomerForm.astro` — matching client-side
  `maxlength` attributes (defense-in-depth only; §4's server check is
  the real guarantee).
- `docs/SECURITY.md` — this file, new.

No other files were touched. No dependency was added, removed, or
upgraded.

---

## Open questions / for a future phase

1. **`img-src 'self' https: data:`** in the CSP (§7) is broader than
   ideal — narrow it to the real image host(s) once product photography
   has a final home.
2. **Rate limiting** on `/api/cart/submit` (§11) — revisit as soon as
   order persistence exists.
3. **Vercel Deployment Protection** for Preview URLs (§8) — a Phase 10
   platform setting, not a code change.
4. **`sanity`/`react`/`react-dom`/`react-is`/`styled-components`** as
   direct root dependencies (§10) — inherent to `@sanity/astro`'s
   current feature set; revisit only if that integration itself is
   ever reconsidered.
5. Once `sanity`/`@astrojs/vercel` ship non-breaking patches covering
   §9's advisories, apply them and re-run `npm audit`.
