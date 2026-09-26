-- Seed data for local development (docs/MASTER-PROJECT-SPEC.md §14's
-- role, now filled by Supabase instead of src/data/books.ts). Run
-- automatically by `supabase db reset` against a local stack.
--
-- Exactly the same 9 books the old mock array had — including "The
-- Unfinished Atlas" with is_active = false — so the inactive-book
-- filter has something real to filter in local/dev testing too, not
-- just in production where it happens to matter.
insert into public.books
  (slug, title, author, description, price, image_url, stock, is_active, category, format, publisher, published_at, page_count, isbn, dimensions, language)
values
  ('the-quiet-orchard', 'The Quiet Orchard', 'Elena Vale',
   'A slow, luminous novel about three sisters who return to their late grandmother''s orchard one last summer, and the inheritance they didn''t expect to find growing between the trees.',
   24, 'https://picsum.photos/seed/the-quiet-orchard/480/680', 12, true, 'Fiction',
   'Hardcover', 'Amberleaf Press', '2024-03-12', 342, '978-1-234567-01-0', '14 x 21 cm', 'English'),

  ('salt-and-starlight', 'Salt and Starlight', 'Marcus Webb',
   'A coastal town, a missing lighthouse keeper, and the reporter who won''t let the story go. A quiet, atmospheric mystery for readers who prefer mood over pace.',
   21, 'https://picsum.photos/seed/salt-and-starlight/480/680', 8, true, 'Mystery',
   'Paperback', 'Northwind Books', '2023-09-01', 288, '978-1-234567-02-7', '13 x 20 cm', 'English'),

  ('the-cartographer-of-small-rooms', 'The Cartographer of Small Rooms', 'Ingrid Solheim',
   'An architect maps the apartment she grew up in, room by room, memory by memory, in this quiet meditation on home, grief, and the spaces we carry with us.',
   27, 'https://picsum.photos/seed/the-cartographer-of-small-rooms/480/680', 5, true, 'Fiction',
   'Hardcover', 'Amberleaf Press', '2024-01-18', 401, '978-1-234567-03-4', '14 x 21 cm', 'English'),

  ('field-notes-on-wonder', 'Field Notes on Wonder', 'Priya Anand',
   'A naturalist''s diary of a single year spent watching one patch of forest change with the seasons — equal parts science writing and love letter to paying attention.',
   19, 'https://picsum.photos/seed/field-notes-on-wonder/480/680', 20, true, 'Nonfiction',
   'Paperback', 'Fieldstone Editions', '2022-05-22', 256, '978-1-234567-04-1', '13 x 20 cm', 'English'),

  ('the-last-ferry-to-morrow', 'The Last Ferry to Morrow', 'Kenji Osei',
   'A near-future story about a small island community that must decide, together, whether to leave before the water rises or stay and rebuild everything from higher ground.',
   23, 'https://picsum.photos/seed/the-last-ferry-to-morrow/480/680', 15, true, 'Science Fiction',
   'Hardcover', 'Northwind Books', '2023-11-07', 376, '978-1-234567-05-8', '14 x 21 cm', 'English'),

  ('a-history-of-quiet-things', 'A History of Quiet Things', 'Elena Vale',
   'An essay collection on silence, restraint, and the small unremarked-upon objects — a chipped teacup, a folded letter — that end up carrying the most weight.',
   18, 'https://picsum.photos/seed/a-history-of-quiet-things/480/680', 9, true, 'Nonfiction',
   'Paperback', 'Fieldstone Editions', '2021-10-14', 212, '978-1-234567-06-5', '13 x 20 cm', 'English'),

  ('the-clockmakers-daughter', 'The Clockmaker''s Daughter', 'Ingrid Solheim',
   'In a city where time can be bottled and sold, a clockmaker''s daughter discovers her father has been hoarding decades no one else knows are missing.',
   25, 'https://picsum.photos/seed/the-clockmakers-daughter/480/680', 0, true, 'Fantasy',
   'Hardcover', 'Amberleaf Press', '2024-06-04', 389, '978-1-234567-07-2', '14 x 21 cm', 'English'),

  ('low-tide-notebook', 'Low Tide Notebook', 'Marcus Webb',
   'Short, tide-timed prose pieces written on a single stretch of beach over one winter — a small, unhurried book meant to be read a page at a time.',
   16, 'https://picsum.photos/seed/low-tide-notebook/480/680', 30, true, 'Poetry',
   'Paperback', 'Fieldstone Editions', '2023-02-09', 128, '978-1-234567-08-9', '12 x 18 cm', 'English'),

  ('the-unfinished-atlas', 'The Unfinished Atlas', 'Priya Anand',
   'A discontinued title kept here to exercise the data layer''s is_active filter — should never appear on the storefront.',
   22, 'https://picsum.photos/seed/the-unfinished-atlas/480/680', 4, false, 'Nonfiction',
   'Paperback', 'Northwind Books', '2020-08-30', 304, '978-1-234567-09-6', '13 x 20 cm', 'English')
on conflict (slug) do nothing;
