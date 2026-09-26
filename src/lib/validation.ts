// Shared customer-form validation rules (docs/MASTER-PROJECT-SPEC.md
// §11, CLAUDE.md rule 13). Imported from BOTH the browser (CustomerForm's
// inline <script>, for instant feedback) and the server
// (src/pages/api/cart/submit.ts, which re-runs the same checks). The
// client copy exists only for a snappier form; the server copy is the
// one that actually decides whether an order is accepted — a request
// that skips the browser entirely (curl, a bot) still has to pass this.
import type { OrderInput } from "../types/order";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose on purpose — international phone numbers vary widely in
// punctuation. This exists to bound length and character set (no HTML,
// no control characters), not to enforce a specific national format.
const PHONE_PATTERN = /^[0-9+()\-.\s]*$/;

// Server-side bounds (CLAUDE.md rule 13: validate external input on the
// server; a request can come from curl or a script, not just this
// form). Generous enough that no real customer ever hits them — these
// exist to cap how much text an unauthenticated request can push
// through this route, not to police normal input.
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 §4.5.3.1.3
const MAX_PHONE_LENGTH = 32;
const MAX_NOTES_LENGTH = 2000;

export interface FieldErrors {
  customerName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

/**
 * Validates the customer-facing fields of an order. Deliberately does
 * NOT look at `items` — cart contents are re-checked separately against
 * real book data (see validateOrderItems in src/pages/api/cart/*.ts)
 * because "is this a real book with enough stock" and "is this a real
 * name/email" are unrelated questions.
 */
export function validateCustomerFields(
  input: Pick<OrderInput, "customerName" | "email" | "phone" | "notes">,
): FieldErrors {
  const errors: FieldErrors = {};

  const name = input.customerName?.trim() ?? "";
  if (name.length < 2) {
    errors.customerName = "Enter your full name.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.customerName = "Name is too long.";
  }

  const email = input.email?.trim() ?? "";
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const phone = input.phone?.trim() ?? "";
  if (
    phone &&
    (phone.length > MAX_PHONE_LENGTH || !PHONE_PATTERN.test(phone))
  ) {
    errors.phone = "Enter a valid phone number.";
  }

  const notes = input.notes ?? "";
  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = "Notes are too long.";
  }

  return errors;
}
