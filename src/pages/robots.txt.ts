// /robots.txt (docs/MASTER-PROJECT-SPEC.md §31). Content is entirely
// determined by which environment actually built this — same signal
// src/components/SEO.astro uses for the per-page <meta name="robots">
// tag. This file is the *courtesy* half of that pair, for crawlers
// that check robots.txt before requesting anything: the meta tag is
// what actually enforces "must not be indexed," since a crawler that
// already has a staging URL from somewhere else (a shared link, a
// misconfigured link) won't necessarily consult robots.txt first.
import type { APIRoute } from "astro";
import { isProductionSite } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const lines = isProductionSite()
    ? [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${new URL("sitemap-index.xml", site).toString()}`,
      ]
    : [
        // No Sitemap: line here on purpose — nothing about this build
        // should be easier for a crawler to enumerate.
        "User-agent: *",
        "Disallow: /",
      ];

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
