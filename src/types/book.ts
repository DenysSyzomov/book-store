// Book domain type. Extended from MASTER-PROJECT-SPEC.md §13 per the
// explicit escape hatch documented there ("may change after Supabase
// schema design") — see docs/ARCHITECTURE.md §4 for why each optional
// field was added (they come straight from the Figma book-detail frame).
export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  /** Drives breadcrumbs and "related books" lookups. */
  category: string;
  format?: string;
  publisher?: string;
  publishedAt?: string;
  pageCount?: number;
  isbn?: string;
  dimensions?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}
