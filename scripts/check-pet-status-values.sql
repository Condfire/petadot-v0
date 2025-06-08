-- Verificar todos os valores de status existentes no banco
SELECT DISTINCT status, COUNT(*) as count
FROM pets 
GROUP BY status 
ORDER BY count DESC;

-- Verificar pets por categoria e status
SELECT category, status, COUNT(*) as count
FROM pets 
GROUP BY category, status 
ORDER BY category, count DESC;
