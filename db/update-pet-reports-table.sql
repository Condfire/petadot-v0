-- Update pet_reports table to include additional fields
ALTER TABLE pet_reports 
ADD COLUMN IF NOT EXISTS additional_details TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pet_reports_status ON pet_reports(status);
CREATE INDEX IF NOT EXISTS idx_pet_reports_created_at ON pet_reports(created_at DESC);

-- Add check constraint for status
ALTER TABLE pet_reports 
ADD CONSTRAINT IF NOT EXISTS chk_pet_reports_status 
CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));
