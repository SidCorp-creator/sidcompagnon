-- Sid'note v37 : à coller dans Supabase > SQL Editor > New query, puis Run (peut être relancé sans risque).
-- (Les tables client_errors et user_data_backup ont déjà été créées le 21 oct. 2026 ; ce script les crée aussi si besoin.)

-- 1) Erreurs envoyées par l'app : on peut les lire dans Table Editor > client_errors, l'app ne peut qu'en ajouter.
create table if not exists public.client_errors (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  version text, msg text, stack text, url text, ua text
);
alter table public.client_errors enable row level security;
drop policy if exists "envoyer ses erreurs" on public.client_errors;
create policy "envoyer ses erreurs" on public.client_errors for insert to authenticated
  with check (user_id = (select auth.uid()) and length(coalesce(msg,'')) <= 500 and length(coalesce(stack,'')) <= 2000);

-- 2) Copie de sécurité quotidienne des données de chaque compte, gardée 14 jours (invisible depuis l'app).
create table if not exists public.user_data_backup (
  day date not null, user_id uuid not null, data jsonb, updated_at timestamptz,
  primary key (day, user_id)
);
alter table public.user_data_backup enable row level security;

create or replace function public.sidnote_daily_backup() returns void
language sql security definer set search_path = public as $$
  insert into public.user_data_backup (day, user_id, data, updated_at)
    select current_date, user_id, data, updated_at from public.user_data
  on conflict (day, user_id) do update set data = excluded.data, updated_at = excluded.updated_at;
  delete from public.user_data_backup where day < current_date - 14;
  delete from public.client_errors where at < now() - interval '30 days';
$$;
revoke all on function public.sidnote_daily_backup() from public, anon, authenticated;

-- 3) Tous les jours à 2 h 17 (heure du serveur, UTC)
do $$ begin
  perform cron.unschedule(jobname) from cron.job where jobname = 'sidnote-backup';
end $$;
select cron.schedule('sidnote-backup', '17 2 * * *', $$ select public.sidnote_daily_backup() $$);

-- 4) Première copie tout de suite
select public.sidnote_daily_backup();

-- Pour récupérer les données d'un compte à une date (à faire avec Claude) :
--   select data from public.user_data_backup where user_id = '<id>' and day = '2026-10-21';

-- 5) Listes partagées entre proches (courses, choses à faire ensemble)
--    Une liste a un propriétaire, des membres, des éléments et un code d'invitation à 6 caractères.
--    Chacun ne voit que les listes dont il est membre (règles RLS).
create table if not exists public.shared_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 80),
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at timestamptz not null default now()
);
create table if not exists public.shared_members (
  list_id uuid not null references public.shared_lists on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text check (length(name) <= 40),
  joined_at timestamptz not null default now(),
  primary key (list_id, user_id)
);
create table if not exists public.shared_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shared_lists on delete cascade,
  text text not null check (length(text) between 1 and 200),
  done boolean not null default false,
  by_name text check (length(by_name) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shared_members_user_idx on public.shared_members (user_id);
create index if not exists shared_items_list_idx on public.shared_items (list_id);
alter table public.shared_lists enable row level security;
alter table public.shared_members enable row level security;
alter table public.shared_items enable row level security;

create or replace function public.is_list_member(l uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.shared_members where list_id = l and user_id = (select auth.uid()));
$$;

drop policy if exists "voir ses listes" on public.shared_lists;
drop policy if exists "renommer ou supprimer sa liste" on public.shared_lists;
drop policy if exists "supprimer sa liste" on public.shared_lists;
create policy "voir ses listes" on public.shared_lists for select to authenticated using (public.is_list_member(id));
create policy "renommer ou supprimer sa liste" on public.shared_lists for update to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
create policy "supprimer sa liste" on public.shared_lists for delete to authenticated using (owner = (select auth.uid()));

drop policy if exists "voir les membres" on public.shared_members;
drop policy if exists "quitter ou retirer" on public.shared_members;
create policy "voir les membres" on public.shared_members for select to authenticated using (public.is_list_member(list_id));
create policy "quitter ou retirer" on public.shared_members for delete to authenticated using (
  user_id = (select auth.uid()) or exists (select 1 from public.shared_lists l where l.id = list_id and l.owner = (select auth.uid())));

drop policy if exists "éléments des listes dont je suis membre" on public.shared_items;
create policy "éléments des listes dont je suis membre" on public.shared_items for all to authenticated
  using (public.is_list_member(list_id)) with check (public.is_list_member(list_id));

-- créer une liste (et en devenir membre) ; rejoindre une liste avec son code
create or replace function public.create_shared_list(p_name text, p_member_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare l uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  insert into public.shared_lists (name, owner) values (left(trim(p_name), 80), auth.uid()) returning id into l;
  insert into public.shared_members (list_id, user_id, name) values (l, auth.uid(), left(p_member_name, 40));
  return l;
end $$;
create or replace function public.join_shared_list(p_code text, p_member_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare l uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select id into l from public.shared_lists where code = upper(trim(p_code));
  if l is null then raise exception 'Code inconnu'; end if;
  insert into public.shared_members (list_id, user_id, name) values (l, auth.uid(), left(p_member_name, 40))
    on conflict (list_id, user_id) do nothing;
  return l;
end $$;
revoke all on function public.create_shared_list(text, text) from public, anon;
revoke all on function public.join_shared_list(text, text) from public, anon;
grant execute on function public.create_shared_list(text, text) to authenticated;
grant execute on function public.join_shared_list(text, text) to authenticated;
grant execute on function public.is_list_member(uuid) to authenticated;
