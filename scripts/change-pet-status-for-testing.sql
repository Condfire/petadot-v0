-- Aprovar alguns pets
UPDATE pets 
SET status = 'approved' 
WHERE status != 'approved' 
AND category = 'adoption'
LIMIT 2;

-- Rejeitar alguns pets
UPDATE pets 
SET status = 'rejected',
    rejection_reason = 'Teste de rejeição - informações incompletas'
WHERE status != 'rejected' 
AND category = 'lost'
LIMIT 1;

-- Deixar alguns pendentes
UPDATE pets 
SET status = 'pending'
WHERE status != 'pending' 
AND category = 'found'
LIMIT 1;

-- Verificar as mudanças
SELECT 
  name, status, category, rejection_reason, user_id
FROM pets 
ORDER BY updated_at DESC 
LIMIT 10;
