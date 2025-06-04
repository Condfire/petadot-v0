-- Ativar a moderação por palavras-chave
UPDATE moderation_settings
SET setting_value = '{"enabled": true}'
WHERE setting_key = 'enable_keyword_moderation';

-- Adicionar palavras-chave comuns relacionadas à venda de pets
INSERT INTO moderation_keywords (keyword, is_active)
VALUES 
  ('venda', true),
  ('vender', true),
  ('comprar', true),
  ('compra', true),
  ('preço', true),
  ('valor', true),
  ('custo', true),
  ('pagamento', true),
  ('dinheiro', true),
  ('reais', true),
  ('r$', true)
ON CONFLICT (keyword) DO UPDATE
SET is_active = true;
