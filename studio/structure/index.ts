// Custom Studio navigation (docs/AGENT-WORKFLOW.md §21: "Create an
// intuitive Studio structure"). Every document type in this project is
// a singleton — there's exactly one Homepage, one Navigation menu, one
// Footer — so the default "list of documents" view (built for many
// interchangeable items, like blog posts) would be actively confusing
// here: a content manager would see a list with one item in it and
// have to click twice to reach what they want.
//
// Singletons are a Structure-level pattern, not a schema option —
// Sanity has no `singleton: true` field. Each entry below pins one
// fixed document id (e.g. "homepage") so there's only ever one to
// open, edit, and publish — never an "Add new" that could create a
// confusing second Homepage.
import type { StructureResolver } from "sanity/structure";
import { SINGLETON_TYPES } from "../schemaTypes";

const SINGLETON_TITLES: Record<(typeof SINGLETON_TYPES)[number], string> = {
  siteSettings: "Site Settings",
  navigation: "Navigation",
  footer: "Footer",
  homepage: "Homepage",
  seoSettings: "SEO Settings",
  cartMessages: "Cart Messages",
};

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETON_TYPES.map((typeName) =>
        S.listItem()
          .title(SINGLETON_TITLES[typeName])
          .id(typeName)
          .child(
            S.document()
              .schemaType(typeName)
              // Fixed document id = singleton: everyone who opens
              // "Homepage" always opens the SAME document, never a
              // new one.
              .documentId(typeName)
              .title(SINGLETON_TITLES[typeName]),
          ),
      ),

      S.divider(),

      // Anything added later that ISN'T one of the singletons above
      // still shows up here automatically, as an ordinary list — this
      // line is what stops the Studio from silently hiding a future
      // schema type a developer forgets to add above.
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETON_TYPES.includes(item.getId() as (typeof SINGLETON_TYPES)[number]),
      ),
    ]);
