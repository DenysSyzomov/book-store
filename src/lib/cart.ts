// Client-side cart store (docs/AGENT-WORKFLOW.md §17, docs/ARCHITECTURE.md
// §6). This file only ever runs in the browser — it's imported from
// <script> tags in Header.astro, CartDrawer.astro and the book detail
// page, never from Astro frontmatter (which runs on the server, where
// there is no `window` or `localStorage`).
//
// This is the one place cart state is read and written. Every other
// file (Header badge, drawer, "Add to bag" button) calls these
// functions instead of touching localStorage directly — that's what
// keeps them all in agreement about what's actually in the cart.
//
// On purpose, a CartItem is only `{ bookId, quantity }` — no price, no
// title, no cover. Storing price here would mean a book's price
// changing after someone adds it shows them a stale number, and it
// would tempt a future checkout button to trust that stored price
// instead of asking the server again. The browser is never the source
// of truth for money — see src/pages/api/cart/*.ts, which re-look-up
// every price and stock value from scratch before an order is accepted.
import type { CartItem } from "../types/cart";

const STORAGE_KEY = "book-store:cart";

/**
 * The name of the browser event this module fires on `window` every
 * time the cart changes. A "custom event" is the same Event system a
 * click or a keypress uses — `window.dispatchEvent` and
 * `addEventListener` work identically for both — except *we* choose
 * when it fires and what data it carries, via `CustomEvent`'s `detail`
 * property. This is what lets the header badge and the drawer both
 * react to an "add to cart" click without either of them polling or
 * knowing about each other directly: they just both listen for this
 * one event name.
 */
export const CART_CHANGE_EVENT = "cart:change";

export interface CartChangeDetail {
  items: CartItem[];
}

/**
 * A "type guard": a function whose return type (`value is CartItem`)
 * tells TypeScript that if it returns `true`, `value` is safe to treat
 * as a `CartItem` from that point on. We need this because
 * `JSON.parse` always returns `any` — TypeScript has no way to know
 * what shape is actually inside a string someone (or some browser
 * extension, or a previous, different version of this site) wrote to
 * localStorage. Checking by hand here is what makes "gracefully handle
 * malformed localStorage data" true instead of just assumed.
 */
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.bookId === "string" &&
    candidate.bookId.length > 0 &&
    typeof candidate.quantity === "number" &&
    Number.isFinite(candidate.quantity) &&
    candidate.quantity >= 1
  );
}

/**
 * Reads the cart out of localStorage. `localStorage` is a browser API
 * that stores string key/value pairs on the visitor's device, kept
 * between visits (unlike a plain JS variable, which resets on every
 * page load). It can only ever hold strings, which is why the cart —
 * an *array* of *objects* — has to be serialized to text first with
 * `JSON.stringify` (see `writeCart` below) and turned back into real
 * objects here with `JSON.parse`.
 *
 * `localStorage` access can throw for reasons that have nothing to do
 * with what's stored — private browsing in some browsers, a user
 * disabling site storage, a sandboxed iframe. `JSON.parse` throws if
 * the text isn't valid JSON at all (corrupted data, or written by a
 * future/different version of this site). The try/catch below treats
 * every one of those cases the same way: fall back to an empty cart
 * rather than let the whole page crash.
 */
function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // .filter keeps only the array entries that pass isCartItem — any
    // malformed entry (a typo'd shape, a stray null) is quietly
    // dropped instead of poisoning the whole cart.
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

/**
 * Writes the cart back to localStorage and tells the rest of the page
 * it changed. `items: CartItem[]` is an "array of objects": each
 * element is an object with named fields (`bookId`, `quantity`)
 * rather than, say, a bare list of ids — that's what lets a single
 * item carry both "which book" and "how many" together.
 */
function writeCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage blocked or full: the in-memory result of this call is
    // still correct for the current page, it just won't survive a
    // refresh. Fail silently rather than throw.
  }

  // `new CustomEvent(name, { detail })` builds an event carrying
  // arbitrary data; `window.dispatchEvent(...)` fires it immediately
  // to every listener currently registered with
  // `window.addEventListener(name, ...)`, synchronously, in the order
  // they were added — same delivery mechanism as a native "click".
  window.dispatchEvent(
    new CustomEvent<CartChangeDetail>(CART_CHANGE_EVENT, {
      detail: { items },
    }),
  );
}

