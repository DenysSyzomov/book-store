# DEPLOYMENT.md

Deployment architecture, Git/GitHub workflow, and Vercel environment setup for the Book Store project (Phase 10 — Agent 10, per `docs/AGENT-WORKFLOW.md` §23 and `docs/MASTER-PROJECT-SPEC.md` §34–35). `docs/ARCHITECTURE.md` §11–12 already defines the deployment architecture at a decision level; this document is the operational runbook that implements it — exact commands, dashboard steps, and the checklist to run through before and after shipping.

**Scope note, read first:** this session had no `gh` or `vercel` CLI installed and no authenticated GitHub/Vercel connection — creating a real GitHub repository or Vercel project requires an interactive browser login that can't run here. Everything that could be done locally (git history, `.gitignore`, documentation, environment-variable reference, testing what's testable without a remote) is done. Steps that need your own GitHub/Vercel account are written below as exact commands or dashboard steps for you to run — each one is marked **[YOU RUN THIS]**.

---

## 1. Concepts

Short explanations, in the order you'll actually use them.

- **Git** — a version control system: it records snapshots of the project's files over time so changes can be tracked, compared, and reverted. Runs entirely on your machine; doesn't require GitHub.
- **Repository (repo)** — a project folder that Git is tracking. This one was created with `git init` — before that, this project had no version history at all (`git status` failed with "not a git repository").
- **Commit** — a saved snapshot of the repo at a point in time, with a message describing what changed and why. Commits are the unit `git log`, `git diff`, and `git bisect` work with.
- **Branch** — a named, independent line of commits. `main` is the production branch; `feature/*` branches are where new work happens without touching `main` until it's reviewed.
- **GitHub** — a hosting service for Git repositories. Turns a local-only repo into something with a shareable URL, collaboration tools (pull requests, issues), and — relevant here — something Vercel can watch for new commits.
- **Pull request (PR)** — a request to merge one branch into another, opened on GitHub once a branch is pushed. It's the review checkpoint: a diff to read, a place for comments, and (once configured) a spot where Vercel automatically posts a Preview Deployment link before anything touches `main`.
- **Preview deployment** — a Vercel deployment built from a branch or PR, at its own unique URL, separate from production. Every push to a non-`main` branch gets one automatically once the GitHub integration is connected. It exists to answer "does this actually work" before merging, without ever touching the live site.
- **Staging** — this project's one *persistent, stable* Preview deployment, pinned to a long-lived `staging` branch and given a fixed subdomain (unlike ordinary Preview URLs, which are ephemeral and per-branch/per-PR). It's the last stop before `main` — a stable environment for reviewing everything from one branch at once, not a specific commit.
- **Production** — the deployment built from `main`. The one real, indexable, public URL. Every commit that lands on `main` becomes the new production deployment.
- **Environment variables** — configuration values (URLs, API keys) injected at build/runtime instead of hardcoded. Vercel scopes them per environment (Production / Preview / Development) so, for example, a production-only secret never reaches a Preview build.
- **Vercel build process** — on every push, Vercel: (1) detects the framework (Astro, via `@astrojs/vercel`), (2) runs `npm install`, (3) runs the build command (`astro check && astro build`, from `package.json`), (4) reads `.vercel/output/` — the Build Output API format `@astrojs/vercel` writes — to deploy static assets to its CDN and the server-rendered routes as serverless functions, (5) assigns a URL (a unique Preview URL, or the fixed Production domain if the branch was `main`).

---

## 2. GitHub setup

### 2.1 What's already done locally

- `git init -b main` — repository initialized, default branch `main`.
- `.gitignore` reviewed and confirmed to exclude: `node_modules/`, build output (`dist/`, `.astro/`, `.vercel/`), `.env`/`.env.local`/`.env.production`, `.DS_Store`, and (added this phase) `.claude/settings.local.json` (personal tool config, not shared project config — same reasoning as not committing personal `.vscode/settings.json` overrides).
- Verified with `git add -A --dry-run` before the first real `git add`: no `.env`, no build output, no `node_modules` staged — only source, docs, and lockfiles.
- `.env.example` already documents every variable name with an explanation, and no value (Phase 1/9 work, unchanged here).
- Clean local commit history created (see §2.3).

### 2.2 What you still need to do — creating the actual repository

