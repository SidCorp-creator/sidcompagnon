-- Sid'note v38 : clés du connecteur Claude (fonction Edge « mcp »).
-- On ne garde que l'empreinte SHA-256 de la clé : la clé elle-même n'est montrée qu'une fois, dans l'app.
create table if not exists public.mcp_tokens (
  hash text primary key check (length(hash) = 64),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  label text check (length(label) <= 40),
  created_at timestamptz not null default now(),
  last_used timestamptz
);
create index if not exists mcp_tokens_user_idx on public.mcp_tokens (user_id);
alter table public.mcp_tokens enable row level security;
drop policy if exists "voir ses clés claude" on public.mcp_tokens;
drop policy if exists "créer ses clés claude" on public.mcp_tokens;
drop policy if exists "retirer ses clés claude" on public.mcp_tokens;
create policy "voir ses clés claude" on public.mcp_tokens for select to authenticated using (user_id = (select auth.uid()));
create policy "créer ses clés claude" on public.mcp_tokens for insert to authenticated with check (user_id = (select auth.uid()));
create policy "retirer ses clés claude" on public.mcp_tokens for delete to authenticated using (user_id = (select auth.uid()));
