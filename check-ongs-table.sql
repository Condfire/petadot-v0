-- Verificar se a tabela ongs existe e criar se não existir
CREATE TABLE IF NOT EXISTS ongs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  contact_phone VARCHAR(20),
  address TEXT,
  city TEXT,
  state TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e configurar as políticas de segurança para a tabela ongs
DO $$
BEGIN
  -- Remover políticas existentes para evitar conflitos
  DROP POLICY IF EXISTS "Permitir acesso público para leitura" ON ongs;
  DROP POLICY IF EXISTS "Permitir inserção pelo próprio usuário" ON ongs;
  DROP POLICY IF EXISTS "Permitir atualização pelo próprio usuário" ON ongs;
  DROP POLICY IF EXISTS "Permitir exclusão pelo próprio usuário" ON ongs;
  
  -- Habilitar RLS (Row Level Security)
  ALTER TABLE ongs ENABLE ROW LEVEL SECURITY;
  
  -- Criar políticas
  CREATE POLICY "Permitir acesso público para leitura" 
    ON ongs FOR SELECT 
    USING (true);
    
  CREATE POLICY "Permitir inserção pelo próprio usuário" 
    ON ongs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Permitir atualização pelo próprio usuário" 
    ON ongs FOR UPDATE 
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Permitir exclusão pelo próprio usuário" 
    ON ongs FOR DELETE 
    USING (auth.uid() = user_id);
END
$$;
