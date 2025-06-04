-- Create ongs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ongs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    mission TEXT,
    contact_email TEXT,
    contact_phone VARCHAR(20),
    website TEXT,
    address TEXT,
    city TEXT,
    state VARCHAR(2),
    postal_code VARCHAR(10),
    logo_url TEXT,
    verification_document_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (idempotent additions)
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='user_id') THEN ALTER TABLE public.ongs ADD COLUMN user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='name') THEN ALTER TABLE public.ongs ADD COLUMN name TEXT NOT NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='cnpj') THEN ALTER TABLE public.ongs ADD COLUMN cnpj VARCHAR(18) UNIQUE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='mission') THEN ALTER TABLE public.ongs ADD COLUMN mission TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='contact_email') THEN ALTER TABLE public.ongs ADD COLUMN contact_email TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='contact_phone') THEN ALTER TABLE public.ongs ADD COLUMN contact_phone VARCHAR(20); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='website') THEN ALTER TABLE public.ongs ADD COLUMN website TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='address') THEN ALTER TABLE public.ongs ADD COLUMN address TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='city') THEN ALTER TABLE public.ongs ADD COLUMN city TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='state') THEN ALTER TABLE public.ongs ADD COLUMN state VARCHAR(2); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='postal_code') THEN ALTER TABLE public.ongs ADD COLUMN postal_code VARCHAR(10); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='logo_url') THEN ALTER TABLE public.ongs ADD COLUMN logo_url TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='verification_document_url') THEN ALTER TABLE public.ongs ADD COLUMN verification_document_url TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='is_verified') THEN ALTER TABLE public.ongs ADD COLUMN is_verified BOOLEAN DEFAULT FALSE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ongs' AND column_name='slug') THEN ALTER TABLE public.ongs ADD COLUMN slug TEXT UNIQUE; END IF; END $$;

-- Ensure created_at and updated_at have defaults
ALTER TABLE public.ongs ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.ongs ALTER COLUMN updated_at SET DEFAULT NOW();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_ongs ON public.ongs;
CREATE TRIGGER set_updated_at_ongs
BEFORE UPDATE ON public.ongs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); -- Assuming update_updated_at_column function exists from previous scripts

RAISE NOTICE 'ONGs table schema ensured.';
