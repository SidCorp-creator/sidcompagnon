-- Sid'note v20 : compteur d'appels à Claude pour l'onglet Nutrition
-- A coller dans Supabase > SQL Editor > New query, puis Run. Une seule fois.
-- Sert à limiter le nombre de demandes par personne et par jour (protège le crédit Claude).

create table if not exists public.nutrition_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  n int not null default 0,
  primary key (user_id, day)
);
-- personne ne lit ni n'écrit cette table depuis l'app : seule la fonction serveur s'en sert
alter table public.nutrition_usage enable row level security;

-- ajoute 1 au compteur du jour et renvoie le total
create or replace function public.nutrition_hit(p_user uuid, p_day date)
returns int language sql security definer set search_path = public as $$
  insert into public.nutrition_usage (user_id, day, n) values (p_user, p_day, 1)
  on conflict (user_id, day) do update set n = nutrition_usage.n + 1
  returning n;
$$;
revoke all on function public.nutrition_hit(uuid, date) from public, anon, authenticated;
grant execute on function public.nutrition_hit(uuid, date) to service_role;
