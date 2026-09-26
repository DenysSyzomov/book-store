// CLI-only config (which project/dataset `sanity deploy`, `sanity
// schema deploy`, etc. target) — kept separate from sanity.config.ts
// per Sanity's own convention, since the CLI reads this file without
// loading the rest of the Studio app.
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "ww5mxcs5",
    dataset: "production",
  },
});
