-- Verificar se as palavras-chave existem
SELECT * FROM moderation_keywords WHERE keyword IN ('venda', 'compra', 'vendo', 'vendendo', 'preço', 'dinheiro', 'pago', 'valor');

-- Se não existirem, inserir palavras-chave de moderação
INSERT INTO moderation_keywords (keyword, is_active, created_at) 
VALUES 
  ('venda', true, NOW()),
  ('compra', true, NOW()),
  ('vendo', true, NOW()),
  ('vendendo', true, NOW()),
  ('preço', true, NOW()),
  ('dinheiro', true, NOW()),
  ('pago', true, NOW()),
  ('valor', true, NOW()),
  ('$$', true, NOW()),
  ('R$', true, NOW())
ON CONFLICT (keyword) DO UPDATE SET is_active = true;

-- Verificar configuração de moderação
SELECT * FROM moderation_settings WHERE setting_key = 'enable_keyword_moderation';

-- Se não existir, criar configuração
INSERT INTO moderation_settings (setting_key, setting_value, created_at)
VALUES ('enable_keyword_moderation', '{"enabled": true}', NOW())
ON CONFLICT (setting_key) DO UPDATE SET setting_value = '{"enabled": true}';

-- Verificar resultado final
SELECT 'Palavras-chave configuradas:' as status;
SELECT keyword, is_active FROM moderation_keywords WHERE is_active = true;
SELECT 'Configuração de moderação:' as status;
SELECT setting_key, setting_value FROM moderation_settings;
