// Editorial content types — the shape GROQ queries in src/lib/sanity.ts
// return, matching studio/schemaTypes/ field-for-field
// (docs/ARCHITECTURE.md §8, docs/MASTER-PROJECT-SPEC.md §17-19). Kept
// separate from src/types/book.ts because these describe a completely
// different source of truth (Sanity, not Supabase) with a completely
// different correctness guarantee — see src/lib/sanity.ts's header
// comment for why that split exists.
export interface SanityImageRef {
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
}

export interface LinkContent {
  label: string;
  href: string;
}

export interface SeoContent {
  seoTitle?: string;
  seoDescription?: string;
  shareImage?: SanityImageRef;
}

export interface SiteSettingsContent {
  siteName: string;
  logo?: SanityImageRef;
}

export interface NavigationContent {
  links: LinkContent[];
  cartLabel: string;
}

export interface FooterColumnContent {
  heading: string;
  columnType: "links" | "text";
  links?: LinkContent[];
  text?: string;
}

export interface FooterContent {
  description: string;
  columns: FooterColumnContent[];
  copyrightSuffix?: string;
}

export interface PromiseItemContent {
  heading: string;
  description: string;
}

export interface HomepageContent {
  hero: {
    eyebrow?: string;
    heading: string;
    description: string;
    primaryCta: LinkContent;
    secondaryCta?: LinkContent;
    image?: SanityImageRef;
    imageAlt?: string;
    featureNote?: { label?: string; title?: string };
  };
  newArrivals: {
    eyebrow?: string;
    heading: string;
    description?: string;
  };
  promises: PromiseItemContent[];
  seo?: SeoContent;
}

export interface SeoSettingsContent {
  defaultTitle: string;
  defaultDescription: string;
  defaultShareImage?: SanityImageRef;
}

export interface CartMessagesContent {
  emptyTitle: string;
  emptyHint?: string;
  checkoutFormIntro: string;
  successTitle: string;
  successMessage: string;
  continueShoppingLabel: string;
}
