-- Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pets_lost' 
        AND column_name = 'special_needs_description'
    ) THEN
        -- Adicionar a coluna special_needs_description
        ALTER TABLE pets_lost ADD COLUMN special_needs_description TEXT;
        
        -- Adicionar a coluna is_special_needs se não existir
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'pets_lost' 
            AND column_name = 'is_special_needs'
        ) THEN
            ALTER TABLE pets_lost ADD COLUMN is_special_needs BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Adicionar outras colunas relacionadas se não existirem
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'pets_lost' 
            AND column_name = 'good_with_kids'
        ) THEN
            ALTER TABLE pets_lost ADD COLUMN good_with_kids BOOLEAN DEFAULT FALSE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'pets_lost' 
            AND column_name = 'good_with_cats'
        ) THEN
            ALTER TABLE pets_lost ADD COLUMN good_with_cats BOOLEAN DEFAULT FALSE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'pets_lost' 
            AND column_name = 'good_with_dogs'
        ) THEN
            ALTER TABLE pets_lost ADD COLUMN good_with_dogs BOOLEAN DEFAULT FALSE;
        END IF;
        
        RAISE NOTICE 'Colunas adicionadas com sucesso à tabela pets_lost';
    ELSE
        RAISE NOTICE 'A coluna special_needs_description já existe na tabela pets_lost';
    END IF;
END $$;

-- Verificar a estrutura atual da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pets_lost'
ORDER BY ordinal_position;
