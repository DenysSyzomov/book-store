// The homepage's hero banner — heading, supporting text, and up to two
// call-to-action buttons (docs/MASTER-PROJECT-SPEC.md §17: "Hero
// heading", "Hero description", "CTA labels"). Object, not document:
// this content only ever means "the homepage's hero," never something
// browsed or reused independently.
import { defineField, defineType } from "sanity";
import { link } from "./link";

export const heroSection = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      description: 'Small label above the heading — e.g. "Freshly shelved". Optional.',
      type: "string",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      description: "The big headline. Keep it short — this is the largest text on the page.",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "One or two supporting sentences under the heading.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: "primaryCta",
      title: "Primary button",
      description: 'The main call to action — e.g. "Explore the collection".',
      type: "link",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary button",
      description: "A second, less prominent button. Optional.",
      type: "link",
    }),
  ],
});
