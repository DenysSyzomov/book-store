# DESIGN SYSTEM

**Source:** Figma file "book-store" (`IcKlz30395flXgZqajJBhQ`)
**Frames analyzed:** Bookstore home (`3:2837`), All books (`3:2941`), Book details (`3:3068`), Cart overlay (`3:3188`), Bookstore UI kit (`3:3245`)
**Design coverage:** Desktop only, 1440px frame width. No tablet or mobile frames exist in the file.

This document describes only what was found in Figma. Values that could not be determined reliably are listed under **Open Questions** instead of being invented.

---

# Design Overview

The visual language is a warm, editorial "independent bookshop" aesthetic: a serif display face (Cormorant Garamond) paired with a neutral sans (Inter), a cream/paper background, ink-black text, and a single oxblood-red accent used for price, emphasis, and primary actions. Layouts are generous, content-first, and lightly ornamented (rounded corners, soft shadows on book covers, thin hairline borders/dividers). There is no visible grid overlay, dark mode, or illustration system beyond photographic book covers and a handful of line icons.

The UI kit frame (`3:3245`) is the file's own token reference: it documents buttons, book cards, the color palette, and the header/footer patterns. It was treated as the primary source of truth for reusable tokens; the four page frames were used to confirm real-world usage and spacing.

---

# Pages

| Page           | Figma frame | Route (per MASTER-PROJECT-SPEC)                   |
| -------------- | ----------- | ------------------------------------------------- |
| Bookstore home | `3:2837`    | `/`                                               |
| All books      | `3:2941`    | `/books`                                          |
| Book details   | `3:3068`    | `/books/[slug]`                                   |
| Cart overlay   | `3:3188`    | Global drawer/popup, overlaid on any page         |
| UI kit         | `3:3245`    | Not a real page — component/token reference sheet |

Each real page shares the same **Header** and **Footer** pattern. Page-specific content sits between them.

## Bookstore home (`/`)

`Header → Hero → New arrivals (book slider) → Promise (3-up value props) → Footer`

## All books (`/books`)

`Header → Catalog intro (heading + result count) → Catalog (result count + 4×2 book grid + pagination) → Footer`

## Book details (`/books/[slug]`)

`Header → Breadcrumbs → Purchase section (cover + buy box) → Book information (synopsis + metadata table) → Related books → Footer`

## Cart overlay

Rendered on top of the current page: `Page preview (dimmed) → Scrim → Cart panel` (right-aligned drawer).

---

# Layout System

- Design frame width: **1440px** (desktop canvas). No responsive frames exist.
- Horizontal page padding is consistently **64px** on standard sections (Header, Footer, Catalog, New arrivals, Related books).
- Some sections use larger, deliberate padding for emphasis:
  - Hero: `pl-96px pr-64px py-64px` (asymmetric, image bleeds closer to the edge)
  - Book detail Purchase section: `px-96px py-60px`
  - Book detail Book information: `px-160px py-80px`
  - Promise strip: `px-96px py-54px`
- Effective content width at 1440px is **1312px** (`1440 - 64×2`), matching the Footer content row, the book grid container, and the slider track.
- Sections stack vertically; no sidebar layouts exist except the two-column split in the Purchase section (cover | details) and Book information (synopsis | metadata).

---

# Containers

There is one implicit container width: **1312px**, centered via a 64px gutter on each side of the 1440px canvas. Everything (header content, footer content, catalog grid, slider track, related-books row) aligns to this container.

The two exceptions are the Hero (asymmetric padding, image panel extends further right) and Book detail's Purchase/Book-information sections, which use wider side padding (96px / 160px) and are visually narrower than 1312px as a deliberate editorial choice, not a different container system.

---

# Grid

- **Catalog grid** (All books, `3:2980`): 4 fixed-width columns, `flex-wrap` with `gap: 54px 96px` (row-gap 54px, column-gap 96px). Card width 248px → `4×248 + 3×96 = 1280px` of the 1312px container is used by cards, confirmed directly from Figma's exported gap value.
- **Related books** (Book detail, `3:3136`): 4 cards laid out with `justify-content: space-between` across the 1312px container (not a fixed gap — the gap grows/shrinks with the number of cards).
- **New arrivals / book slider** (Home, `3:2877`): cards laid out in a single row with a fixed **28px** gap. 5 cards are shown at 1440px width and the row's total width (1352px) exceeds the 1312px container, confirming this is a **slider/carousel**, not a static grid — content is intended to overflow/scroll horizontally, controlled by the two round arrow buttons above it.
- No 12-column (or other numeric) grid system is defined anywhere in the file. Layouts are hand-placed flex rows/columns with fixed gaps, not a generic grid utility.

