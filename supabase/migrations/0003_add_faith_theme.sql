-- Adds the "Faith" ADOPT theme (Self development and inner growth).
--
-- New in the client's 19/07/26 ADOPT database ("ADOPT DATABASE 190726.xlsx").
-- All other 39 themes were unchanged (only a non-displayed second-person
-- "Description" column was added in the spreadsheet, which the app does not
-- use, so it is intentionally not imported). This inserts Faith exactly like
-- the existing rows: first-person `description`, `third_person_description`,
-- and the Self-development category colour.
--
-- Idempotent: the guard skips the insert if a theme named "Faith" already
-- exists, so it is safe to re-run.

insert into public.adopt_themes (category, theme, description, third_person_description, category_colour)
select
  'Self development and inner growth',
  'Faith',
  'I want to draw meaning, guidance and strength from what I believe in.',
  'Faith reflects the beliefs and convictions through which people make sense of life, whether religious, spiritual, humanist or values-based. This theme recognises belief as a source of meaning, comfort, community and moral direction, particularly during times of uncertainty, change or hardship. This theme honours each of these as equally valid, recognising faith as one of the most personal foundations for how a person lives, decides and belongs.',
  '#F5DEB3'
where not exists (
  select 1 from public.adopt_themes where theme = 'Faith'
);
