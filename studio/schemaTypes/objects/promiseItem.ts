// One "why shop with us" tile on the homepage (e.g. "Ships in 1–2
// days"). An object, not a document: a single tile has no meaning
// outside the list it belongs to, and nothing else on the site would
// ever reference one individually.
import { defineField, defineType } from "sanity";
import { StarIcon } from "@sanity/icons/Star";

export const promiseItem = defineType({
  name: "promiseItem",
  title: "Value proposition",
  type: "object",
  icon: StarIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      description: 'Short — e.g. "Hand-picked, always".',
      type: "string",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required().max(160),
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "description" },
  },
});
