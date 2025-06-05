-- Verificar o status atual de todos os pets
SELECT 
  status,
  COUNT(*) as quantidade,
  category
FROM pets 
GROUP BY status, category
ORDER BY category, status;

-- Verificar pets por usuário
SELECT 
  u.email,
  p.status,
  COUNT(*) as quantidade
FROM pets p
JOIN auth.users u ON p.user_id = u.id
GROUP BY u.email, p.status
ORDER BY u.email, p.status;

-- Verificar se há pets sem status definido
SELECT 
  id, name, status, category, user_id
FROM pets 
WHERE status IS NULL OR status = ''
LIMIT 10;
