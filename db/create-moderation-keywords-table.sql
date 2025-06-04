-- Cria a tabela para armazenar palavras-chave de moderação
CREATE TABLE IF NOT EXISTS moderation_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria um índice para a coluna keyword para buscas mais rápidas
CREATE INDEX IF NOT EXISTS idx_moderation_keywords_keyword ON moderation_keywords (keyword);

-- Adiciona uma função para atualizar automaticamente a coluna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria um trigger para a tabela moderation_keywords
DROP TRIGGER IF EXISTS set_updated_at ON moderation_keywords;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON moderation_keywords
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
