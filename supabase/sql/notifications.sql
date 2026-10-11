-- Sid'note v22 : notifications du planning
-- A coller dans Supabase > SQL Editor > New query, puis Run. Une seule fois (peut être relancé sans risque).
-- Aucun secret à recopier : le secret du cron est créé ici, au hasard, et rangé dans le coffre Supabase (Vault).

-- 1) Appareils abonnés aux notifications (déjà créée si l'ancien script a été lancé)
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "voir ses appareils" on public.push_subscriptions;
drop policy if exists "ajouter ses appareils" on public.push_subscriptions;
drop policy if exists "modifier ses appareils" on public.push_subscriptions;
drop policy if exists "retirer ses appareils" on public.push_subscriptions;
create policy "voir ses appareils" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "ajouter ses appareils" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "modifier ses appareils" on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "retirer ses appareils" on public.push_subscriptions for delete using (auth.uid() = user_id);

-- 2) Rappels déjà envoyés (pour ne jamais envoyer deux fois le même)
create table if not exists public.push_sent (
  key text primary key,
  sent_at timestamptz not null default now()
);
alter table public.push_sent enable row level security; -- seule la fonction serveur s'en sert

-- 3) Secret du cron, tiré au hasard et gardé dans le coffre Supabase
do $$ begin
  if not exists (select 1 from vault.secrets where name = 'sidnote_cron') then
    perform vault.create_secret(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'sidnote_cron');
  end if;
end $$;
create or replace function public.sidnote_cron_secret()
returns text language sql security definer set search_path = public as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'sidnote_cron' limit 1;
$$;
revoke all on function public.sidnote_cron_secret() from public, anon, authenticated;
grant execute on function public.sidnote_cron_secret() to service_role;

-- 4) Passage automatique toutes les 5 minutes
create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$ begin
  perform cron.unschedule(jobname) from cron.job where jobname in ('sidnote-rappels', 'sidnote-notifications');
end $$;
select cron.schedule(
  'sidnote-notifications',
  '*/5 * * * *',
  $$ select net.http_post(
       url := 'https://eloeoaidgbkygazwjwiu.supabase.co/functions/v1/rappels',
       headers := jsonb_build_object('Content-Type', 'application/json',
                  'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'sidnote_cron' limit 1)),
       body := '{}'::jsonb
     ) $$
);

-- pour vérifier : select * from cron.job_run_details order by start_time desc limit 5;
