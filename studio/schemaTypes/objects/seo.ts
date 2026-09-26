// Page-specific SEO overrides — deliberately an *object*, not a
// *document*: SEO metadata for the homepage only means something
// attached to the homepage; it's never browsed as its own list or
// reused on a second document (docs/MASTER-PROJECT-SPEC.md §29/§30
// via docs/AGENT-WORKFLOW.md §21). Every field here is optional —
// leaving it empty falls back to seoSettings' sitewide defaults, then
// to a hardcoded default in code, so a content manager is never
// blocked from publishing a page just because they haven't filled in
// SEO yet (see src/lib/sanity.ts for that fallback chain).
import { defineField, defineType } from "sanity";
import { SearchIcon } from "@sanity/icons/Search";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "seoTitle",
      title: "SEO title",
      description:
        "Shown in the browser tab and search results — not the same as the big heading on the page. Leave empty to use the site default.",
      type: "string",
      validation: (Rule) => Rule.max(60).warning("Longer titles may get cut off in search results."),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      description:
        "The summary search engines show under the title. Leave empty to use the site default.",
      type: "text",
      rows: 3,
      validation: (Rule) =>
        Rule.max(160).warning("Longer descriptions may get cut off in search results."),
    }),
    defineField({
      name: "shareImage",
      title: "Share image",
      description:
        "Shown when this page is shared on social media (Facebook, Slack, X/Twitter, etc). Leave empty to use the site default.",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
