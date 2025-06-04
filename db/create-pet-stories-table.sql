-- Função para criar a tabela pet_stories se não existir
CREATE OR REPLACE FUNCTION create_pet_stories_table()
RETURNS void AS $$
BEGIN
  -- Verificar se a tabela já existe
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pet_stories'
  ) THEN
    -- Criar a tabela pet_stories
    CREATE TABLE public.pet_stories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      pet_id UUID,
      pet_type TEXT,
      status TEXT DEFAULT 'pendente',
      likes INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      category_id UUID
    );
    
    -- Adicionar índices
    CREATE INDEX idx_pet_stories_user_id ON public.pet_stories(user_id);
    CREATE INDEX idx_pet_stories_status ON public.pet_stories(status);
    CREATE INDEX idx_pet_stories_created_at ON public.pet_stories(created_at DESC);
    
    -- Adicionar comentário
    COMMENT ON TABLE public.pet_stories IS 'Histórias de pets compartilhadas pelos usuários';
  END IF;
END;
$$ LANGUAGE plpgsql;
