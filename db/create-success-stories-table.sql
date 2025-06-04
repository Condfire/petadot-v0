-- Criar tabela de histórias de sucesso
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  story TEXT NOT NULL,
  image_url TEXT,
  pet_id UUID NOT NULL,
  pet_type VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_success_stories_user_id ON success_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_pet_id ON success_stories(pet_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_created_at ON success_stories(created_at);

-- Adicionar políticas de RLS
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- Política para inserção (usuários autenticados podem adicionar histórias)
CREATE POLICY "Usuários autenticados podem adicionar histórias" 
ON success_stories FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Política para leitura (qualquer pessoa pode ler)
CREATE POLICY "Qualquer pessoa pode ler histórias" 
ON success_stories FOR SELECT 
TO anon, authenticated 
USING (true);

-- Política para atualização (usuários podem atualizar suas próprias histórias)
CREATE POLICY "Usuários podem atualizar suas próprias histórias" 
ON success_stories FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para exclusão (usuários podem excluir suas próprias histórias)
CREATE POLICY "Usuários podem excluir suas próprias histórias" 
ON success_stories FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Adicionar política para administradores
CREATE POLICY "Administradores podem fazer tudo" 
ON success_stories 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
