// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";

// astro.config.mjs runs before Astro's own env loading, so
// `import.meta.env.PUBLIC_*` isn't available here yet even though it
// works everywhere else in the app — this reads the same .env file
// directly via Vite's loadEnv so the integration below can be
// configured with the real project id/dataset (docs/AGENT-WORKFLOW.md
// §21; docs/MASTER-PROJECT-SPEC.md §19: integrate via the official
// Astro integration).
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  // The canonical, real-world address of the site — required for
  // Astro to build absolute URLs (canonical tags, Open Graph, the
  // sitemap) instead of ambiguous relative ones. PUBLIC_SITE_URL is
  // set per Vercel environment (see .env.example); locally, or if it's
  // ever unset, this falls back to the dev server's own address rather
  // than silently producing broken/empty URLs.
  site: process.env.PUBLIC_SITE_URL || "http://localhost:4321",
  integrations: [
    sitemap(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      // index.astro (the only page reading Sanity content) is
      // server-rendered and ISR-cached (see the `isr` option below),
      // not built once and frozen — so every regeneration should see
      // the very latest published content rather than whatever
      // Sanity's own CDN last cached. The 60s ISR window is already
      // the freshness delay; stacking the CDN's own cache on top of
      // that would just add a second, redundant staleness window.
      useCdn: false,
    }),
    // Studio itself (studio/) is a separate app with its own
    // package.json, deployed independently — see sanity.config.ts's
    // own comment for why a content manager's login stays decoupled
    // from this app's deploy pipeline.
  ],
  // Phase 4 (Cart) introduces the project's first server-only logic:
  // src/pages/api/cart/{validate,submit}.ts, which re-check price and
  // stock against src/lib/books.ts instead of trusting the browser's
  // copy (docs/ARCHITECTURE.md §5, §6). An API route needs a real
  // server to run on, not a static file — hence `output: "server"` and
  // the `@astrojs/vercel` adapter this project already committed to
  // (docs/ARCHITECTURE.md §1's diagram: "Astro app on Vercel").
  //
  // Under `output: "server"`, every page is server-rendered on request
  // by default — including index.astro / books/index.astro /
  // books/[slug].astro, which used to opt out via
  // `export const prerender = true;`. That's deliberately gone now
  // (docs/ARCHITECTURE.md §7 "Book data freshness (ISR)"): a book added
  // in Supabase needs to show up without a full redeploy. `isr` below
  // is what keeps these SSR pages from losing the "fast, static-like"
  // property that `prerender = true` used to provide — Vercel caches
  // each rendered page and only re-runs it once the expiration below
  // has passed, rather than hitting Supabase/Sanity on every request.
  output: "server",
  adapter: vercel({
    isr: {
      // How long (in seconds) a cached page is served before Vercel
      // regenerates it in the background on the next request past that
      // point — the actual "how fast does a new book appear" number.
      // 60s was chosen as a reasonable default staleness window; lower
      // it if that ever feels too slow, at the cost of hitting
      // Supabase/Sanity more often.
      expiration: 60,
      // `isr` with no `exclude` wraps every non-prerendered route,
      // including src/pages/api/cart/{validate,submit}.ts — caching a
      // POST endpoint's response is exactly the kind of bug
      // docs/ARCHITECTURE.md §10's trust-boundary section warns about
      // (a stale/replayed price validation or order-acceptance
      // response served to a different request). API routes must
      // always run fresh, so they're excluded from ISR entirely and
      // stay on the plain serverless function.
      exclude: [/^\/api\//],
    },
  }),
  build: {
    // Astro's default ("auto") inlines a page's CSS directly as a
    // <style> block when it's small enough — but vercel.json's CSP
    // sets `style-src 'self'` with no `'unsafe-inline'` and no hash,
    // so the browser silently drops any inlined stylesheet (found on
    // /books and every book detail page during Phase 10 deployment
    // testing — docs/DEPLOYMENT.md §4). Forcing stylesheets to always
    // be external files (already how the homepage's larger CSS chunk
    // behaved) fixes this without loosening the CSP.
    inlineStylesheets: "never",
  },
  vite: {
    build: {
      // The same inlining problem as inlineStylesheets above, but for
      // hoisted <script> tags: Astro inlines a script's bundled chunk
      // directly into the page HTML whenever it has no imports and is
      // under Vite's assetsInlineLimit (default 4KB) — see
      // node_modules/astro/dist/core/build/plugins/plugin-scripts.js.
      // QuantityStepper.astro's script has no imports (unlike
      // Header/CartDrawer/[slug].astro's, which import from src/lib
      // and get externalized), so it was getting inlined — and
      // vercel.json's CSP (script-src 'self' plus one fixed sha256
      // hash, no 'unsafe-inline') silently dropped it, which is why
      // the book page's quantity +/- buttons did nothing once
      // deployed behind that CSP. Excluding .js chunks keeps every
      // hoisted script external without changing inlining for other
      // small assets (e.g. images as data URIs), which aren't
      // executable and don't hit script-src.
      assetsInlineLimit: (filePath) =>
        filePath.endsWith(".js") ? false : undefined,
    },
  },
});