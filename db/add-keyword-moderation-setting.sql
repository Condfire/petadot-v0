-- Adiciona a configuração para habilitar/desabilitar a moderação por palavras-chave
INSERT INTO moderation_settings (setting_key, setting_value, description)
VALUES (
    'enable_keyword_moderation',
    '{"enabled": false}',
    'Habilitar moderação automática de posts por palavras-chave'
)
ON CONFLICT (setting_key) DO NOTHING;
