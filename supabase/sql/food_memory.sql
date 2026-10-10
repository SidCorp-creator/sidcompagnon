-- Sid'note v21 : mémoire des aliments (partagée entre tous les utilisateurs)
-- A coller dans Supabase > SQL Editor > New query, puis Run. Une seule fois.
-- La fonction « nutrition » y range chaque aliment calculé par Claude ; la fois suivante,
-- elle répond depuis cette mémoire sans appeler Claude (donc sans coût).
-- Aucune donnée personnelle : seulement le texte de l'aliment et ses valeurs nutritionnelles.

-- 1) réponses déjà données, à l'identique (ex. « 150 g de riz cuit »)
create table if not exists public.food_answers (
  key text primary key,            -- langue + texte normalisé, ex. "fr:150 g riz cuit"
  query text not null,             -- texte tel qu'il a été tapé la première fois
  result jsonb not null,           -- réponse complète (plat, emoji, aliments, note)
  hits int not null default 0,     -- nombre de fois servie depuis la mémoire
  created_at timestamptz not null default now()
);

-- 2) aliments de référence, pour 100 g (ex. « riz cuit », « oeuf »)
create table if not exists public.foods (
  key text primary key,            -- langue + nom normalisé, ex. "fr:riz cuit"
  name text not null,              -- nom affiché, ex. « Riz blanc cuit »
  emoji text not null default '',
  kcal100 numeric not null, p100 numeric not null, c100 numeric not null, f100 numeric not null,
  unit_g numeric,                  -- poids d'une unité si connu (1 oeuf = 50 g, 1 barre = 43 g)
  unit_label text,                 -- ex. « 1 barre »
  hits int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- personne ne lit ni n'écrit ces tables depuis l'app : seule la fonction serveur s'en sert
alter table public.food_answers enable row level security;
alter table public.foods enable row level security;

-- compteur d'utilisation (pour suivre ce que la mémoire fait économiser)
create or replace function public.food_hit(p_table text, p_key text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_table = 'answers' then update public.food_answers set hits = hits + 1 where key = p_key;
  elsif p_table = 'foods' then update public.foods set hits = hits + 1 where key = p_key;
  end if;
end $$;
revoke all on function public.food_hit(text, text) from public, anon, authenticated;
grant execute on function public.food_hit(text, text) to service_role;

-- pour voir l'état de la mémoire : select count(*), sum(hits) from public.foods;