/** The current cart contents, most-recently-added last. */
export function getCart(): CartItem[] {
  return readCart();
}

/**
 * Adds `quantity` of a book to the cart, or increases the existing
 * line's quantity if it's already there. Returns the new cart so a
 * caller can use the result immediately without a second read.
 */
export function addItem(bookId: string, quantity = 1): CartItem[] {
  const safeQuantity = Math.max(1, Math.trunc(quantity) || 1);
  const items = readCart();

  // .find scans the array and returns the first element the callback
  // ("predicate") returns true for, or undefined if none match — this
  // is a plain JS function passed as an argument to another function,
  // the pattern used throughout this file (.find, .filter, .reduce,
  // .map all take one).
  const existing = items.find((item) => item.bookId === bookId);

  if (existing) {
    existing.quantity += safeQuantity;
  } else {
    items.push({ bookId, quantity: safeQuantity });
  }

  writeCart(items);
  return items;
}

/** Removes a book's line entirely, regardless of its quantity. */
export function removeItem(bookId: string): CartItem[] {
  const items = readCart().filter((item) => item.bookId !== bookId);
  writeCart(items);
  return items;
}

/** Increases one line's quantity by `step` (default 1). */
export function increaseQuantity(bookId: string, step = 1): CartItem[] {
  const items = readCart();
  const existing = items.find((item) => item.bookId === bookId);
  if (existing) {
    existing.quantity += step;
    writeCart(items);
  }
  return items;
}

/**
 * Decreases one line's quantity by `step` (default 1), but never below
 * 1 — dropping a line to 0 is what the Remove button is for, not the
 * minus stepper, so the two actions can't be confused with each other.
 */
export function decreaseQuantity(bookId: string, step = 1): CartItem[] {
  const items = readCart();
  const existing = items.find((item) => item.bookId === bookId);
  if (existing) {
    existing.quantity = Math.max(1, existing.quantity - step);
    writeCart(items);
  }
  return items;
}

/**
 * Sets a line's quantity to a specific value (never below 1). Not
 * exposed as a stepper action — the UI only ever increases/decreases
 * by 1 — this exists for the one place a specific number is correct to
 * set directly: applying a stock-limited quantity the server sent back
 * after re-validating the cart (see src/pages/api/cart/validate.ts).
 */
export function setQuantity(bookId: string, quantity: number): CartItem[] {
  const safeQuantity = Math.max(1, Math.trunc(quantity) || 1);
  const items = readCart();
  const existing = items.find((item) => item.bookId === bookId);
  if (existing) {
    existing.quantity = safeQuantity;
    writeCart(items);
  }
  return items;
}

/** Empties the cart, e.g. after a successful order submission. */
export function clearCart(): CartItem[] {
  writeCart([]);
  return [];
}

/** Total number of items across all lines (e.g. 2 + 1 = 3), for badges. */
export function getTotalQuantity(items: CartItem[] = readCart()): number {
  // .reduce walks the array once, carrying an accumulator (`sum`,
  // starting at 0) forward from each element to the next — the
  // general-purpose tool underneath "sum everything" and "total
  // everything up" alike.
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Subtotal in dollars, computed from *injected* prices rather than
 * anything stored in the cart itself. `priceLookup` is a "closure": a
 * function that a caller (the drawer) builds with its own trusted
 * price data already captured inside it, then hands to us. We never
 * see localStorage-controlled price data — only whatever number the
 * caller's closure decides to return for a given id — which is what
 * keeps this function honest about the "never trust the client for
 * price" rule even though it lives in client-side code.
 */
export function getSubtotal(
  items: CartItem[],
  priceLookup: (bookId: string) => number | undefined,
): number {
  return items.reduce((sum, item) => {
    const price = priceLookup(item.bookId) ?? 0;
    return sum + price * item.quantity;
  }, 0);
}