**[YOU RUN THIS]** — pick one:

**Option A — GitHub CLI** (if you install it: `brew install gh`, then `gh auth login`):
```bash
gh repo create book-store --public --source=. --remote=origin
git push -u origin main
```

**Option B — GitHub web UI:**
1. github.com → **New repository** → name `book-store` → **Public** → do **not** initialize with a README/`.gitignore`/license (this repo already has all three; letting GitHub create its own would conflict on first push).
2. Then locally:
   ```bash
   git remote add origin git@github.com:<your-username>/book-store.git
   git push -u origin main
   ```

### 2.3 Local commit history

Since no Git history existed before this phase, the project's prior phases (0–9) are captured as one honest checkpoint rather than fabricated retroactively per-phase (there are no real snapshots of the codebase mid-Phase-3 or mid-Phase-7 to commit — inventing timestamps/diffs for them would be a false history, not a clean one). From this commit forward, every phase gets its own commit going forward, per `AGENT-WORKFLOW.md` §28.

```text
chore: initial commit — Book Store through Phase 9 (security audit)
docs: add deployment guide, update README (Phase 10)
```

### 2.4 Branch strategy going forward

```text
main                    → production, always deployable
feature/<short-name>    → one branch per unit of work, e.g. feature/final-qa-fixes
staging                 → long-lived, pinned to the Staging environment (§3.3)
```

Workflow for any future change:
```text
git checkout -b feature/my-change
...edit, commit...
git push -u origin feature/my-change
→ open a pull request into main on GitHub
→ review the PR's automatic Preview Deployment comment
→ merge (squash or merge commit — either is fine at this project's size)
→ delete the feature branch
```

**Do not commit:** `.env`, any secrets/API tokens/private keys, or generated files (`dist/`, `.astro/`, `.vercel/`, `node_modules/`) — all already excluded by `.gitignore`; double-check with `git status` before every commit regardless, since a hand-added file can bypass a gitignore rule if force-added.

---

## 3. Vercel setup

### 3.1 Why Vercel, and the environment model

Already decided in `docs/ARCHITECTURE.md` §11: GitHub holds the source, Vercel builds and hosts it, `@astrojs/vercel` turns the app's API routes into Vercel serverless functions. This phase adds a third tier — **Staging** — on top of the Preview/Production split that document already assumes, because the brief for this phase calls for all three distinctly. That's a small architecture addition, noted here and cross-referenced from `ARCHITECTURE.md` §11 rather than duplicated.

```text
Production   → main branch            → https://<your-domain>            → public, indexable
Staging      → staging branch (fixed)  → https://staging.<your-domain>    → protected, noindex
Preview      → every other branch/PR   → https://book-store-<hash>.vercel.app → protected, noindex
```

Staging is not a separate Vercel "project" or a special product — it's an ordinary Preview deployment that happens to be pinned to one long-lived branch and given a stable domain, so reviewers get one predictable URL instead of a new one per push. Nothing in the codebase needs to know the difference: `isProductionSite()` (`src/lib/seo.ts`) already treats anything where `VERCEL_ENV !== "production"` as non-indexable, which covers both Staging and ordinary Preview deployments automatically — no code change was needed for this.

### 3.2 Creating the project

**[YOU RUN THIS]** — after the GitHub repo exists (§2.2):

