-- Run this SQL in your Supabase SQL Editor to create the helper function
-- This helps in safely checking if a table exists before querying it.
CREATE OR REPLACE FUNCTION check_table_exists(table_name_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' -- Or your specific schema
    AND table_name = table_name_to_check
  );
END;
$$ LANGUAGE plpgsql;

-- Grant usage to anon and authenticated roles if needed, though typically functions are callable by default.
-- GRANT EXECUTE ON FUNCTION check_table_exists(TEXT) TO anon;
-- GRANT EXECUTE ON FUNCTION check_table_exists(TEXT) TO authenticated;
