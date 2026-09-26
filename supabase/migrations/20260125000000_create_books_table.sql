-- Books table: Supabase's first table, and the source of truth for
-- everything src/lib/books.ts used to read from src/data/books.ts
-- (docs/AGENT-WORKFLOW.md §20, docs/MASTER-PROJECT-SPEC.md §15).
--
-- Column set: the 10 fields MASTER-PROJECT-SPEC.md §15 asks for at
-- minimum (id, slug, title, author, description, price, image_url,
-- stock, is_active, created_at, updated_at), plus every field the
-- `Book` TypeScript type already required before this migration
-- existed (category, format, publisher, published_at, page_count,
-- isbn, dimensions, language) — Phase 7's own task list says "preserve
-- existing UI interfaces", and the book detail page
-- (BookMetadataTable.astro) genuinely renders all of these today, so
-- dropping any of them would break real, working UI, not just this
-- table's shape on paper.
create table if not exists public.books (
  -- bigint identity, not a random UUID: this is a single (non-
  -- distributed) database and a small catalog, so a sequential,
  -- SQL-standard identity column is both the simplest and the most
  -- index-efficient choice (no insert-order fragmentation the way a
  -- random UUIDv4 primary key would cause).
  id bigint generated always as identity primary key,

  slug text not null,
  title text not null,
  author text not null,
  description text not null,

  -- numeric, never float: exact decimal arithmetic matters for money.
  price numeric(10, 2) not null,
  image_url text not null,
  stock integer not null default 0,
  is_active boolean not null default true,

  -- Required in the app's Book type — drives breadcrumbs and "you may
  -- also like" (same-category lookups). Not in the spec's minimum
  -- list, but there is no working page without it.
  category text not null,

  -- Optional in the app's Book type: BookMetadataTable.astro already
  -- only renders a row for whichever of these a given book actually
  -- has, so nullable columns here are the accurate match, not a
  -- shortcut.
  format text,
  publisher text,
  published_at date,
  page_count integer,
  isbn text,
  dimensions text,
  language text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Two customers linking to "the same" book by slug (e.g. a shared
  -- /books/the-quiet-orchard URL) must always land on one, unambiguous
  -- row — a duplicate slug would silently break getBookBySlug()'s
  -- "exactly one result" assumption.
  constraint books_slug_unique unique (slug),

  -- "Non-negative price"/"non-negative stock" from the brief, enforced
  -- by the database itself — not just by application code that could
  -- have a bug or get bypassed.
  constraint books_price_non_negative check (price >= 0),
  constraint books_stock_non_negative check (stock >= 0),
  constraint books_page_count_positive check (page_count is null or page_count > 0),

  -- A lowercase, hyphenated slug is what every URL in this app
  -- generates (see src/data/books.ts's existing slugs) — this keeps a
  -- future manual insert from creating a slug that doesn't actually
  -- match the URL shape /books/[slug] expects.
  constraint books_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

comment on table public.books is
  'Commercial book catalog — Supabase owns this data (docs/MASTER-PROJECT-SPEC.md §8: Supabase owns commercial/product data). Editorial/marketing copy belongs in Sanity (Phase 8), not here.';

-- Supports the storefront's actual query patterns: "active books,
-- newest first" (getBooks/getFeaturedBooks) and "active books in this
-- category" (getRelatedBooks) — both always filter on is_active, so a
-- partial index (rows where is_active = true only) is smaller and
-- faster than indexing every row including ones the storefront never
-- serves.
create index if not exists books_active_created_at_idx
  on public.books (created_at desc)
  where is_active = true;

create index if not exists books_active_category_idx
  on public.books (category)
  where is_active = true;

-- Keeps `updated_at` honest on every UPDATE without relying on every
-- caller to remember to set it themselves.
create or replace function public.set_books_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row
  execute function public.set_books_updated_at();
