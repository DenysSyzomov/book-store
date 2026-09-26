// Data-access layer for editorial content (docs/MASTER-PROJECT-SPEC.md
// §19: "Components must not contain raw Sanity queries", "access Sanity
// through src/lib/sanity.ts"). Same shape as src/lib/books.ts one layer
// over — pages/components call these named functions, never GROQ or
// `sanityClient` directly, so *where* editorial content comes from
// stays a decision made in exactly one file.
//
// This is a genuinely different kind of "data layer" than
// src/lib/books.ts, on purpose: books.ts wraps Supabase because a
// wrong price is a financial/legal problem (docs/ARCHITECTURE.md §8).
// Nothing here is ever load-bearing that way — worst case, a hero
// heading reads a little stale or a fallback string shows up. That's
// exactly why every function below degrades to a hardcoded default
// instead of throwing: a broken CMS connection must never take the
// whole storefront down with it, the way a broken Supabase connection
// legitimately should (see getBooks() in books.ts, which does throw).
import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type {
  CartMessagesContent,
  FooterContent,
  HomepageContent,
  NavigationContent,
  SeoSettingsContent,
  SiteSettingsContent,
} from "../types/content";

/**
 * Every singleton fetch follows the same three-step fallback chain:
 * 1. The real document from Sanity (what a content manager published)
 * 2. `null` if Sanity has no such document yet, or the request failed
 * 3. The caller's own hardcoded default (see e.g. src/pages/index.astro)
 *
 * Step 3 lives with each *caller*, not here, so the one hardcoded
 * "what the site says before anyone has touched the CMS" value sits
 * right next to the markup it describes — easy to find, easy to keep
 * honest about what's really a fallback vs. real content.
 */
async function fetchSingleton<T>(query: string): Promise<T | null> {
  try {
    const result = await sanityClient.fetch<T | null>(query);
    return result ?? null;
  } catch {
    return null;
  }
}

const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{ siteName, logo }`);
export function getSiteSettings(): Promise<SiteSettingsContent | null> {
  return fetchSingleton<SiteSettingsContent>(SITE_SETTINGS_QUERY);
}

const NAVIGATION_QUERY = defineQuery(
  `*[_id == "navigation"][0]{ cartLabel, links[]{ label, href } }`,
);
export function getNavigation(): Promise<NavigationContent | null> {
  return fetchSingleton<NavigationContent>(NAVIGATION_QUERY);
}

const FOOTER_QUERY = defineQuery(`
  *[_id == "footer"][0]{
    description,
    copyrightSuffix,
    columns[]{ heading, columnType, links[]{ label, href }, text }
  }
`);
export function getFooterContent(): Promise<FooterContent | null> {
  return fetchSingleton<FooterContent>(FOOTER_QUERY);
}

const HOMEPAGE_QUERY = defineQuery(`
  *[_id == "homepage"][0]{
    hero{ eyebrow, heading, description, primaryCta{ label, href }, secondaryCta{ label, href } },
    newArrivals{ eyebrow, heading, description },
    promises[]{ heading, description },
    seo{ seoTitle, seoDescription, shareImage }
  }
`);
export function getHomepageContent(): Promise<HomepageContent | null> {
  return fetchSingleton<HomepageContent>(HOMEPAGE_QUERY);
}

const SEO_SETTINGS_QUERY = defineQuery(
  `*[_id == "seoSettings"][0]{ defaultTitle, defaultDescription, defaultShareImage }`,
);
export function getSeoSettings(): Promise<SeoSettingsContent | null> {
  return fetchSingleton<SeoSettingsContent>(SEO_SETTINGS_QUERY);
}

const CART_MESSAGES_QUERY = defineQuery(`
  *[_id == "cartMessages"][0]{
    emptyTitle, emptyHint, checkoutFormIntro,
    successTitle, successMessage, continueShoppingLabel
  }
`);
export function getCartMessages(): Promise<CartMessagesContent | null> {
  return fetchSingleton<CartMessagesContent>(CART_MESSAGES_QUERY);
}
