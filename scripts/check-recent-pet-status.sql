-- Check the status and details of the most recently created pet
SELECT 
  id,
  name,
  status,
  category,
  user_id,
  ong_id,
  created_at
FROM pets 
WHERE category = 'adoption'
ORDER BY created_at DESC 
LIMIT 5;
