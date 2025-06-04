-- Verificar configuração de moderação por palavras-chave
SELECT setting_key, setting_value, description 
FROM moderation_settings 
WHERE setting_key = 'enable_keyword_moderation';

-- Verificar palavras-chave cadastradas
SELECT id, keyword, is_active, created_at, updated_at 
FROM moderation_keywords;
