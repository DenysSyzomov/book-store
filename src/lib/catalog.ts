// Client-side lookup of book display data, for rendering cart rows
// (docs/ARCHITECTURE.md §6). The cart itself only stores
// `{ bookId, quantity }` (src/lib/cart.ts) — no title, cover, or price
// — so the drawer needs somewhere to turn an id back into something a
// person can read.
//
// That "somewhere" is a `<script type="application/json">` block that
// Layout.astro renders on every page, filled server-side from the same
// `getBooks()` every other page already uses. This is NOT a network
// request: it's data the server already put in the HTML response, so
// reading it here costs nothing and needs no fetch/await. It's also
// not the final word on price — see src/pages/api/cart/*.ts, which
// re-checks price and stock on the server before anything is submitted.
export interface CatalogEntry {
  id: string;
  slug: string;
  title: string;
  author: string;
  imageUrl: string;
  price: number;
  stock: number;
}

/**
 * A "type guard" (see src/lib/cart.ts for the same pattern): narrows
 * `unknown` JSON down to `CatalogEntry` only after checking every
 * field is actually the shape we expect.
 */
function isCatalogEntry(value: unknown): value is CatalogEntry {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.slug === "string" &&
    typeof c.title === "string" &&
    typeof c.author === "string" &&
    typeof c.imageUrl === "string" &&
    typeof c.price === "number" &&
    typeof c.stock === "number"
  );
}

// Read once per page load and cached in a module-level variable — a
// `Map` here, JavaScript's built-in key/value collection, chosen over
// a plain object so lookups are `catalog.get(id)` with no risk of
// colliding with inherited object properties like "constructor".
let cache: Map<string, CatalogEntry> | null = null;

export function getCatalog(): Map<string, CatalogEntry> {
  if (cache) return cache;
  cache = new Map();

  const node = document.getElementById("book-catalog");
  if (!node?.textContent) return cache;

  try {
    const parsed: unknown = JSON.parse(node.textContent);
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (isCatalogEntry(entry)) {
          cache.set(entry.id, entry);
        }
      }
    }
  } catch {
    // Malformed embedded JSON: degrade to an empty catalog (cart rows
    // fall back to their "unknown item" state) rather than throw and
    // break the whole drawer.
  }

  return cache;
}
