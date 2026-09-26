// Data-access layer for books (docs/AGENT-WORKFLOW.md §20,
// docs/ARCHITECTURE.md §7). Pages and components consume books
// through these functions, never by querying Supabase directly — every
// exported name and signature here is unchanged from when this file
// read src/data/books.ts's local mock array, which is what "the UI
// should not need to know that the source changed" (§20) actually
// means in practice: nothing outside this file was touched to make
// this migration happen.
import { supabase } from "./supabase";
import type { Book } from "../types/book";

/**
 * Shape of a row exactly as Postgres/PostgREST returns it — snake_case,
 * matching public.books' real column names
 * (supabase/migrations/20260125000000_create_books_table.sql). Kept
 * private to this file: nothing outside the data-access layer should
 * ever see a "row" shape, only the camelCase `Book` type below.
 */
interface BookRow {
  id: number;
  slug: string;
  title: string;
  author: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  is_active: boolean;
  category: string;
  format: string | null;
  publisher: string | null;
  published_at: string | null;
  page_count: number | null;
  isbn: string | null;
  dimensions: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
}

const BOOK_COLUMNS =
  "id, slug, title, author, description, price, image_url, stock, is_active, category, format, publisher, published_at, page_count, isbn, dimensions, language, created_at, updated_at";

function mapRowToBook(row: BookRow): Book {
  return {
    // Every id in this app (cart line items, the embedded catalog,
    // getBookById's own parameter) is a string — converting here,
    // once, is what lets a bigint identity column exist in Postgres
    // without every caller needing to know or care about that.
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    author: row.author,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    stock: row.stock,
    isActive: row.is_active,
    category: row.category,
    format: row.format ?? undefined,
    publisher: row.publisher ?? undefined,
    publishedAt: row.published_at ?? undefined,
    pageCount: row.page_count ?? undefined,
    isbn: row.isbn ?? undefined,
    dimensions: row.dimensions ?? undefined,
    language: row.language ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * All publicly visible books, in catalog order (newest first). The
 * `.eq("is_active", true)` here is belt-and-suspenders, not the real
 * guarantee — Row Level Security
 * (supabase/migrations/20260125000100_books_rls.sql) is what actually
 * makes it impossible for this query to ever receive an inactive row
 * back, even if this line were deleted by mistake.
 */
export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getBooks: ${error.message}`);
  return ((data as BookRow[] | null) ?? []).map(mapRowToBook);
}

/** Every visible book's slug — used by getStaticPaths(). */
export async function getAllBookSlugs(): Promise<string[]> {
  const books = await getBooks();
  return books.map((book) => book.slug);
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`getBookBySlug: ${error.message}`);
  return data ? mapRowToBook(data as BookRow) : undefined;
}

export async function getBookById(id: string): Promise<Book | undefined> {
  // The id parameter is always a string in this app (see mapRowToBook's
  // comment) — this just undoes that conversion to match the real
  // bigint column. Anything that isn't actually a whole number can't
  // be a valid id, so it's treated the same as "not found" instead of
  // sending a malformed query.
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return undefined;

  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("is_active", true)
    .eq("id", numericId)
    .maybeSingle();

  if (error) throw new Error(`getBookById: ${error.message}`);
  return data ? mapRowToBook(data as BookRow) : undefined;
}

/** First N visible books, for the homepage "New arrivals" slider. */
export async function getFeaturedBooks(limit = 6): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getFeaturedBooks: ${error.message}`);
  return ((data as BookRow[] | null) ?? []).map(mapRowToBook);
}

/** Other visible books sharing the same category, for "You may also like". */
export async function getRelatedBooks(book: Book, limit = 4): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("is_active", true)
    .eq("category", book.category)
    .neq("id", Number(book.id))
    .limit(limit);

  if (error) throw new Error(`getRelatedBooks: ${error.message}`);
  return ((data as BookRow[] | null) ?? []).map(mapRowToBook);
}
