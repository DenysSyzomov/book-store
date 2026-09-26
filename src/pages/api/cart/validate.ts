// POST /api/cart/validate — re-checks the browser's cart against real
// book data before showing the customer-information form
// (docs/ARCHITECTURE.md §5). The client's copy of price/stock (baked
// into the page when it was rendered) can be stale by the time someone
// gets to checkout — a book might have sold out or changed price in
// another tab. This route is the server saying what's actually true
// right now, so the drawer can show an honest subtotal and warn about
// anything that changed before the customer fills in their details.
import type { APIRoute } from "astro";
import { validateOrderItems } from "../../../lib/orders";
import type { OrderItem } from "../../../types/order";

export const prerender = false;

function isOrderItem(value: unknown): value is OrderItem {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return typeof c.bookId === "string" && typeof c.quantity === "number";
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rawItems =
    typeof body === "object" && body !== null && "items" in body
      ? (body as Record<string, unknown>).items
      : undefined;

  if (!Array.isArray(rawItems)) {
    return new Response(JSON.stringify({ error: "`items` must be an array." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const items = rawItems.filter(isOrderItem);
  const { resolvedItems, issues, subtotal } = await validateOrderItems(items);

  return new Response(JSON.stringify({ resolvedItems, issues, subtotal }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
