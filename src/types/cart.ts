// Cart domain type (docs/MASTER-PROJECT-SPEC.md §12, docs/ARCHITECTURE.md
// §4 — deliberately unchanged from the spec). This is a TypeScript
// "interface": a compile-time-only description of what shape an object
// must have. It produces no runtime code at all — after `tsc`/esbuild
// strips types, this file simply doesn't exist in the shipped JS. Its
// job is to make illegal states (e.g. a cart item missing a quantity)
// a red squiggly line in your editor instead of a bug you find in
// production.
//
// On purpose, this does NOT include price. See src/lib/cart.ts for why:
// the cart is not allowed to be the source of truth for money.
export interface CartItem {
  bookId: string;
  quantity: number;
}
