-- Verificar se a tabela pet_stories existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pet_stories'
) AS "tabela_existe";

-- Se existir, verificar a estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pet_stories';

-- Verificar se existem histórias na tabela
SELECT COUNT(*) AS "total_historias" 
FROM pet_stories;

-- Verificar algumas histórias de exemplo
SELECT id, title, user_id, status, created_at 
FROM pet_stories 
LIMIT 5;
