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

-- Corrigir imagens nulas ou vazias
UPDATE pets
SET main_image_url = NULL
WHERE main_image_url = '' OR main_image_url = 'null' OR main_image_url LIKE '%undefined%';

-- Verificar e corrigir imagens adicionais
UPDATE pets
SET additional_images = NULL
WHERE additional_images::text = '[]' OR additional_images::text = 'null' OR additional_images IS NULL;

-- Definir status padrão para pets sem status
UPDATE pets
SET status = 'pending'
WHERE status IS NULL OR status = '';

-- Verificar e corrigir slugs vazios
UPDATE pets
SET slug = id::text
WHERE slug IS NULL OR slug = '';
