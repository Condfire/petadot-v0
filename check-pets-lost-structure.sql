-- Verificar a estrutura da tabela pets_lost
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pets_lost';
