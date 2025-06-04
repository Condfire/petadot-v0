-- Criar o bucket principal para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('petadot-images', 'petadot-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para o bucket
-- Permitir visualização pública de todas as imagens
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'petadot-images');

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'petadot-images' AND auth.role() = 'authenticated');

-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'petadot-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE 
USING (bucket_id = 'petadot-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'petadot-images';
