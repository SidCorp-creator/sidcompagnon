-- Sid'note v32 : règles d'accès plus rapides (avertissements Supabase « Auth RLS Initialization Plan »).
-- Déjà exécuté le 20 oct. 2026. Peut être relancé sans risque.
-- (select auth.uid()) est calculé une seule fois par requête, au lieu d'une fois par ligne. Même sécurité.
alter policy "lire ses donnees" on public.user_data using ((select auth.uid()) = user_id);
alter policy "creer ses donnees" on public.user_data with check ((select auth.uid()) = user_id);
alter policy "modifier ses donnees" on public.user_data using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "voir ses appareils" on public.push_subscriptions using ((select auth.uid()) = user_id);
alter policy "ajouter ses appareils" on public.push_subscriptions with check ((select auth.uid()) = user_id);
alter policy "modifier ses appareils" on public.push_subscriptions using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "retirer ses appareils" on public.push_subscriptions using ((select auth.uid()) = user_id);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);
-- pg_net reste dans le schéma public : le déplacer bloque (le service des notifications l'utilise en continu).
-- Avertissement mineur, sans risque pour les données.

-- Photos des notes : le dossier privé « documents » accepte aussi les images JPEG (avant, elles passaient pour des PDF).
update storage.buckets set allowed_mime_types = array['application/pdf','image/jpeg'] where id = 'documents';
