-- Verificar se a tabela ongs já existe
CREATE TABLE IF NOT EXISTS ongs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  contact_email TEXT,
  contact_phone VARCHAR(20),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar a performance de consultas por user_id
CREATE INDEX IF NOT EXISTS idx_ongs_user_id ON ongs(user_id);

-- Adicionar política de segurança para a tabela ongs
BEGIN;
  -- Remover políticas existentes para evitar conflitos
  DROP POLICY IF EXISTS "Usuários autenticados podem ler todas as ONGs" ON ongs;
  DROP POLICY IF EXISTS "ONGs podem editar seus próprios dados" ON ongs;
  DROP POLICY IF EXISTS "Admins podem gerenciar todas as ONGs" ON ongs;

  -- Criar novas políticas
  CREATE POLICY "Usuários autenticados podem ler todas as ONGs"
    ON ongs FOR SELECT
    USING (true);

  CREATE POLICY "ONGs podem editar seus próprios dados"
    ON ongs FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Admins podem gerenciar todas as ONGs"
    ON ongs FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.is_admin = true
      )
    );
COMMIT;
