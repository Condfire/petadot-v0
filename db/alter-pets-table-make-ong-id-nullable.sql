DO $$
BEGIN
    -- Check if the column exists and is NOT NULL
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pets'
          AND column_name = 'ong_id'
          AND is_nullable = 'NO'
    ) THEN
        -- Alter the column to be nullable
        ALTER TABLE public.pets ALTER COLUMN ong_id DROP NOT NULL;
        RAISE NOTICE 'Column ong_id in table pets altered to be nullable.';
    ELSE
        RAISE NOTICE 'Column ong_id in table pets is already nullable or does not exist.';
    END IF;
END
$$;
