-- Update pet_reports table to include additional fields for the reporting system

-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Add reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pet_reports' AND column_name = 'reason') THEN
        ALTER TABLE pet_reports ADD COLUMN reason VARCHAR(50);
    END IF;

    -- Add details column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pet_reports' AND column_name = 'details') THEN
        ALTER TABLE pet_reports ADD COLUMN details TEXT;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pet_reports' AND column_name = 'status') THEN
        ALTER TABLE pet_reports ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;

    -- Add reviewed_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pet_reports' AND column_name = 'reviewed_by') THEN
        ALTER TABLE pet_reports ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add reviewed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pet_reports' AND column_name = 'reviewed_at') THEN
        ALTER TABLE pet_reports ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pet_reports' AND column_name = 'admin_notes') THEN
        ALTER TABLE pet_reports ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Create constraints and indexes
DO $$
BEGIN
    -- Add check constraint for reason if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'pet_reports_reason_check') THEN
        ALTER TABLE pet_reports ADD CONSTRAINT pet_reports_reason_check 
        CHECK (reason IN ('inappropriate_content', 'fake_listing', 'spam', 'animal_abuse', 'incorrect_information', 'already_adopted', 'other'));
    END IF;

    -- Add check constraint for status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'pet_reports_status_check') THEN
        ALTER TABLE pet_reports ADD CONSTRAINT pet_reports_status_check 
        CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));
    END IF;

    -- Add unique constraint to prevent duplicate reports
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'pet_reports_user_pet_unique') THEN
        ALTER TABLE pet_reports ADD CONSTRAINT pet_reports_user_pet_unique 
        UNIQUE (pet_id, user_id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pet_reports_status ON pet_reports(status);
CREATE INDEX IF NOT EXISTS idx_pet_reports_reason ON pet_reports(reason);
CREATE INDEX IF NOT EXISTS idx_pet_reports_created_at ON pet_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_pet_reports_pet_id ON pet_reports(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_reports_user_id ON pet_reports(user_id);

-- Update existing records to have default status if null
UPDATE pet_reports SET status = 'pending' WHERE status IS NULL;

-- Make reason and status NOT NULL after setting defaults
ALTER TABLE pet_reports ALTER COLUMN status SET NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE pet_reports IS 'Stores user reports about pets for moderation';
COMMENT ON COLUMN pet_reports.reason IS 'Categorized reason for the report';
COMMENT ON COLUMN pet_reports.details IS 'Additional details provided by the reporter';
COMMENT ON COLUMN pet_reports.status IS 'Current status of the report (pending, reviewed, resolved, dismissed)';
COMMENT ON COLUMN pet_reports.reviewed_by IS 'Admin user who reviewed the report';
COMMENT ON COLUMN pet_reports.reviewed_at IS 'Timestamp when the report was reviewed';
COMMENT ON COLUMN pet_reports.admin_notes IS 'Internal notes added by administrators';
