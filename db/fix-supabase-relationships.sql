-- 1. Verificar e adicionar coluna ong_id na tabela pets se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pets'
        AND column_name = 'ong_id'
    ) THEN
        ALTER TABLE public.pets ADD COLUMN ong_id UUID REFERENCES public.ongs(id);
    END IF;
END $$;

-- 2. Verificar se a tabela pets_lost existe, se não, criar uma view
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'pets_lost'
    ) THEN
        EXECUTE 'CREATE VIEW public.pets_lost AS SELECT * FROM public.pets WHERE category = ''lost''';
    END IF;
END $$;

-- 3. Verificar e adicionar coluna ong_id na tabela events se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'events'
        AND column_name = 'ong_id'
    ) THEN
        ALTER TABLE public.events ADD COLUMN ong_id UUID REFERENCES public.ongs(id);
    END IF;
END $$;

-- 4. Adicionar coluna likes na tabela pet_stories se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pet_stories'
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE public.pet_stories ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;
END $$;
