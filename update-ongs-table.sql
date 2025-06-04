-- Verificar se a coluna user_id existe e adicioná-la se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ongs' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE ongs ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Verificar se a coluna created_at existe e adicioná-la se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ongs' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE ongs ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Verificar se a coluna updated_at existe e adicioná-la se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ongs' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE ongs ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Verificar se a coluna is_verified existe e adicioná-la se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ongs' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE ongs ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Mostrar a estrutura atual da tabela ongs
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ongs';
