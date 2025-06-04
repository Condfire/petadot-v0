-- Verificar se os campos is_special_needs e contact estão sendo salvos corretamente
SELECT id, name, is_special_needs, contact, user_id 
FROM pets 
ORDER BY created_at DESC 
LIMIT 10;
