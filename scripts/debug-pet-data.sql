-- Verificar estrutura da tabela pets
SELECT 
  id,
  name,
  slug,
  category,
  status,
  main_image_url,
  images,
  city,
  state,
  created_at
FROM pets 
WHERE category IN ('lost', 'found', 'adoption')
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se existe tabela pet_images
SELECT 
  pi.pet_id,
  pi.url,
  pi.position,
  p.name as pet_name,
  p.category
FROM pet_images pi
JOIN pets p ON pi.pet_id = p.id
ORDER BY pi.pet_id, pi.position
LIMIT 10;

-- Verificar pets sem slug
SELECT 
  id,
  name,
  category,
  slug,
  status
FROM pets 
WHERE slug IS NULL OR slug = ''
LIMIT 5;
