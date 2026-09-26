// Order submission types (docs/ARCHITECTURE.md §4). `OrderItem`
// deliberately omits price for the same reason `CartItem` does — see
// src/lib/cart.ts. Where an order actually gets persisted (Supabase
// table, email, both) is an explicit Phase 7 decision, not this one;
// these types only describe the shape of the request/response between
// the browser and the server routes below.
export interface OrderItem {
  bookId: string;
  quantity: number;
}

export interface OrderInput {
  customerName: string;
  email: string;
  phone?: string;
  notes?: string;
  items: OrderItem[];
}

/** One item the server rejected or adjusted during re-validation. */
export interface OrderItemIssue {
  bookId: string;
  /**
   * "unavailable" covers both "no such book" and "inactive/out of
   * stock" — the client never has a legitimate reason to distinguish
   * the two, since either way the item can't be ordered.
   */
  reason: "unavailable" | "quantity-reduced";
  /** Present only for "quantity-reduced": the stock-limited quantity. */
  adjustedQuantity?: number;
}

export type OrderSubmitResult =
  | { ok: true; orderId: string }
  | { ok: false; fieldErrors?: Partial<Record<keyof OrderInput, string>>; itemIssues?: OrderItemIssue[] };
