// Order notification email, sent via Resend's HTTP API (docs/ARCHITECTURE.md
// §10). A plain `fetch` call against Resend's REST endpoint needs no SDK, so
// this adds zero new dependencies (CLAUDE.md rule #14). Only ever called
// server-side from src/pages/api/cart/submit.ts, after an order has already
// passed price/stock re-validation — RESEND_API_KEY is server-only and must
// never be imported into a component's client-side script.
//
// This is a best-effort notification, not the order's system of record: no
// database persistence exists yet (that's still an open Phase 7 decision,
// per src/types/order.ts's header). If Resend is unreachable or misconfigured,
// the customer's request is still accepted — a failed email must not turn
// into a failed checkout — but the failure is logged so it's visible in
// Vercel's function logs instead of silently vanishing.
import type { OrderInput } from "../types/order";
import type { ResolvedOrderItem } from "./orders";

const RESEND_API_URL = "https://api.resend.com/emails";

export interface OrderNotificationInput {
  orderId: string;
  customer: OrderInput;
  items: ResolvedOrderItem[];
  subtotal: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function buildEmailHtml({ orderId, customer, items, subtotal }: OrderNotificationInput): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${formatCurrency(item.lineTotal)}</td>
        </tr>`,
    )
    .join("");

  return `
    <h1>New order request — #${escapeHtml(orderId)}</h1>
    <p><strong>Name:</strong> ${escapeHtml(customer.customerName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>
    ${customer.phone ? `<p><strong>Phone:</strong> ${escapeHtml(customer.phone)}</p>` : ""}
    ${customer.notes ? `<p><strong>Notes:</strong> ${escapeHtml(customer.notes)}</p>` : ""}
    <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse;">
      <thead>
        <tr><th>Book</th><th>Qty</th><th>Price</th><th>Line total</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
    <p>No payment has been taken — this is a request only.</p>
  `;
}

export async function sendOrderNotification(input: OrderNotificationInput): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.ORDER_NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    console.error(
      `[orders] Order ${input.orderId} accepted, but RESEND_API_KEY / ORDER_NOTIFICATION_EMAIL isn't configured — no notification email was sent.`,
    );
    return;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Folio & Co. <onboarding@resend.dev>",
        to: [to],
        reply_to: input.customer.email,
        subject: `New order request — #${input.orderId}`,
        html: buildEmailHtml(input),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `[orders] Resend rejected order ${input.orderId}'s notification email (${response.status}): ${body}`,
      );
    }
  } catch (error) {
    console.error(`[orders] Failed to send notification email for order ${input.orderId}`, error);
  }
}