1. vercel.com → **Add New… → Project** → import the `book-store` GitHub repo (or, with the CLI installed and logged in: `vercel link` from this folder).
2. Framework preset: Vercel auto-detects Astro; confirm build command `npm run build` (already what `package.json`'s `build` script does: `astro check && astro build`) and output directory left as detected (`@astrojs/vercel` writes `.vercel/output/` directly — do not override this).
3. Node.js version: this project's local build (Node 26) printed `The local Node.js version (26) is not supported by Vercel Serverless Functions. Your project will use Node.js 24 as the runtime instead` — informational, not an error; the build still succeeded. In **Project Settings → General → Node.js Version**, confirm it's pinned to a version Vercel currently supports (24.x at the time of writing) so a future Vercel platform default change can't silently change the runtime under you.

### 3.3 Production environment

**[YOU RUN THIS]**, in **Project Settings**:

- **Domains** — add your production domain and set it as the primary domain for the `main` branch / Production environment. (If you don't have one ready yet, the default `book-store.vercel.app` works exactly the same way — swap in the real domain later, nothing else changes.)
- **Environment Variables**, scoped to **Production** only:

  | Name | Value source |
  | --- | --- |
  | `PUBLIC_SITE_URL` | Your real production domain, e.g. `https://your-domain.com` (no trailing slash) — this is what `astro.config.mjs`'s `site` and the sitemap integration use to build every canonical/OG/sitemap URL, so it must exactly match the domain above. |
  | `PUBLIC_SUPABASE_URL` | Production Supabase project URL |
  | `PUBLIC_SUPABASE_ANON_KEY` | Production Supabase publishable/anon key |
  | `PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
  | `PUBLIC_SANITY_DATASET` | `production` dataset |
  | `SUPABASE_SERVICE_ROLE_KEY` | Leave blank unless a real privileged write path exists (none does today — see `docs/SECURITY.md` §1) |
  | `SANITY_TOKEN` | Leave blank unless server-side draft reads/writes exist (none do today) |

  `VERCEL_ENV` is not listed — Vercel injects it automatically for every deployment; never set it manually.

- Confirm **indexable**: with `PUBLIC_SITE_URL` set to the real domain and `VERCEL_ENV=production` (automatic), `isProductionSite()` returns `true`, so `/robots.txt` serves `Allow: /` plus the real `Sitemap:` line, and every page's `<meta name="robots">` omits `noindex`. Verify after the first deploy (§5).

### 3.4 Staging environment

**[YOU RUN THIS]**:

1. Push a long-lived `staging` branch: `git checkout -b staging && git push -u origin staging`.
2. **Project Settings → Domains** — add `staging.<your-domain>` (or any subdomain you prefer) and assign it to the `staging` **branch**, not to Production. Vercel supports assigning a custom domain to a specific non-production branch precisely for this pattern.
3. **Project Settings → Deployment Protection** — enable protection (Vercel Authentication, or a Password) scoped to Preview deployments. Since Staging is technically a Preview deployment (§3.1), this single setting covers both the `staging` domain and every ephemeral per-branch Preview URL — the actual access control, not `robots.txt` (`docs/SECURITY.md` §8 already makes this point; it applies here unchanged).
4. **Environment Variables**, scoped to **Preview** — optionally with a **branch override** for `staging` specifically if it should point at different upstream data than ad hoc feature-branch previews (e.g., a staging Supabase project instead of production data). At minimum, leave `PUBLIC_SITE_URL` **unset** for Preview/Staging — `astro.config.mjs` already falls back to the dev server's own address when unset, and no canonical/sitemap URL should ever point at a non-production domain regardless.
5. Confirm **noindex**: `VERCEL_ENV` on any Preview deployment (staging included) is `"preview"`, never `"production"` — so `isProductionSite()` is `false`, `/robots.txt` serves `Disallow: /` with no `Sitemap:` line, and every page carries `<meta name="robots" content="noindex, nofollow">`. This is enforced by code already in place (`src/lib/seo.ts`, `src/pages/robots.txt.ts`, `docs/SECURITY.md` §8) — nothing new to build, only to verify once deployed (§5).

### 3.5 Preview deployments (per branch / PR)

Nothing to configure beyond what §3.4 already sets up — once the GitHub repo is connected, every push to any branch other than `main` (and every PR) gets its own Preview deployment automatically, inheriting the Preview-scoped environment variables and Deployment Protection from §3.4.

---

## 4. Testing performed this phase

Per `CLAUDE.md` rule 20, only what was actually run is claimed as working.

| Check | Result |
| --- | --- |
| `npm run check` (`astro check`) | Passed — 0 errors, 0 warnings, 0 hints across 39 files. |
| `npm run build` (`astro check && astro build`) | Passed — server + client output built, sitemap generated, `.vercel/output/` produced by the adapter. |
| `npm run dev`, manual request | `GET /` → `200`, `GET /books` → `200`. Local development confirmed working. |
| `npm run preview` (`astro preview`) | **Does not work with this project's configuration** — see below. |
| Preview deployment / Staging / Production | **Not tested — no Vercel project or deployment exists yet.** Section 5 below is the checklist to run through once one does. |

**Finding: `npm run preview` cannot test this project's server routes.** `@astrojs/vercel` in `output: "server"` mode writes its server bundle to `.vercel/output/functions/_render.func/` (Vercel's Build Output API format) — `dist/` only contains `dist/client/` (static assets). `astro preview` expects a standard `dist/server/entry.mjs`, finds nothing there, and exits immediately ("Preview server process exited before becoming ready."). This is expected behavior for the Vercel adapter, not a bug introduced this phase — but it means the `npm run preview` script in `package.json`/README's Commands table doesn't actually exercise API routes (`/api/cart/*`) or SSR pages locally. The correct local equivalent is `vercel dev` (needs the Vercel CLI, linked and logged into the project) or simply reviewing the real Preview Deployment Vercel builds from a pushed branch. Reporting this rather than silently reworking the adapter output mode or the preview script, per `CLAUDE.md` rule 18 — it's a pre-existing characteristic of the chosen deployment target, not something in this phase's scope to change.

---

## 5. Post-deployment verification checklist

Run once the GitHub repo and Vercel project both exist (§2.2, §3.2).

**Local (already verified, this phase):**
- [x] `npm run check` passes
- [x] `npm run build` passes
- [x] `npm run dev` serves `/` and `/books`

**GitHub:**
- [ ] Repo pushed, `main` is the default branch
- [ ] `.env`, secrets, and generated files absent from `git log` history (`git log --all --stat` — nothing named `.env*`, no `node_modules/`, no `dist/`)
- [ ] Branch protection on `main` considered (require PR review before merge) — optional at this project's size, recommended once collaborators exist

**Vercel — Preview:**
- [ ] Pushing a `feature/*` branch produces a Preview deployment automatically
- [ ] Preview URL requires authentication (Deployment Protection) when opened in an incognito window
- [ ] Preview page source has `<meta name="robots" content="noindex, nofollow">`
- [ ] Preview `/robots.txt` returns `Disallow: /` with no `Sitemap:` line

**Vercel — Staging:**
- [ ] `staging` branch deploys to the fixed `staging.<domain>` URL
- [ ] Same protection/noindex checks as Preview above, on the fixed staging URL specifically
- [ ] Staging environment variables are the ones intended for it, not accidentally the production set

**Vercel — Production:**
- [ ] `main` deploys to the real production domain
- [ ] Production URL is reachable without any login/password prompt
- [ ] `view-source:` on the homepage shows **no** `noindex` meta tag
- [ ] `curl https://<production-domain>/robots.txt` returns `Allow: /` and a `Sitemap:` line
- [ ] `curl https://<production-domain>/sitemap-index.xml` resolves and its URLs use the real production domain, not `localhost` or a `*.vercel.app` preview host
- [ ] View page source: canonical `<link rel="canonical">` and Open Graph `og:url` use the real production domain
- [ ] `curl -I https://<production-domain>/` shows the security headers from `vercel.json` (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) — this closes `docs/SECURITY.md` §7's one stated limitation ("no live deployment yet to verify headers against")
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` or `SANITY_TOKEN` value visible anywhere in browser dev tools (Network tab, page source, or client-side bundles) — confirms the server-only scoping in §3.3 actually held

**Environment variables, all environments:**
- [ ] Production and Preview/Staging scopes reviewed side by side in Vercel's dashboard — no production-only secret leaked into the Preview scope

---

## 6. Known gaps / next phase

1. `npm run preview` (`astro preview`) does not work against this project's server output — documented in §4, not fixed here (out of Phase 10's scope; would require either changing the adapter's output mode or the local testing tool, an architecture-level call for a future phase to make deliberately, not as a side effect of deployment setup).
2. Vercel Deployment Protection, the Staging domain assignment, and all real environment variable values are dashboard/account actions that need to be performed by the project owner (§2.2, §3.2–3.4) — this document gives exact steps, but nothing in §2–3 could be executed directly in this session (no `gh`/`vercel` CLI installed, no authenticated GitHub/Vercel connection, and OAuth login isn't something that can run non-interactively).
3. Once a real deployment exists, run through §5's checklist and report results before starting Phase 11 (Final QA) — several of its items (headers, canonical URLs, sitemap host) are explicitly things `docs/SECURITY.md` §7–8 already flagged as untestable before a live deployment.
