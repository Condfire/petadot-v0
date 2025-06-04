-- Criar tabela de parceiros
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  website_url TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar permissões para a tabela
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de parceiros" 
ON partners FOR SELECT 
USING (true);

-- Política para permitir inserção apenas por administradores
CREATE POLICY "Permitir inserção de parceiros por administradores" 
ON partners FOR INSERT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- Política para permitir atualização apenas por administradores
CREATE POLICY "Permitir atualização de parceiros por administradores" 
ON partners FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- Política para permitir exclusão apenas por administradores
CREATE POLICY "Permitir exclusão de parceiros por administradores" 
ON partners FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);
