-- Verificar valores de status na tabela pets
SELECT DISTINCT status FROM pets;

-- Verificar valores de status na tabela pets_lost
SELECT DISTINCT status FROM pets_lost;

-- Verificar valores de status na tabela pets_found
SELECT DISTINCT status FROM pets_found;

-- Verificar um pet específico que foi marcado como resolvido
SELECT id, name, status, resolved, resolved_at, resolution_notes 
FROM pets_lost 
WHERE resolved = true 
LIMIT 5;

-- Verificar um pet específico que foi marcado como adotado
SELECT id, name, status, adopted, adopted_at, adoption_notes 
FROM pets 
WHERE adopted = true OR status = 'adopted'
LIMIT 5;

-- Verificar um pet específico que foi marcado como reunido
SELECT id, name, status, reunited, reunited_at, reunion_notes 
FROM pets_found 
WHERE reunited = true OR status = 'reunited'
LIMIT 5;
