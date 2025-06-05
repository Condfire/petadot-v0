-- Primeiro, vamos verificar a estrutura atual da tabela pets
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;

-- Padronizar status para "approved" em vez de "aprovado"
UPDATE pets
SET status = 'approved'
WHERE status = 'aprovado';

-- Padronizar status para "pending" em vez de "pendente"  
UPDATE pets
SET status = 'pending'
WHERE status = 'pendente';

-- Padronizar status para "rejected" em vez de "rejeitado"
UPDATE pets
SET status = 'rejected'
WHERE status = 'rejeitado';

-- Corrigir imagens nulas ou vazias (usando image_url que deve existir)
UPDATE pets
SET image_url = NULL
WHERE image_url = '' OR image_url = 'null' OR image_url LIKE '%undefined%';

-- Definir status padrão para pets sem status
UPDATE pets
SET status = 'pending'
WHERE status IS NULL OR status = '';

-- Verificar e corrigir slugs vazios
UPDATE pets
SET slug = LOWER(REPLACE(REPLACE(name || '-' || species || '-' || COALESCE(city, 'unknown'), ' ', '-'), '--', '-'))
WHERE slug IS NULL OR slug = '';

-- Verificar quantos pets temos por status após as correções
SELECT status, COUNT(*) as count
FROM pets
GROUP BY status
ORDER BY status;
