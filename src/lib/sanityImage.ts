// Builds optimized image URLs from a Sanity image reference (docs/
// ARCHITECTURE.md's image rule: resize/crop/format via the URL, never
// by shipping a full-size original). Used wherever a component renders
// an image that came from Sanity (a logo, an SEO share image) — never
// for book covers, which are plain Supabase-sourced URLs already
// served at the right size (src/lib/books.ts).
import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "sanity:client";
import type { SanityImageRef } from "../types/content";

const builder = createImageUrlBuilder(sanityClient);

/** Starts a chainable URL builder — call .width()/.height()/.url() on the result. */
export function urlFor(source: SanityImageRef) {
  return builder.image(source);
}
