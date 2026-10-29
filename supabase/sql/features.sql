-- Sid'note v32 : fonctions réservées (Nutrition, Graphiques), décidées côté serveur.
-- Le marqueur est rangé dans app_metadata : la personne ne peut pas le modifier elle-même.
-- Ouvrir l'accès à un compte (remplacer l'adresse) :
--   update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"features":["nutri"]}'::jsonb where email = 'adresse@exemple.com';
-- Retirer l'accès :
--   update auth.users set raw_app_meta_data = raw_app_meta_data - 'features' where email = 'adresse@exemple.com';
-- Voir qui a l'accès :
select email from auth.users where raw_app_meta_data->'features' ? 'nutri';
