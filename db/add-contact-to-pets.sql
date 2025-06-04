-- Adicionar coluna 'contact' à tabela 'pets' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pets' AND column_name = 'contact'
    ) THEN
        ALTER TABLE pets ADD COLUMN contact TEXT;
    END IF;
END $$;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pets' AND column_name = 'contact';
