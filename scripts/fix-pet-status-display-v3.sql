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

-- Corrigir imagens nulas ou vazias
UPDATE pets
SET image_url = NULL
WHERE image_url = '' OR image_url = 'null' OR image_url LIKE '%undefined%';

-- Definir status padrão para pets sem status
UPDATE pets
SET status = 'pending'
WHERE status IS NULL OR status = '';

-- Corrigir slugs vazios com slugs únicos
DO $$
DECLARE
    pet_record RECORD;
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER;
BEGIN
    FOR pet_record IN 
        SELECT id, name, species, city 
        FROM pets 
        WHERE slug IS NULL OR slug = ''
    LOOP
        -- Gerar slug base
        base_slug := LOWER(REPLACE(REPLACE(
            COALESCE(pet_record.name, 'pet') || '-' || 
            COALESCE(pet_record.species, 'unknown') || '-' || 
            COALESCE(pet_record.city, 'unknown'), 
            ' ', '-'), '--', '-'));
        
        -- Remover caracteres especiais
        base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\-]', '', 'g');
        
        -- Verificar se o slug já existe
        final_slug := base_slug;
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM pets WHERE slug = final_slug AND id != pet_record.id) LOOP
            final_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        -- Atualizar o pet com o slug único
        UPDATE pets 
        SET slug = final_slug 
        WHERE id = pet_record.id;
    END LOOP;
END $$;

-- Verificar quantos pets temos por status após as correções
SELECT status, COUNT(*) as count
FROM pets
GROUP BY status
ORDER BY status;

-- Verificar se ainda há pets sem slug
SELECT COUNT(*) as pets_without_slug
FROM pets
WHERE slug IS NULL OR slug = '';

-- Mostrar alguns exemplos de pets com seus status e slugs
SELECT id, name, status, slug, image_url
FROM pets
ORDER BY created_at DESC
LIMIT 10;
