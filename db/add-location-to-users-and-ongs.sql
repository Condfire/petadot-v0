-- Verificar se a coluna state já existe na tabela users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'state'
    ) THEN
        ALTER TABLE users ADD COLUMN state VARCHAR(50);
    END IF;
END $$;

-- Verificar se a coluna city já existe na tabela users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'city'
    ) THEN
        ALTER TABLE users ADD COLUMN city VARCHAR(100);
    END IF;
END $$;

-- Verificar se a coluna state já existe na tabela ongs
-- (Não precisamos adicionar se já existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ongs' AND column_name = 'state'
    ) THEN
        ALTER TABLE ongs ADD COLUMN state VARCHAR(50);
    END IF;
END $$;

-- Verificar se a coluna city já existe na tabela ongs
-- (Não precisamos adicionar se já existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ongs' AND column_name = 'city'
    ) THEN
        ALTER TABLE ongs ADD COLUMN city VARCHAR(100);
    END IF;
END $$;

-- Verificar as colunas atuais da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Verificar as colunas atuais da tabela ongs
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ongs'
ORDER BY ordinal_position;
