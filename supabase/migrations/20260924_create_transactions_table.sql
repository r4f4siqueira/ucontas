-- ==============================================================================
-- Migration: Create transactions table with Row Level Security (RLS) and Indexes
-- ==============================================================================

-- 1. Criação da tabela de transações
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Índices para performance de consulta
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);

-- 3. Habilita Segurança por Nível de Linha (RLS)
alter table public.transactions enable row level security;

-- 4. Políticas de RLS otimizadas com (select auth.uid())
create policy "Users can view their own transactions"
  on public.transactions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own transactions"
  on public.transactions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own transactions"
  on public.transactions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own transactions"
  on public.transactions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