---

# Breakpoints

**Not defined in Figma.** The file contains a single 1440px desktop frame per screen, and the UI kit page explicitly labels itself "Core editorial commerce patterns · **Desktop**." No tablet or mobile frames, no responsive variants of any component, and no breakpoint annotations exist anywhere in the file.

See **Open Questions** — breakpoints must be defined by engineering convention, not extracted from Figma, and MASTER-PROJECT-SPEC §24 ("The responsive system must follow the Figma design") cannot be fully satisfied as written.

---

# Typography

Two type families, loaded as: **Cormorant Garamond** (serif, display/editorial) and **Inter** (sans, UI/body).

## Named type tokens (from Figma variables)

| Token           | Family             | Weight         | Size | Line-height | Usage                                        |
| --------------- | ------------------ | -------------- | ---- | ----------- | -------------------------------------------- |
| `Type/Display`  | Cormorant Garamond | SemiBold (600) | 42px | 100%        | Large display heading (seen on UI kit title) |
| `Type/Overline` | Inter              | Bold (700)     | 11px | 100%        | Uppercase eyebrow/kicker labels              |
| `Type/Button`   | Inter              | SemiBold (600) | 13px | 100%        | All button labels                            |
| `Type/Body`     | Inter              | Regular (400)  | 13px | 160%        | Default body copy                            |

## Observed type scale (not all formalized as variables, but used consistently)

| Role                                                                        | Family / weight             | Size                        | Line-height | Color                                |
| --------------------------------------------------------------------------- | --------------------------- | --------------------------- | ----------- | ------------------------------------ |
| Hero H1                                                                     | Cormorant Garamond SemiBold | 68px                        | 1.02        | Ink                                  |
| Book detail product title (H1)                                              | Cormorant Garamond SemiBold | 58px                        | 1.05        | Ink                                  |
| "All books" page title (H1)                                                 | Cormorant Garamond SemiBold | 52px                        | normal      | Ink                                  |
| Section H2 (e.g. "New & noteworthy", "You may also like", "About the book") | Cormorant Garamond SemiBold | 38px                        | normal      | Ink                                  |
| Cart panel heading ("Your bag")                                             | Cormorant Garamond SemiBold | 34px                        | normal      | Ink                                  |
| Book/product byline ("by Elena Vale")                                       | Cormorant Garamond Regular  | 22px                        | normal      | Muted (`#706c63`)                    |
| Synopsis lead paragraph                                                     | Cormorant Garamond Regular  | 20px                        | 1.65        | Ink                                  |
| Book card title                                                             | Cormorant Garamond SemiBold | 20px                        | normal      | Ink                                  |
| Cart item title                                                             | Cormorant Garamond SemiBold | 19px                        | normal      | Ink                                  |
| Footer brand wordmark                                                       | Cormorant Garamond Regular  | 32px                        | normal      | Paper (`#fcfaf5`) on ink bg          |
| Header brand wordmark                                                       | Cormorant Garamond SemiBold | 30px                        | normal      | Ink                                  |
| Eyebrow / kicker (e.g. "Freshly shelved")                                   | Inter Bold, uppercase       | 11–12px                     | normal      | Oxblood                              |
| Button label                                                                | Inter SemiBold              | 13px                        | normal      | White (primary) / Ink (secondary)    |
| Nav link                                                                    | Inter Medium                | 13px                        | normal      | Ink                                  |
| Body copy (descriptions)                                                    | Inter Regular               | 14–16px                     | 1.6–1.8     | Muted (`#706c63`)                    |
| Small meta text (author, breadcrumb, metadata labels)                       | Inter Regular               | 11–12px                     | normal      | Muted (`#706c63`)                    |
| Price                                                                       | Inter SemiBold              | 13–22px (context-dependent) | normal      | Oxblood (card/list) or Ink (buy box) |

**Note:** price is styled in **oxblood** on book cards (grid, slider, related books) but in **ink** on the book detail buy box and cart summary. This is a deliberate, consistent distinction, not an inconsistency: oxblood price = draws attention in a list; ink price = matches the more neutral commerce-focused buy box.

---

# Colors

