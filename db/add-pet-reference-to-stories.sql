-- Adicionar colunas de referência ao pet na tabela pet_stories
ALTER TABLE pet_stories
ADD COLUMN IF NOT EXISTS pet_id TEXT,
ADD COLUMN IF NOT EXISTS pet_type TEXT;

-- Comentários para as novas colunas
COMMENT ON COLUMN pet_stories.pet_id IS 'ID do pet relacionado à história';
COMMENT ON COLUMN pet_stories.pet_type IS 'Tipo do pet (adoption, lost, found)';
