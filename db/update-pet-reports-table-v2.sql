-- Update pet_reports table to include additional fields for the reporting system
ALTER TABLE pet_reports 
ADD COLUMN IF NOT EXISTS reason VARCHAR(50) NOT NULL DEFAULT 'other',
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pet_reports_status ON pet_reports(status);
CREATE INDEX IF NOT EXISTS idx_pet_reports_pet_id ON pet_reports(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_reports_user_id ON pet_reports(user_id);

-- Add constraint to ensure valid status values
ALTER TABLE pet_reports 
DROP CONSTRAINT IF EXISTS pet_reports_status_check;

ALTER TABLE pet_reports 
ADD CONSTRAINT pet_reports_status_check 
CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Add constraint to ensure valid reason values
ALTER TABLE pet_reports 
DROP CONSTRAINT IF EXISTS pet_reports_reason_check;

ALTER TABLE pet_reports 
ADD CONSTRAINT pet_reports_reason_check 
CHECK (reason IN (
  'inappropriate_content',
  'fake_listing', 
  'spam',
  'animal_abuse',
  'already_adopted',
  'commercial_breeding',
  'other'
));
