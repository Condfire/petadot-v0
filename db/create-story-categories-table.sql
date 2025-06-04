-- Criar tabela de categorias de histórias
CREATE TABLE IF NOT EXISTS story_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna category_id à tabela pet_stories se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pet_stories' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE pet_stories ADD COLUMN category_id UUID REFERENCES story_categories(id);
  END IF;
END $$;

-- Inserir algumas categorias padrão
INSERT INTO story_categories (name, slug, description)
VALUES 
  ('Adoção', 'adocao', 'Histórias de adoção de pets'),
  ('Resgate', 'resgate', 'Histórias de resgate de animais'),
  ('Reencontro', 'reencontro', 'Histórias de reencontro com pets perdidos'),
  ('Superação', 'superacao', 'Histórias de superação de dificuldades'),
  ('Amizade', 'amizade', 'Histórias de amizade entre humanos e pets')
ON CONFLICT (slug) DO NOTHING;
