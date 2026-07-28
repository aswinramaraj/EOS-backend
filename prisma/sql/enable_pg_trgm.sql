-- Enables typo-tolerant fuzzy search (used by BooksService/BookCategoriesService/
-- EResourcesService searchFuzzy()) via PostgreSQL's trigram similarity functions.
--
-- This project does not use `prisma migrate` (no prisma/migrations directory),
-- so this script is applied manually rather than as a Prisma migration:
--   psql "$DATABASE_URL" -f prisma/sql/enable_pg_trgm.sql
-- or paste it into the Supabase SQL editor.
--
-- Safe to re-run: every statement is idempotent.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram GIN indexes so similarity()/word_similarity() scans stay fast as
-- the books/book_categories/e_resources tables grow. Indexes only; no
-- column/table changes.
CREATE INDEX IF NOT EXISTS books_title_trgm_idx
  ON books USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS books_author_trgm_idx
  ON books USING GIN (author gin_trgm_ops);

CREATE INDEX IF NOT EXISTS book_categories_name_trgm_idx
  ON book_categories USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS e_resources_title_trgm_idx
  ON e_resources USING GIN (title gin_trgm_ops);
