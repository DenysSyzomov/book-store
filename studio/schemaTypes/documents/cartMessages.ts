// Wording shown inside the cart drawer at moments that aren't tied to
// any one book — empty state, checkout intro, and the final success
// screen (docs/MASTER-PROJECT-SPEC.md §17: "Cart messages", "Empty
// cart message", "Success message"). Deliberately does NOT include
// per-item text, quantity labels, or button mechanics — those are
// interaction/structure, not editorial copy, and stay in
// src/components/cart/*.astro (docs/AGENT-WORKFLOW.md §21's "do not
// make every tiny UI string a CMS field").
import { defineField, defineType } from "sanity";
import { BasketIcon } from "@sanity/icons/Basket";

export const cartMessages = defineType({
  name: "cartMessages",
  title: "Cart Messages",
  type: "document",
  icon: BasketIcon,
  groups: [
    { name: "empty", title: "Empty bag", default: true },
    { name: "checkout", title: "Checkout" },
    { name: "success", title: "Success" },
  ],
  fields: [
    defineField({
      name: "emptyTitle",
      title: "Empty bag message",
      type: "string",
      group: "empty",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "emptyHint",
      title: "Empty bag hint",
      description: "Smaller supporting line under the empty bag message.",
      type: "string",
      group: "empty",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "checkoutFormIntro",
      title: "Checkout form intro",
      description: "Shown above the name/email form, before someone submits an order.",
      type: "text",
      rows: 2,
      group: "checkout",
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: "successTitle",
      title: "Success heading",
      type: "string",
      group: "success",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      type: "text",
      rows: 3,
      group: "success",
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: "continueShoppingLabel",
      title: '"Continue shopping" button label',
      type: "string",
      group: "success",
      validation: (Rule) => Rule.required().max(30),
    }),
  ],
});
