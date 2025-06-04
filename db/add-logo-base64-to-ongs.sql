-- Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ongs' 
        AND column_name = 'logo_base64'
    ) THEN
        -- Adicionar a coluna logo_base64
        ALTER TABLE ongs ADD COLUMN logo_base64 TEXT;
        
        RAISE NOTICE 'Coluna logo_base64 adicionada com sucesso à tabela ongs';
    ELSE
        RAISE NOTICE 'A coluna logo_base64 já existe na tabela ongs';
    END IF;
END $$;

-- Verificar a estrutura atual da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ongs'
ORDER BY ordinal_position;
