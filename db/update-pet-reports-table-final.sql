-- Update pet_reports table to include all necessary columns
ALTER TABLE pet_reports 
ADD COLUMN IF NOT EXISTS reason VARCHAR(50) NOT NULL DEFAULT 'other',
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add check constraint for valid reasons
ALTER TABLE pet_reports 
DROP CONSTRAINT IF EXISTS pet_reports_reason_check;

ALTER TABLE pet_reports 
ADD CONSTRAINT pet_reports_reason_check 
CHECK (reason IN (
  'inappropriate_content',
  'fake_listing',
  'spam', 
  'animal_abuse',
  'incorrect_information',
  'already_adopted',
  'other'
));

-- Add check constraint for valid status
ALTER TABLE pet_reports 
DROP CONSTRAINT IF EXISTS pet_reports_status_check;

ALTER TABLE pet_reports 
ADD CONSTRAINT pet_reports_status_check 
CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pet_reports_status ON pet_reports(status);
CREATE INDEX IF NOT EXISTS idx_pet_reports_pet_user ON pet_reports(pet_id, user_id);
CREATE INDEX IF NOT EXISTS idx_pet_reports_created_at ON pet_reports(created_at DESC);

-- Add unique constraint to prevent duplicate reports from same user for same pet
ALTER TABLE pet_reports 
DROP CONSTRAINT IF EXISTS pet_reports_pet_user_unique;

ALTER TABLE pet_reports 
ADD CONSTRAINT pet_reports_pet_user_unique 
UNIQUE (pet_id, user_id);
