-- Identificar e corrigir slugs duplicados existentes
DO $$
DECLARE
    duplicate_record RECORD;
    counter INTEGER;
    new_slug TEXT;
BEGIN
    -- Para cada slug duplicado, manter o primeiro e renumerar os outros
    FOR duplicate_record IN 
        SELECT slug, array_agg(id ORDER BY created_at) as pet_ids
        FROM pets 
        WHERE slug IS NOT NULL AND slug != ''
        GROUP BY slug 
        HAVING COUNT(*) > 1
    LOOP
        counter := 1;
        
        -- Pular o primeiro pet (manter o slug original)
        FOR i IN 2..array_length(duplicate_record.pet_ids, 1) LOOP
            new_slug := duplicate_record.slug || '-' || counter;
            
            -- Garantir que o novo slug também seja único
            WHILE EXISTS (SELECT 1 FROM pets WHERE slug = new_slug) LOOP
                counter := counter + 1;
                new_slug := duplicate_record.slug || '-' || counter;
            END LOOP;
            
            -- Atualizar o pet com o novo slug único
            UPDATE pets 
            SET slug = new_slug 
            WHERE id = duplicate_record.pet_ids[i];
            
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Verificar se ainda existem slugs duplicados
SELECT slug, COUNT(*) as count
FROM pets
WHERE slug IS NOT NULL AND slug != ''
GROUP BY slug
HAVING COUNT(*) > 1;
