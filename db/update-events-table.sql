-- Migration to rename columns in events table
-- This migration changes title -> name and date -> start_date

ALTER TABLE IF EXISTS events
  RENAME COLUMN title TO name;

ALTER TABLE IF EXISTS events
  RENAME COLUMN date TO start_date;

-- Rename indexes referencing the old columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'events'
      AND indexname = 'idx_events_title'
  ) THEN
    ALTER INDEX idx_events_title RENAME TO idx_events_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'events'
      AND indexname = 'idx_events_date'
  ) THEN
    ALTER INDEX idx_events_date RENAME TO idx_events_start_date;
  END IF;
END$$;
