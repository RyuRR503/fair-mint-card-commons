ALTER TABLE public.catches
  ADD COLUMN IF NOT EXISTS nonce text,
  ADD COLUMN IF NOT EXISTS deadline bigint,
  ADD COLUMN IF NOT EXISTS signature text,
  ADD COLUMN IF NOT EXISTS token_address text,
  ADD COLUMN IF NOT EXISTS amount_wei text,
  ADD COLUMN IF NOT EXISTS settled_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS catches_nonce_key ON public.catches (nonce) WHERE nonce IS NOT NULL;
CREATE INDEX IF NOT EXISTS catches_tx_hash_idx ON public.catches (tx_hash) WHERE tx_hash IS NOT NULL;