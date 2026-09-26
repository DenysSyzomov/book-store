// Reusable "labeled link" object — a piece of text plus where it goes
// (docs/AGENT-WORKFLOW.md §21: "CTA/button labels where appropriate").
// Used for navigation links, footer links, and hero call-to-action
// buttons alike: a CTA button is, structurally, just a prominent
// link — modeling it as its own separate type would only duplicate
// this one, so every "click this, go there" field in the Studio reuses
// the same object (see docs/ARCHITECTURE.md's schema shared-fields
// pattern).
//
// This is a nested *object*, not a *document*: a nav link only means
// anything attached to the navigation menu it lives in — nobody would
// ever need to open "the Home link" as its own standalone editable
// thing in the Studio, browse a list of all links across the site, or
// reuse one specific link instance in two different places. That's
// the actual test for object vs. reference (see schema.ts's own
// comment for the fuller version of this reasoning).
import { defineField, defineType } from "sanity";
import { LinkIcon } from "@sanity/icons/Link";

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      description: "The visible text someone clicks — e.g. \"All books\".",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link target",
      description:
        "Where it goes. Use a path starting with / for a page on this site (e.g. /books), or a full https:// address for somewhere else.",
      type: "string",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return true;
          if (value.startsWith("/") || /^https?:\/\//.test(value)) return true;
          return 'Must start with "/" (a page on this site) or "http(s)://" (an external site).';
        }),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
