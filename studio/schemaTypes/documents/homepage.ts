import { defineArrayMember, defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";
import { promiseItem } from "../objects/promiseItem";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "heroSection",
      group: "content",
    }),
    defineField({
      name: "newArrivals",
      title: '"New arrivals" section',
      description: "Intro copy above the homepage's book slider.",
      type: "sectionIntro",
      group: "content",
    }),
    defineField({
      name: "promises",
      title: '"Why shop with us" tiles',
      type: "array",
      of: [defineArrayMember(promiseItem)],
      group: "content",
      validation: (Rule) => Rule.min(1).max(6),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
});
