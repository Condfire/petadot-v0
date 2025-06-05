-- Criar cenários de teste para diferentes status de pets
-- Este script vai criar pets com diferentes status para testar a visibilidade

-- Primeiro, vamos verificar se temos usuários para testar
SELECT id, email, name FROM auth.users LIMIT 5;

-- Criar alguns pets de teste com diferentes status
-- Substitua os user_ids pelos IDs reais dos seus usuários

-- Pet aprovado (visível para todos)
INSERT INTO pets (
  name, species, breed, description, category, status, 
  city, state, user_id, created_at
) VALUES (
  'Rex Aprovado', 'Cão', 'Labrador', 'Pet aprovado para teste de visibilidade', 
  'adoption', 'approved', 'São Paulo', 'SP', 
  (SELECT id FROM auth.users LIMIT 1), NOW()
);

-- Pet pendente (visível apenas para o dono)
INSERT INTO pets (
  name, species, breed, description, category, status, 
  city, state, user_id, created_at
) VALUES (
  'Mia Pendente', 'Gato', 'Persa', 'Pet pendente para teste de visibilidade', 
  'lost', 'pending', 'Rio de Janeiro', 'RJ', 
  (SELECT id FROM auth.users LIMIT 1), NOW()
);

-- Pet rejeitado (visível apenas para o dono)
INSERT INTO pets (
  name, species, breed, description, category, status, 
  city, state, user_id, rejection_reason, created_at
) VALUES (
  'Thor Rejeitado', 'Cão', 'Pastor Alemão', 'Pet rejeitado para teste de visibilidade', 
  'found', 'rejected', 'Belo Horizonte', 'MG', 
  (SELECT id FROM auth.users LIMIT 1), 'Informações insuficientes', NOW()
);

-- Verificar os pets criados
SELECT 
  id, name, status, category, user_id, rejection_reason,
  created_at
FROM pets 
WHERE name LIKE '%Aprovado%' OR name LIKE '%Pendente%' OR name LIKE '%Rejeitado%'
ORDER BY created_at DESC;
