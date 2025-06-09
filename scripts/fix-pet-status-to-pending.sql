-- Update the existing pet to pending status for testing moderation
UPDATE pets 
SET status = 'pending', updated_at = NOW()
WHERE id = 'a60803f3-6a4e-456d-8fbf-34c3d19a528d';

-- Verify the update
SELECT id, name, status, category FROM pets 
WHERE id = 'a60803f3-6a4e-456d-8fbf-34c3d19a528d';
