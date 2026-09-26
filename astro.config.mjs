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
      // Every page that reads Sanity content is prerendered at build
      // time (see the `prerender = true` note below) — there's no
      // per-request "always fresh" need the CDN's edge cache would
      // conflict with, and skipping the CDN means a build always sees
      // the very latest published content, not whatever the CDN last
      // cached.
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
  // by default — the opposite default from `"static"`. That would
  // silently turn index.astro / books/index.astro / books/[slug].astro
  // from build-time HTML into per-request SSR, losing the "fast first
  // paint, works with JS disabled, crawlable" property
  // docs/ARCHITECTURE.md §5 explicitly assigns them. Each of those
  // pages opts back into build-time prerendering with its own
  // `export const prerender = true;` — only the two API routes above
  // are actually server-rendered per-request.
  output: "server",
  adapter: vercel(),
});