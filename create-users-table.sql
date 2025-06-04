-- Criar a tabela users se ela não existir
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se a tabela pets_lost tem a chave estrangeira correta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'pets_lost_user_id_fkey' 
    AND table_name = 'pets_lost'
  ) THEN
    ALTER TABLE pets_lost 
    ADD CONSTRAINT pets_lost_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id);
  END IF;
END
$$;

-- Verificar se a tabela pets tem a chave estrangeira correta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'pets_user_id_fkey' 
    AND table_name = 'pets'
  ) THEN
    ALTER TABLE pets 
    ADD CONSTRAINT pets_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id);
  END IF;
END
$$;

-- Verificar se a tabela pets_found tem a chave estrangeira correta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'pets_found_user_id_fkey' 
    AND table_name = 'pets_found'
  ) THEN
    ALTER TABLE pets_found 
    ADD CONSTRAINT pets_found_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id);
  END IF;
END
$$;
