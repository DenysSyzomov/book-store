// A small section's opening copy — eyebrow, heading, supporting text
// (matches src/components/ui/SectionHeading.astro's own props). Used
// for the homepage's "New arrivals" slider intro today; kept as its
// own reusable object in case a future homepage section needs the
// same shape, rather than duplicating three fields inline.
import { defineField, defineType } from "sanity";

export const sectionIntro = defineType({
  name: "sectionIntro",
  title: "Section intro",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      description: "Small label above the heading. Optional.",
      type: "string",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
  ],
});