## Named palette (from Figma variables / UI kit swatches)

| Token           | Hex       | Usage                                                                        |
| --------------- | --------- | ---------------------------------------------------------------------------- |
| `Color/Ink`     | `#191815` | Primary text, footer background, dark UI                                     |
| `Color/Paper`   | `#F3EFE6` | Page background (home, all-books, book-detail outer background)              |
| `Color/Surface` | `#FCFAF5` | Header background, card/panel surfaces, secondary button background          |
| `Color/Oxblood` | `#9B3A2D` | Primary accent — buttons, price, eyebrow text, cart badge, active pagination |
| `Color/Moss`    | `#5B6654` | Hero artwork background, in-stock status text                                |

## Additional colors observed in use (not exposed as named variables, but repeated consistently)

| Hex       | Usage                                                                             |
| --------- | --------------------------------------------------------------------------------- |
| `#706c63` | Secondary/muted text (descriptions, authors, subtitles)                           |
| `#bdb7ab` | Footer body text and link text on dark background                                 |
| `#8e887e` | Footer copyright line                                                             |
| `#d7d0c3` | Hairline borders — header bottom border, dividers, input/quantity-stepper borders |
| `#e7dfd1` | Alternate light surface — book detail cover-presentation panel background         |
| `#ffffff` | Button text on oxblood backgrounds, cart badge text                               |

## Shadows

| Usage                             | Value                               |
| --------------------------------- | ----------------------------------- |
| Book cover / card shadow          | `0px 10px 20px rgba(25,19,14,0.13)` |
| Book detail cover shadow (larger) | `0px 18px 34px rgba(37,27,19,0.22)` |
| Cart panel shadow                 | `0px 18px 48px rgba(34,27,20,0.16)` |

All shadows use a warm near-black tint rather than pure black, consistent with the "Ink" token.

---

# Spacing

No formal spacing scale variable was found, but observed values cluster into a consistent, near-4/8px-based rhythm:

`4, 5, 7, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 34, 36, 42, 48, 54, 58, 60, 64, 72, 76, 80, 96, 100, 120, 160`

Most frequent structural values: **14px** (card internal gap between cover and details), **24px** (button horizontal padding, spacing between stacked form-like rows), **64px** (page horizontal gutter), **80px** (large section vertical padding).

Recommend formalizing a token scale for implementation (e.g. 4/8/12/16/24/32/48/64/96) rather than reproducing every raw value — see **Open Questions**.

---

# Buttons

Four button/link patterns exist in the UI kit (`3:3265` → "Button patterns").

| Variant     | Background        | Border        | Text color | Notes                                                                          |
| ----------- | ----------------- | ------------- | ---------- | ------------------------------------------------------------------------------ |
| Primary     | Oxblood `#9b3a2d` | Oxblood       | White      | `h-50px`, `px-24px`, `radius-4px`, Inter SemiBold 13px                         |
| Secondary   | Surface `#fcfaf5` | Ink `#191815` | Ink        | Same sizing as Primary                                                         |
| "Outline"   | Oxblood `#9b3a2d` | Oxblood       | White      | **Visually identical to Primary** in the extracted styles — see Open Questions |
| Text action | Transparent       | None          | Ink        | Underlined Inter Regular 13px, used for low-emphasis actions                   |

All buttons share: `border-radius: 4px`, `height: 50px`, `padding-inline: 24px`, label `Inter SemiBold 13px`.

Buttons observed in real page contexts:

- "Explore the collection" (primary), "Read our journal" (secondary) — Hero
- "Add to bag" (primary, `w-400px`) — Book detail buy box
- "Checkout · $76.00" (primary, `w-400px`) — Cart summary
- Round icon buttons (42px circle) for slider prev/next — prev is outlined (`border #d7d0c3`, transparent bg), next is filled ink `#191815` with white icon
- Round pagination buttons (38px circle) — active page filled oxblood/white text, inactive filled surface/ink text

---

# Links

- **Underlined text links** (Inter Regular, `text-decoration: underline`): "Text action" pattern, "Continue shopping" in the cart, footer navigation is NOT underlined (plain).
- **Navigation links** (header "All books", footer column links): plain text, no underline, no visible hover/active styling defined in Figma (static comp).
- Link color depends on context: ink on light backgrounds, `#bdb7ab` on the dark footer.

---

# Form Elements

Very few true form elements appear in this design; no login/checkout/contact form screens were included in the analyzed frames.

