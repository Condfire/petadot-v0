-- Verificar se a coluna is_verified existe na tabela ongs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ongs' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE ongs ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Verificar ONGs existentes
UPDATE ongs SET is_verified = true WHERE is_verified IS NULL OR is_verified = false;

-- Verificar quantas ONGs foram atualizadas
SELECT COUNT(*) as ongs_verified FROM ongs WHERE is_verified = true;
