-- Reproducible test script for public.books' RLS + constraints
-- (the four checks docs/AGENT-WORKFLOW.md §20 asks for: active books
-- readable, inactive books hidden, unauthorized writes rejected,
-- invalid data rejected). Run against a real Supabase/Postgres
-- instance — a local `supabase start` stack, or a remote project via
-- `psql "$DATABASE_URL" -f supabase/tests/books_rls.sql` — or paste
-- directly into the Supabase SQL editor.
--
-- Uses `set role` to genuinely execute as `anon`, the same Postgres
-- role PostgREST authenticates browser requests as when they carry
-- the anon/publishable key — this is real RLS enforcement, not a
-- simulation, because this table's policy (is_active = true) doesn't
-- depend on a JWT claim that only a real HTTP request would carry.
--
-- Wrapped in a transaction that always rolls back: this script proves
-- the rules hold without leaving any test rows behind, and without
-- risking real catalog data even if something behaves unexpectedly.
begin;

-- Needs at least one active and one inactive row to test against.
-- Safe no-op if supabase/seed.sql has already been applied.
insert into public.books
  (slug, title, author, description, price, image_url, stock, is_active, category)
values
  ('rls-test-active', 'RLS Test (active)', 'Test Author', 'x', 10, 'http://x', 5, true, 'Fiction'),
  ('rls-test-inactive', 'RLS Test (inactive)', 'Test Author', 'x', 10, 'http://x', 5, false, 'Fiction')
on conflict (slug) do nothing;

-- 1. Active books can be read (as anon).
set role anon;
do $$
declare
  found_active boolean;
begin
  select exists(
    select 1 from public.books where slug = 'rls-test-active'
  ) into found_active;

  if not found_active then
    raise exception 'FAIL: anon could not read an active book';
  end if;
  raise notice 'PASS: anon can read active books';
end $$;

-- 2. Inactive books cannot be exposed (as anon).
do $$
declare
  found_inactive boolean;
begin
  select exists(
    select 1 from public.books where slug = 'rls-test-inactive'
  ) into found_inactive;

  if found_inactive then
    raise exception 'FAIL: anon could read an inactive book';
  end if;
  raise notice 'PASS: inactive books are hidden from anon';
end $$;

-- 3. Unauthorized writes are rejected (as anon: insert, update, delete).
do $$
begin
  begin
    insert into public.books (slug, title, author, description, price, image_url, category)
    values ('rls-test-hack', 'Hack', 'X', 'x', 1, 'http://x', 'Fiction');
    raise exception 'FAIL: anon was able to INSERT';
  exception when insufficient_privilege then
    raise notice 'PASS: anon INSERT rejected';
  end;
end $$;

do $$
declare
  rows_changed integer;
begin
  update public.books set price = 0 where slug = 'rls-test-active';
  get diagnostics rows_changed = row_count;
  if rows_changed > 0 then
    raise exception 'FAIL: anon was able to UPDATE a book';
  end if;
  raise notice 'PASS: anon UPDATE affected 0 rows';
end $$;

do $$
declare
  rows_changed integer;
begin
  delete from public.books where slug = 'rls-test-active';
  get diagnostics rows_changed = row_count;
  if rows_changed > 0 then
    raise exception 'FAIL: anon was able to DELETE a book';
  end if;
  raise notice 'PASS: anon DELETE affected 0 rows';
end $$;

reset role;

-- 4. Invalid data is rejected — constraints apply to every role,
-- including a privileged one, so these run back as the test's own
-- (privileged) connection role, not as anon.
do $$
begin
  begin
    insert into public.books (slug, title, author, description, price, image_url, category)
    values ('rls-test-bad-price', 'Bad', 'X', 'x', -1, 'http://x', 'Fiction');
    raise exception 'FAIL: negative price was accepted';
  exception when check_violation then
    raise notice 'PASS: negative price rejected';
  end;
end $$;

do $$
begin
  begin
    insert into public.books (slug, title, author, description, price, image_url, stock, category)
    values ('rls-test-bad-stock', 'Bad', 'X', 'x', 1, 'http://x', -1, 'Fiction');
    raise exception 'FAIL: negative stock was accepted';
  exception when check_violation then
    raise notice 'PASS: negative stock rejected';
  end;
end $$;

do $$
begin
  begin
    insert into public.books (slug, title, author, description, price, image_url, category)
    values ('rls-test-active', 'Duplicate', 'X', 'x', 1, 'http://x', 'Fiction');
    raise exception 'FAIL: duplicate slug was accepted';
  exception when unique_violation then
    raise notice 'PASS: duplicate slug rejected';
  end;
end $$;

do $$
begin
  begin
    insert into public.books (slug, title, author, description, price, image_url, category)
    values ('Not A Valid Slug!', 'Bad', 'X', 'x', 1, 'http://x', 'Fiction');
    raise exception 'FAIL: invalid slug format was accepted';
  exception when check_violation then
    raise notice 'PASS: invalid slug format rejected';
  end;
end $$;

-- Always rolls back — see the file header. If every block above
-- raised its "PASS" notice rather than escaping the transaction as an
-- uncaught FAIL, this script as a whole succeeded.
rollback;
