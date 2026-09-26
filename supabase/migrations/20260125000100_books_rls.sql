-- Row Level Security for public.books (docs/MASTER-PROJECT-SPEC.md §16,
-- CLAUDE.md rules 11/12). This is what actually enforces "public users
-- can only read active products" — at the database layer, not as an
-- application-level filter that a bug or a bypassed query could skip.
--
-- Two Postgres roles matter here (both built into every Supabase
-- project, nothing to create): `anon` (an unauthenticated request —
-- the only kind this no-accounts storefront ever makes) and
-- `authenticated` (a logged-in user; this project has no login system
-- yet, but granting the same public read to both costs nothing and
-- avoids a silent behavior change if auth is ever added later).
-- `service_role` is a third, separate role — it bypasses RLS
-- entirely by design, which is exactly why it must never reach the
-- browser (src/lib/supabase.ts never uses it; see that file's header
-- comment).
alter table public.books enable row level security;

-- Belt-and-suspenders: forces RLS even for the table owner. Doesn't
-- affect `anon`/`authenticated` (they were never exempt), and doesn't
-- affect `service_role` (it bypasses RLS via a separate privilege,
-- not ownership) — this only closes the one remaining gap where
-- someone runs a query as the table's own owner role.
alter table public.books force row level security;

-- The only policy this table needs: `anon`/`authenticated` may SELECT
-- rows where is_active = true, full stop. No policy exists for
-- INSERT/UPDATE/DELETE for either role — under RLS, "no matching
-- policy" means the operation is denied, so product management
-- (writes) is already fully separated from public storefront access
-- without needing an explicit deny rule.
create policy "public can read active books"
  on public.books
  for select
  to anon, authenticated
  using (is_active = true);

-- Explicit, reproducible grants rather than relying on whatever a
-- given project's dashboard defaults happen to be — this migration
-- should produce the same result on any Supabase project it's applied
-- to.
grant usage on schema public to anon, authenticated;
grant select on public.books to anon, authenticated;

-- No `grant insert/update/delete` to anon/authenticated anywhere in
-- this migration — that omission, combined with RLS being enabled
-- above, is the actual mechanism behind "clients must not be able to
-- arbitrarily modify products". Any future admin/management write path
-- authenticates as `service_role` (server-only — see
-- src/lib/supabase.ts), which bypasses RLS by design and therefore
-- doesn't need a policy here at all.
