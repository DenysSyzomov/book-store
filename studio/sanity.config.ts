// Sanity Studio configuration (docs/ARCHITECTURE.md §8, docs/AGENT-
// WORKFLOW.md §21). This app is standalone — its own package.json, its
// own dev server — deployed separately from the Astro storefront (see
// this file's own README note in docs/ARCHITECTURE.md §8's "Alternatives
// considered": embedding Studio as an Astro route was considered and
// rejected so a content manager's login/workflow stays fully decoupled
// from the storefront's deploy pipeline).
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "default",
  title: "Folio & Co. — Content",

  projectId: "ww5mxcs5",
  dataset: "production",

  plugins: [
    structureTool({ structure }),
    // Vision: a GROQ query console built into the Studio — lets a
    // developer (not a content manager) try a query and see its exact
    // result before putting it in src/lib/sanity.ts. Harmless to leave
    // in; it only reads, never writes.
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
