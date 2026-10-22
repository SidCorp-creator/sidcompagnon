-- Sid'home v43 (22 oct. 2026) : durées de conservation (RGPD, minimisation) et protection des copies de sauvegarde.
-- À exécuter par Sid dans Supabase → SQL Editor (le connecteur ne passe pas les instructions avec DELETE).
-- Rien n'est effacé dans les comptes : seules les vieilles copies et les journaux techniques sont purgés.

-- 1) Sauvegarde quotidienne : garde 14 jours de copies (comme annoncé dans la politique de confidentialité),
--    efface les rapports d'erreur de plus de 90 jours, le compteur de la mémoire des aliments et l'anti-doublon des notifications de plus de 30 jours.
create or replace function public.sidnote_daily_backup() returns void
language sql security definer set search_path = public as $$
  insert into public.user_data_backup (day, user_id, data, updated_at)
    select current_date, user_id, data, updated_at from public.user_data
  on conflict (day, user_id) do update set data = excluded.data, updated_at = excluded.updated_at;
  delete from public.user_data_backup where day < current_date - 14;
  delete from public.client_errors where at < now() - interval '90 days';
  delete from public.nutrition_usage where day < current_date - 30;
  delete from public.push_sent where sent_at < now() - interval '30 days';
$$;
revoke all on function public.sidnote_daily_backup() from public, anon, authenticated;

-- 2) Copies faites avant la v42 (schéma « sauvegarde ») : vérifié par Claude le 22 oct. 2026, rien n'a été perdu
--    (les seuls éléments absents viennent du compte test, remis à zéro à chaque connexion, ou d'une suppression volontaire).
--    La sécurité par ligne y est déjà activée. On supprime ces copies : elles contiennent les e-mails et les données de tout le monde.
drop schema if exists sauvegarde cascade;
