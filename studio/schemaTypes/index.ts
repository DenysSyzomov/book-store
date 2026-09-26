// Every schema type registered with the Studio (docs/ARCHITECTURE.md's
// Sanity file tree). A type that exists as a file but isn't listed
// here is not part of the schema at all — see this project's own
// notes on that exact trap.
import { link } from "./objects/link";
import { seo } from "./objects/seo";
import { promiseItem } from "./objects/promiseItem";
import { footerColumn } from "./objects/footerColumn";
import { heroSection } from "./objects/heroSection";
import { sectionIntro } from "./objects/sectionIntro";

import { siteSettings } from "./documents/siteSettings";
import { navigation } from "./documents/navigation";
import { footer } from "./documents/footer";
import { homepage } from "./documents/homepage";
import { seoSettings } from "./documents/seoSettings";
import { cartMessages } from "./documents/cartMessages";

export const schemaTypes = [
  // Objects first — documents below reference these by name.
  link,
  seo,
  promiseItem,
  footerColumn,
  heroSection,
  sectionIntro,

  // Documents — every one a singleton (see studio/structure/index.ts).
  siteSettings,
  navigation,
  footer,
  homepage,
  seoSettings,
  cartMessages,
];

/** Document types that are singletons — exactly one instance ever
 * exists, enforced by Studio structure, not by a schema option. Shared
 * with structure/index.ts so both files can't disagree on the list. */
export const SINGLETON_TYPES = [
  "siteSettings",
  "navigation",
  "footer",
  "homepage",
  "seoSettings",
  "cartMessages",
] as const;
