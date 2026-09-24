-- ==============================================================================
-- Migration: Create wallets table and link transactions to wallets (Multi-wallets)
-- ==============================================================================

-- 1. Criação da tabela de carteiras (wallets)
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Índices para carteiras
create index if not exists idx_wallets_user_id on public.wallets(user_id);

-- 3. Habilita Segurança por Nível de Linha (RLS) para carteiras
alter table public.wallets enable row level security;

-- 4. Políticas de RLS para carteiras
create policy "Users can view their own wallets"
  on public.wallets
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own wallets"
  on public.wallets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own wallets"
  on public.wallets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own wallets"
  on public.wallets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 5. Atualização da tabela de transações para vincular à carteira
alter table public.transactions 
  add column if not exists wallet_id uuid references public.wallets(id) on delete cascade;

-- 6. Índices para transações filtradas por carteira
create index if not exists idx_transactions_wallet_id on public.transactions(wallet_id);
create index if not exists idx_transactions_wallet_date on public.transactions(wallet_id, date desc);
