// Server-only order/price re-validation (docs/ARCHITECTURE.md §5, §6;
// CLAUDE.md rules 12 & 13). Runs inside the two API routes in
// src/pages/api/cart/ — never imported into a component's client-side
// script. This is the one place a cart's contents get checked against
// real book data before anything is treated as an actual order: it
// ignores whatever quantity the browser sends past each book's real
// stock, and it always reads the price fresh from `getBookById`, never
// from anything the client provided.
import { getBookById } from "./books";
import type { OrderItem, OrderItemIssue } from "../types/order";

export interface ResolvedOrderItem {
  bookId: string;
  title: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface OrderItemsValidation {
  resolvedItems: ResolvedOrderItem[];
  issues: OrderItemIssue[];
  subtotal: number;
}

// A real cart never approaches this — it exists to bound how many
// sequential book look-ups an unauthenticated request can force this
// route to run (an oversized `items` array is otherwise a cheap way to
// make one HTTP request trigger hundreds of database queries).
const MAX_ITEMS = 50;

export async function validateOrderItems(
  items: OrderItem[],
): Promise<OrderItemsValidation> {
  const resolvedItems: ResolvedOrderItem[] = [];
  const issues: OrderItemIssue[] = [];

  for (const item of items.slice(0, MAX_ITEMS)) {
    const book = await getBookById(item.bookId);

    if (!book || book.stock <= 0) {
      issues.push({ bookId: item.bookId, reason: "unavailable" });
      continue;
    }

    const requestedQuantity = Math.max(1, Math.trunc(item.quantity) || 1);
    const quantity = Math.min(requestedQuantity, book.stock);

    if (quantity < requestedQuantity) {
      issues.push({
        bookId: item.bookId,
        reason: "quantity-reduced",
        adjustedQuantity: quantity,
      });
    }

    resolvedItems.push({
      bookId: book.id,
      title: book.title,
      quantity,
      price: book.price,
      lineTotal: book.price * quantity,
    });
  }

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return { resolvedItems, issues, subtotal };
}
