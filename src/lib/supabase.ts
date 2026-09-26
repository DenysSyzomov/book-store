// Supabase client for public (anon-key) reads (docs/ARCHITECTURE.md §7,
// docs/MASTER-PROJECT-SPEC.md §16). Imported exclusively by
// src/lib/books.ts — never from a client:* island or an inline
// <script> tag, and never anywhere else in the app. Astro components
// that need book data call the functions in src/lib/books.ts instead,
// which is what keeps "how books are fetched" a decision made in
// exactly one place.
//
// There is deliberately no service-role client in this file. Nothing
// in this project yet needs privileged writes (no admin tooling, no
// order persistence to Supabase — src/pages/api/cart/submit.ts still
// just validates and returns, per that file's own header comment).
// Row Level Security is what actually keeps the public storefront
// read-only (supabase/migrations/20260125000100_books_rls.sql); this
// client only ever authenticates as `anon`, so it couldn't bypass that
// even if a bug tried to. If a future phase needs a privileged write
// path, its client belongs in this same file — never anywhere else —
// built from SUPABASE_SERVICE_ROLE_KEY (server-only, already reserved
// in .env.example) and still never imported into client-side code.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.",
  );
}

// The anon/publishable key is meant to be public (Astro's own
// PUBLIC_ convention would compile it into client bundles too) — but
// this client is only ever constructed here, on the server, at build
// time or inside an API route (see src/lib/books.ts's callers, all of
// which are Astro frontmatter or getStaticPaths, never a <script>
// tag). RLS is what actually stops this key from reading anything it
// shouldn't; the key itself carries no special trust.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
