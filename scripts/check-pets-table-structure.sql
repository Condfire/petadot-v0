-- Verificar a estrutura da tabela pets
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;
