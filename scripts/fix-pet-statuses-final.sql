-- Script para padronizar todos os status de pets para "approved"
-- Execute este script se quiser aprovar todos os pets existentes para teste

-- 1. Verificar status atuais
SELECT 'Status atuais:' as info;
SELECT DISTINCT status, COUNT(*) as count
FROM pets 
GROUP BY status 
ORDER BY count DESC;

-- 2. Padronizar todos os status para "approved" (CUIDADO: isso aprova TODOS os pets)
-- Descomente as linhas abaixo apenas se quiser aprovar todos os pets para teste:

-- UPDATE pets 
-- SET status = 'approved' 
-- WHERE status IS NULL OR status = '' OR status != 'approved';

-- 3. Verificar resultado
SELECT 'Status após atualização:' as info;
SELECT DISTINCT status, COUNT(*) as count
FROM pets 
GROUP BY status 
ORDER BY count DESC;

-- 4. Mostrar alguns pets de exemplo
SELECT 'Exemplos de pets:' as info;
SELECT id, name, category, status, created_at
FROM pets 
ORDER BY created_at DESC 
LIMIT 10;
