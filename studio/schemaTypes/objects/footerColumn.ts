// One footer column. The real footer today has two different kinds —
// "Explore" is a list of links, while "Visit" and "Follow" are just a
// heading plus free text (an address, opening hours, a blurb) — so
// this uses the "toggle" pattern (docs/ARCHITECTURE.md schema rules):
// one radio field picks the column's shape, and only the matching
// field is shown, in Studio, for that column.
import { defineField, defineType } from "sanity";
import { defineArrayMember } from "sanity";
import { UlistIcon } from "@sanity/icons/Ulist";
import { link } from "./link";

export const footerColumn = defineType({
  name: "footerColumn",
  title: "Footer column",
  type: "object",
  icon: UlistIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Column heading",
      description: 'E.g. "Explore", "Visit", "Follow".',
      type: "string",
      validation: (Rule) => Rule.required().max(30),
    }),
    defineField({
      name: "columnType",
      title: "Column content",
      description: "Does this column show a list of links, or a short block of text?",
      type: "string",
      options: {
        list: [
          { title: "List of links", value: "links" },
          { title: "Text", value: "text" },
        ],
        layout: "radio",
      },
      initialValue: "links",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [defineArrayMember(link)],
      hidden: ({ parent }) => parent?.columnType !== "links",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { columnType?: string } | undefined;
          if (parent?.columnType === "links" && (!value || value.length === 0)) {
            return "Add at least one link, or switch this column to Text.";
          }
          return true;
        }),
    }),
    defineField({
      name: "text",
      title: "Text",
      description: 'E.g. an address, opening hours, or a short note.',
      type: "text",
      rows: 3,
      hidden: ({ parent }) => parent?.columnType !== "text",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { columnType?: string } | undefined;
          if (parent?.columnType === "text" && !value) {
            return "Add some text, or switch this column to Links.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "columnType" },
  },
});
