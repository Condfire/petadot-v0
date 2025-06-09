-- Verificar a estrutura da tabela ongs
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ongs';

-- Verificar um registro de exemplo para entender os dados
SELECT * FROM ongs LIMIT 1;
