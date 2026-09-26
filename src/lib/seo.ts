// SEO helpers: environment detection + JSON-LD schema builders
// (docs/MASTER-PROJECT-SPEC.md §29, §30, §31; docs/ARCHITECTURE.md's
// SEO.astro section). Kept separate from src/components/SEO.astro
// itself so the actual schema.org shapes are plain, testable
// functions — the component's only job is rendering whatever object
// it's handed, never deciding what belongs in it.
import type { Book } from "../types/book";

export const SITE_NAME = "Folio & Co.";

/**
 * True only on a real Vercel *production* build. `VERCEL_ENV` is set
 * automatically by Vercel for every deployment (production | preview |
 * development) — nothing to configure. Anywhere else (local dev, a
 * build run outside Vercel entirely) this is false, which is the
 * safer default: a build we can't positively confirm is production
 * gets treated as one that must not be indexed
 * (docs/MASTER-PROJECT-SPEC.md §31).
 */
export function isProductionSite(): boolean {
  return import.meta.env.VERCEL_ENV === "production";
}

/**
 * WebSite + Organization — the two schemas MASTER-PROJECT-SPEC.md §30
 * names for the homepage. Both point at the same real site URL; no
 * field here is anything beyond what the site actually is (no
 * fabricated address, phone, or social links — this project has none
 * to report).
 */
export function buildSiteSchemas(siteUrl: string): Record<string, unknown>[] {
  return [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: SITE_NAME,
      url: siteUrl,
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: SITE_NAME,
      url: siteUrl,
    },
  ];
}

/**
 * Product (+ Book facet) schema for a single book detail page, built
 * entirely from the same `Book` object the page itself renders —
 * never a hand-maintained duplicate that could drift from what a
 * visitor actually sees (docs/ARCHITECTURE.md §11's "What goes wrong"
 * note on this exact risk). Optional fields (`isbn`) are included only
 * when the book actually has one, same as BookMetadataTable.astro's
 * own rule for what to display.
 */
export function buildBookProductSchema(
  book: Book,
  pageUrl: string,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": ["Product", "Book"],
    "@id": `${pageUrl}#product`,
    name: book.title,
    image: book.imageUrl,
    description: book.description,
    author: {
      "@type": "Person",
      name: book.author,
    },
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "USD",
      price: book.price,
      availability:
        book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  if (book.isbn) schema.isbn = book.isbn;

  return schema;
}
