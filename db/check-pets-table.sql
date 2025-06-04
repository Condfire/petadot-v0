-- Verificar todos os pets na tabela, independente do status
SELECT id, name, status, created_at, user_id, ong_id 
FROM pets 
ORDER BY created_at DESC 
LIMIT 10;
