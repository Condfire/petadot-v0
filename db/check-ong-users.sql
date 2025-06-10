-- Seleciona todos os usuários com tipo 'ong' para verificar se existem dados
SELECT id, name, email, city, state, created_at
FROM public.users
WHERE type = 'ong'
LIMIT 10;
