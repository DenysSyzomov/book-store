// POST /api/cart/submit — the only place an order is actually accepted
// (docs/MASTER-PROJECT-SPEC.md §11, docs/ARCHITECTURE.md §5). Re-runs
// both halves of validation server-side — customer fields and cart
// items — because a request here might not have come through the form
// at all (a replayed request, a script). Nothing is trusted just
// because the browser already showed a green checkmark for it.
//
// This route still does NOT write the order anywhere durable (no
// database row) — that's still an open Phase 7 decision
// (docs/ARCHITECTURE.md §4, "Order"), once Supabase exists.
// It does now email the store owner via src/lib/notifications.ts, so
// an accepted order isn't only visible on the customer's own success
// screen. That email is best-effort: if it fails to send, the order
// is still accepted (see notifications.ts's own header for why).
import type { APIRoute } from "astro";
import { validateOrderItems } from "../../../lib/orders";
import { validateCustomerFields } from "../../../lib/validation";
import { sendOrderNotification } from "../../../lib/notifications";
import type { OrderInput, OrderItem, OrderSubmitResult } from "../../../types/order";

export const prerender = false;

function isOrderItem(value: unknown): value is OrderItem {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return typeof c.bookId === "string" && typeof c.quantity === "number";
}

function json(body: OrderSubmitResult, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  if (typeof body !== "object" || body === null) {
    return json({ ok: false }, 400);
  }

  const raw = body as Record<string, unknown>;
  const input: OrderInput = {
    customerName: typeof raw.customerName === "string" ? raw.customerName : "",
    email: typeof raw.email === "string" ? raw.email : "",
    phone: typeof raw.phone === "string" ? raw.phone : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    items: Array.isArray(raw.items) ? raw.items.filter(isOrderItem) : [],
  };

  const fieldErrors = validateCustomerFields(input);
  const { resolvedItems, issues, subtotal } = await validateOrderItems(input.items);

  const hasBlockingIssues =
    resolvedItems.length === 0 ||
    issues.some((issue) => issue.reason === "unavailable");

  if (Object.keys(fieldErrors).length > 0 || hasBlockingIssues) {
    return json({ ok: false, fieldErrors, itemIssues: issues }, 200);
  }

  // No persistence layer exists yet (see file header) — a random id is
  // enough for the success screen and the notification email to
  // reference something concrete without pretending an order was
  // actually stored anywhere.
  const orderId = crypto.randomUUID();

  await sendOrderNotification({ orderId, customer: input, items: resolvedItems, subtotal });

  return json({ ok: true, orderId }, 200);
};