- **Quantity stepper**: bordered box (`border 1px #d7d0c3`, `radius 4px`) containing `− [value] +`. Two sizes seen: 50px-tall version in the book detail buy box (`Inter, 16px −/+, 13px value`), and a compact version in cart line items (`px-10px py-7px`, `13px −/+, 11px value`).
- No text inputs, checkboxes, radios, selects, or a customer-information form appear anywhere in the four frames analyzed, despite MASTER-PROJECT-SPEC §11 requiring a "Customer information form" in the cart. This is a **gap between the spec and the Figma file** — see Open Questions.

---

# Cards

## Book Card (Large) — `3:3382`, the only card variant used on real pages

- Total size: `248 × 423px` (cover `248×344` + `14px` gap + details block)
- Cover: `object-fit: cover`, `border-radius: 4px`, drop shadow `0 10px 20px rgba(25,19,14,.13)`
- Details (5px vertical gap): Title (Cormorant SemiBold 20px, ink) → Author (Inter Regular 12px, muted) → Price (Inter SemiBold 13px, oxblood)
- Used identically in: New arrivals slider, All books catalog grid, Related books row

## Book Card (Compact) — `3:3383`

- Total size: `210 × ~369px` (cover `210×290` + details)
- Same internal composition/typography as Large, just smaller
- **Defined in the UI kit but not used on any of the four real page frames.** Likely intended for a denser layout (e.g. a future mobile grid) — see Open Questions.

## Cart line-item "card"

- Not a full card — a horizontal row: 90×126px cover thumbnail + title/author/stepper/price, separated by a bottom hairline border (`#d7d0c3`).

---

# Header

- Height: **88px**, background Surface `#fcfaf5`, bottom border `1px solid #d7d0c3`, horizontal padding **64px**.
- Brand wordmark: "Folio & Co." — Cormorant Garamond SemiBold, 30px, ink, left-aligned.
- Navigation: centered, Inter Medium 13px, ink. Only **one** nav item ("All books") appears in every frame — see Open Questions on whether this is the complete nav or a placeholder.
- Utilities (right-aligned): varies by frame —
  - Home / All books / Book detail / UI kit pattern: **"Bag" label + circular oxblood cart-count badge** (24px circle, white 11px text) only.
  - Cart overlay screen: **search icon (20px) + "Account" text + Bag + badge**, with 20px gaps between utility items.
  - This is a real inconsistency in the source file, not a state variant — flagged in Open Questions.

---

# Footer

- Background: Ink `#191815`. Padding `64px` horizontal, `48px` vertical, `42px` gap between the content row and the divider/copyright row.
- Content row (`justify-content: space-between`, 1312px wide): Brand column (wordmark + 1-line description) + 3 link columns (Explore / Visit / Follow), each with an `11px` uppercase bold heading (white) and `13px` regular links (`#bdb7ab`).
- Divider: 1px hairline, full width.
- Copyright line: `11px`, `#8e887e`, centered content: "© 2026 Folio & Co. · Shipping & returns · Privacy".
- Identical across all three content pages (Home, All books, Book detail) — a single shared component.

---

# Book Slider

Appears only on the homepage as "New arrivals" (`3:2866`).

- Section header row: eyebrow + H2 + supporting text on the left, two round 42px nav-arrow buttons on the right (prev = outlined, next = filled ink).
- Track: Book Card (Large) items with a fixed **28px** gap.
- 5 cards are positioned in the frame at 1440px width; the track's total width (1352px) exceeds the 1312px content container, confirming horizontal overflow/scroll is intended — i.e. this is the element MASTER-PROJECT-SPEC §8 designates for **Swiper**.
- No pagination dots, no visible "peek" card styling (partial card), no loop/autoplay indication — Figma shows a static snapshot only. Slide count, `slidesPerView` at different widths, and loop behavior are implementation decisions, not something extractable from the file — see Open Questions.

---

# Cart / Drawer

Modeled in Figma as a full-page overlay (`3:3188`), not just the panel:

