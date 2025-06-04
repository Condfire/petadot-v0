-- Verificar a estrutura da tabela pets
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela pets_lost
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets_lost'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela pets_found
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets_found'
ORDER BY ordinal_position;

-- Verificar se existem registros nas tabelas
SELECT 'pets' as table_name, COUNT(*) as record_count FROM pets
UNION ALL
SELECT 'pets_lost' as table_name, COUNT(*) as record_count FROM pets_lost
UNION ALL
SELECT 'pets_found' as table_name, COUNT(*) as record_count FROM pets_found;

-- Verificar os primeiros registros de cada tabela
SELECT 'pets' as table_name, id, name, status, created_at FROM pets LIMIT 3;
SELECT 'pets_lost' as table_name, id, name, status, created_at FROM pets_lost LIMIT 3;
SELECT 'pets_found' as table_name, id, name, status, created_at FROM pets_found LIMIT 3;
