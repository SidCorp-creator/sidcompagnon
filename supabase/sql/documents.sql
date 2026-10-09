-- Sid'note v18 : stockage des documents (PDF)
-- A coller dans Supabase > SQL Editor > New query, puis Run. Une seule fois.

-- 1) le "tiroir" privé pour les PDF (50 Mo max par fichier)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

-- 2) chacun ne voit et ne touche que son propre dossier
create policy "docs: lire les siens" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs: ajouter les siens" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs: remplacer les siens" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs: supprimer les siens" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
