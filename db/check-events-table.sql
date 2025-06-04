-- Verificar a estrutura da tabela events
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM 
  information_schema.columns 
WHERE 
  table_name = 'events'
ORDER BY 
  ordinal_position;
