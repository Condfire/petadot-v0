-- Verificar ONGs sem slug ou com slug inválido
SELECT id, name, slug, city, state, created_at
FROM ongs 
WHERE slug IS NULL OR slug = '' OR slug LIKE '%item-%'
ORDER BY created_at DESC;
