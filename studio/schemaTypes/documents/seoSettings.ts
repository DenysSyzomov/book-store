// Sitewide SEO fallbacks — used only when a specific page hasn't set
// its own SEO fields (see objects/seo.ts's per-page override, and
// src/lib/sanity.ts's fallback chain). This is what makes "SEO title"/
// "SEO description" safe to leave blank on any one page: there's
// always a sensible sitewide default underneath, and a hardcoded
// default in code underneath that.
import { defineField, defineType } from "sanity";
import { SearchIcon } from "@sanity/icons/Search";

export const seoSettings = defineType({
  name: "seoSettings",
  title: "SEO Settings",
  type: "document",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "defaultTitle",
      title: "Default page title",
      description: "Used when a page doesn't set its own SEO title.",
      type: "string",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "defaultDescription",
      title: "Default page description",
      description: "Used when a page doesn't set its own SEO description.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: "defaultShareImage",
      title: "Default share image",
      description:
        "Shown when a page without its own share image is shared on social media.",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
