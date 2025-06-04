-- Adicionar coluna rejection_reason à tabela pets
DO $$ 
BEGIN
    -- Verificar se a coluna rejection_reason já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pets' 
        AND column_name = 'rejection_reason'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna rejection_reason
        ALTER TABLE pets ADD COLUMN rejection_reason TEXT;
        
        RAISE NOTICE 'Coluna rejection_reason adicionada à tabela pets';
    ELSE
        RAISE NOTICE 'Coluna rejection_reason já existe na tabela pets';
    END IF;
END $$;

-- Verificar a estrutura da tabela pets após a alteração
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets' 
AND table_schema = 'public'
ORDER BY ordinal_position;
