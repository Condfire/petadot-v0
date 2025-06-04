-- Add a 'type' column to the users table to differentiate user types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN type TEXT DEFAULT 'regular';
        RAISE NOTICE 'Column "type" added to "users" table.';
    ELSE
        RAISE NOTICE 'Column "type" already exists in "users" table.';
    END IF;
END $$;

-- Add 'state' and 'city' columns to the users table if they don't exist
-- These might be general location for any user, not just NGOs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'state'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN state VARCHAR(255);
        RAISE NOTICE 'Column "state" added to "users" table.';
    ELSE
        RAISE NOTICE 'Column "state" already exists in "users" table.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN city VARCHAR(255);
        RAISE NOTICE 'Column "city" added to "users" table.';
    ELSE
        RAISE NOTICE 'Column "city" already exists in "users" table.';
    END IF;
END $$;

-- Ensure avatar_url exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Column "avatar_url" added to "users" table.';
    ELSE
        RAISE NOTICE 'Column "avatar_url" already exists in "users" table.';
    END IF;
END $$;
