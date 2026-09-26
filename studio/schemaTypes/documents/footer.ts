import { defineArrayMember, defineField, defineType } from "sanity";
import { InlineIcon } from "@sanity/icons/Inline";
import { footerColumn } from "../objects/footerColumn";

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  icon: InlineIcon,
  fields: [
    defineField({
      name: "description",
      title: "Brand description",
      description: "Short line shown next to the site name in the footer.",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: "columns",
      title: "Columns",
      description: "The footer's link/text columns, left to right.",
      type: "array",
      of: [defineArrayMember(footerColumn)],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
    defineField({
      name: "copyrightSuffix",
      title: "Copyright line (after the year and site name)",
      description:
        'Shown as "© {year} {site name} · {this text}" — the year and site name are added automatically, never type them here.',
      type: "string",
      validation: (Rule) => Rule.max(80),
    }),
  ],
});
