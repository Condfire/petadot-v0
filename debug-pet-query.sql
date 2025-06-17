-- Check if the pet exists and what data it contains
SELECT 
  id,
  name,
  slug,
  category,
  species,
  species_other,
  breed,
  age,
  size,
  size_other,
  gender,
  gender_other,
  color,
  city,
  state,
  status,
  created_at
FROM pets 
WHERE slug = 'testeaprovadot-adocao-maringa-pr-2025-eb03e' 
   OR id = 'testeaprovadot-adocao-maringa-pr-2025-eb03e'
ORDER BY created_at DESC;
