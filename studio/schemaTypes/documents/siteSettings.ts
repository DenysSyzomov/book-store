// Sitewide identity — the one thing every other document (and the
// SEO defaults) refers back to (docs/MASTER-PROJECT-SPEC.md §17/§18).
// A singleton: there is exactly one site, so there's exactly one of
// these — enforced in studio/structure/index.ts, not by a schema
// option (Sanity has no "singleton: true" — see that file's comment).
import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      description:
        'The store\'s name, shown in the header, footer, and browser tab (e.g. "Folio & Co.").',
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      description:
        "Optional. If left empty, the site shows the site name as text instead of a logo image.",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
