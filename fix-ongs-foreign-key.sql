-- Verificar se a tabela users existe e tem a estrutura correta
DO $$
BEGIN
    -- Verificar se a tabela users existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Criar tabela users se não existir
        CREATE TABLE users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            type TEXT DEFAULT 'user',
            is_admin BOOLEAN DEFAULT FALSE,
            state TEXT,
            city TEXT
        );
        
        -- Habilitar RLS
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Política para permitir que usuários vejam e editem seus próprios dados
        CREATE POLICY "Users can view own profile" ON users
            FOR SELECT USING (auth.uid() = id);
            
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING (auth.uid() = id);
            
        CREATE POLICY "Users can insert own profile" ON users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Verificar se a coluna cnpj existe na tabela ongs
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ongs' AND column_name = 'cnpj'
    ) THEN
        ALTER TABLE ongs ADD COLUMN cnpj VARCHAR(18);
    END IF;
    
    -- Verificar se a foreign key constraint existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ongs_user_id_fkey' AND table_name = 'ongs'
    ) THEN
        -- Adicionar a constraint se não existir
        ALTER TABLE ongs ADD CONSTRAINT ongs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar a estrutura atual
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'ongs')
ORDER BY table_name, ordinal_position;