- **Page preview**: the current page shown dimmed behind the overlay.
- **Scrim**: a full-viewport layer over the dimmed page (click-outside-to-close is implied but not explicit).
- **Cart panel**: right-aligned drawer, `500px` wide, inset `32px` from the top and effectively `60px` from the right edge at 1440px width (panel is _not_ full-height — height is `900px` inside a `1000px`-tall frame, and it's unclear whether this means a true fixed-height panel or a bounded-canvas artifact — see Open Questions).
  - Background Surface `#fcfaf5`, `border-radius: 10px`, shadow `0 18px 48px rgba(34,27,20,.16)`, padding `32px`, `28px` gap between sections.
  - Header row: "Your bag" (Cormorant SemiBold 34px) + "N items" (Inter 11px, muted) + close "×" icon (22px), right-aligned.
  - Cart items list: each item is a row (18px gap) of 90×126px cover thumbnail + title/author/format/stepper/price, separated by a bottom hairline border; **14px** gap between item rows would be expected but Figma shows **24px**.
  - Summary block: Subtotal row (label muted 13px / amount bold 16px ink) → shipping note (11px muted) → full-width (400px) primary Checkout button showing the total inline ("Checkout · $76.00") → centered "Continue shopping" underlined text link.
  - **Empty-cart state, quantity-limit/error states, and the customer-information form required by MASTER-PROJECT-SPEC §11 are not present in the Figma file** — see Open Questions.

---

# Responsive Behavior

**Cannot be extracted from Figma** — the file contains desktop-only (1440px) frames with no tablet or mobile variants, no responsive constraints/auto-layout resizing annotations exported, and the UI kit explicitly scopes itself to "Desktop." Implementation must define its own responsive rules (grid column collapse, header/nav collapse into a mobile menu, hero stacking, cart panel becoming full-screen on small viewports, etc.) using standard practice, then document the chosen breakpoints and rules here as an addendum once decided. See Open Questions.

## Addendum — breakpoints actually implemented (Agent 11, Final QA)

No breakpoint tokens exist in `tokens.css`; the values below are the
raw `max-width` numbers already hardcoded per-component and are
recorded here only so this document matches the shipped code
(MASTER-PROJECT-SPEC.md §24: "breakpoints must be documented").
Formalizing these as CSS custom properties is a safe follow-up, not
done here to avoid touching every component's styles under a QA phase.

| Breakpoint | Value    | Used by                                                        |
| ---------- | -------- | --------------------------------------------------------------- |
| Small      | `≤560px` | `BookGrid.astro` (1 column)                                     |
| Cart panel | `≤640px` | `CartDrawer.astro` (full-screen drawer), `Container.astro` (gutter) |
| Stack      | `≤768px` | `Hero.astro`, homepage "promise" grid, book-detail two-column rows |
| Tablet     | `≤1024px`| `BookGrid.astro` (2 columns)                                    |

**Known gap, not fixed in this phase:** `Header.astro` has no responsive
treatment at all — brand, nav links, and the cart trigger stay in one
non-wrapping row at every viewport width. With today's single "All
books" nav link this doesn't visibly break, but it has no mobile
navigation pattern (hamburger/collapse) and will crowd or overflow the
moment Sanity's `navigation` document publishes more than one or two
links. See this phase's Final QA report for the full writeup —
building a mobile nav is a UI/architecture decision for a future phase,
not a QA-safe fix.

---

# Interaction States

Figma is a static comp; **no hover, focus, active, disabled, or pressed states are defined** for any interactive element (buttons, links, nav items, quantity stepper, pagination, slider arrows, cart badge). No variants/component states were found on any button or card component in the file.

This directly affects MASTER-PROJECT-SPEC §25 (Accessibility), which requires visible focus states and non-hover-dependent interactivity — these must be designed during implementation following standard accessible patterns (e.g., a visible focus ring using the Ink or Oxblood token, a hover state that darkens/lightens the base color), not extracted from Figma. See Open Questions.

---

# Animation Notes

No motion, transitions, or prototype interactions are present in the analyzed frames — this is a static visual design file. MASTER-PROJECT-SPEC §26 already defines the animation requirement independently (GSAP subtle reveal-from-below on scroll, respecting `prefers-reduced-motion`); Figma does not add or contradict anything here. Implementation should follow the spec directly rather than look for animation cues in the design file.

---

# Image and Icon Guidelines

- **Book covers**: photographic/illustrated cover art, varying aspect ratios, always rendered with `object-fit: cover`, `border-radius: 4px`, and a soft drop shadow. Cover art differs per book — this must remain dynamic (per-book `imageUrl`), never hardcoded.
- **Hero artwork**: a single large photographic scene (570×520px) inside an 18px-radius rounded panel with a moss-green fallback background, plus a floating "Editor's pick" callout card overlapping its bottom-left corner.
- **Icons**: small, single-color line icons — `arrow-left` / `arrow-right` (16px, slider nav), `search` (20px, cart-screen header only), `x` (22px, cart panel close). No icon library/set name is specified in the file; treat these as one-off SVG assets to be re-exported from Figma at implementation time (do not hand-draw substitutes).
- All images use empty `alt=""` in the raw Figma export (decorative-image default) — **implementation must supply real, meaningful `alt` text** per MASTER-PROJECT-SPEC §25/§29 (this is a known gap in raw Figma exports, not a design intent to omit alt text).

---

# Reusable UI Patterns

Confirmed, page-spanning reusable patterns, in order of reuse frequency:

1. **BookCard** (Large) — homepage slider, catalog grid, related books. Single component: cover + title + author + price.
2. **Header** — identical structure on every content page (brand, nav, utilities), with one confirmed content inconsistency (see Open Questions).
3. **Footer** — pixel-identical on Home, All books, and Book detail.
4. **Button** (Primary / Secondary / Text action) — reused for every CTA across all screens.
5. **Section heading** (eyebrow + H2 + optional supporting text) — repeated on New arrivals, Catalog intro (variant with H1), Book information, Related books.
6. **Quantity stepper** — two sizes, same interaction pattern, on the buy box and in cart line items.
7. **Pill/circular icon button** — used for slider arrows and pagination, same 38–42px circular treatment, just different fill states.
8. **Metadata row** (label/value pair with bottom hairline) — book detail specs table.

---

# Open Questions

1. **No responsive frames exist.** The whole file is desktop-only (1440px). Breakpoints, mobile/tablet layouts, and the mobile navigation pattern must be defined by the engineering team rather than extracted from Figma. This is the single biggest gap relative to MASTER-PROJECT-SPEC §24, which assumes "the responsive system must follow the Figma design."
2. **No interaction states are defined** (hover/focus/active/disabled) for any component. Must be designed during implementation per MASTER-PROJECT-SPEC §25 (accessibility).
3. **Header utilities are inconsistent between frames.** The Cart-overlay screen's header shows Search + Account + Bag; every other screen (Home, All books, Book detail, UI kit) shows only Bag. Needs a design decision: is the full header always Search + Account + Bag, and the other frames are simplified/outdated, or is Search/Account specific to some other state? Recommend confirming with whoever owns the Figma file before implementing the header component.
4. **Button "Outline" variant is visually identical to "Primary"** in the extracted styles (both solid oxblood fill). This looks like a mislabeled/incomplete variant in the source file (an outline button would typically be transparent-bg + oxblood border). Needs confirmation before building a `Button.astro` variant API.
5. **Book Card "Compact" variant (210px) is defined in the UI kit but never used** on any real page. Unclear whether it's for a future/mobile layout or leftover from iteration. Do not build it speculatively — build the Large variant used by real pages, and revisit Compact only if a real layout needs it.
6. **Cart panel height (900px inside a 1000px frame) may not represent a true "full viewport height" drawer.** Needs confirmation on whether the cart drawer should be viewport-height with internal scroll for long item lists, since Figma shows only a 2-item snapshot.
7. **No empty-cart state, no error/validation states, and no customer-information form are present in Figma**, despite MASTER-PROJECT-SPEC §11 requiring all of them for the cart. These will need to be designed (or the spec's scope for Phase 4 narrowed) since there is no visual reference.
8. **Only a single nav item ("All books") appears in the header** across every frame. It's unclear if this is the complete primary navigation or a placeholder — worth confirming before hardcoding the nav.
9. **No spacing/type scale is formalized as reusable tokens** beyond the 8 Figma variables found (`Type/Display`, `Type/Overline`, `Type/Button`, `Type/Body`, and the 5 colors). Most size/spacing values were read directly off components rather than from a token. Recommend the implementation agent define a small `tokens.css` scale that approximates the observed values (documented above under Spacing/Typography) rather than copying every raw pixel value 1:1.
10. **Book detail metadata fields** (Publisher, Published date, Pages, ISBN, Dimensions, Language, format/"Hardcover", category/"New fiction") and **breadcrumb category** ("Books / Fiction /") are richer than the `Book` interface currently defined in MASTER-PROJECT-SPEC §13. This is flagged here for visibility; it is an architecture/data-model question, not a visual-design one, and is called out again in this agent's final report for the Project Architect / Supabase phases to address.
