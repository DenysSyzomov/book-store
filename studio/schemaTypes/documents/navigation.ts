import { defineArrayMember, defineField, defineType } from "sanity";
import { MenuIcon } from "@sanity/icons/Menu";
import { link } from "../objects/link";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: MenuIcon,
  fields: [
    defineField({
      name: "links",
      title: "Menu links",
      description: "Shown left-to-right in the header, in this order.",
      type: "array",
      of: [defineArrayMember(link)],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "cartLabel",
      title: "Cart button label",
      description: 'The text on the header\'s cart button — e.g. "Bag".',
      type: "string",
      initialValue: "Bag",
      validation: (Rule) => Rule.required().max(20),
    }),
  ],
});
