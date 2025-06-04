-- Adicionar a coluna 'cnpj' à tabela 'ongs' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ongs' AND column_name = 'cnpj'
    ) THEN
        ALTER TABLE ongs ADD COLUMN cnpj VARCHAR(18);
    END IF;
END $$;

-- Verificar a estrutura atual da tabela ongs
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ongs';
