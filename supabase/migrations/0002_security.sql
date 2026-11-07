-- Row Level Security. Public: read teaching content. Users: only their own rows. Admins: write content.
do $$ declare t text; begin
  foreach t in array array['profiles','systems','regions','organs','structures','anatomy_content','anatomical_models','model_structure_mappings','animations','lessons','lesson_sections','histology_images','quizzes','questions','question_options','quiz_attempts','bookmarks','study_progress','tutor_conversations','tutor_messages'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
  -- content: anyone may read, only admins may write
  foreach t in array array['systems','regions','organs','structures','anatomy_content','model_structure_mappings','animations','lessons','lesson_sections','histology_images','quizzes','questions','question_options'] loop
    execute format('create policy "%1$s read" on public.%1$I for select using (true)', t);
    execute format('create policy "%1$s admin write" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- models: anyone reads everything except rejected ones; admins manage all
create policy "models read" on public.anatomical_models for select using (verification_status <> 'rejected' or public.is_admin());
create policy "models admin write" on public.anatomical_models for all using (public.is_admin()) with check (public.is_admin());

-- profiles: read/update own row; role can never be changed by the owner
create policy "profile read own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profile update own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profile admin write" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- own-row tables
do $$ declare t text; begin
  foreach t in array array['quiz_attempts','bookmarks','study_progress','tutor_conversations','tutor_messages'] loop
    execute format('create policy "%1$s own" on public.%1$I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop; end $$;
-- a message may only be added to a conversation the user owns
create policy "messages in own conversation" on public.tutor_messages as restrictive for insert
  with check (exists (select 1 from public.tutor_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- Storage bucket for uploaded model bundles: public read, admin-only write.
insert into storage.buckets (id, name, public) values ('anatomical-models', 'anatomical-models', true) on conflict (id) do nothing;
create policy "models bucket read" on storage.objects for select using (bucket_id = 'anatomical-models');
create policy "models bucket admin insert" on storage.objects for insert with check (bucket_id = 'anatomical-models' and public.is_admin());
create policy "models bucket admin update" on storage.objects for update using (bucket_id = 'anatomical-models' and public.is_admin());
create policy "models bucket admin delete" on storage.objects for delete using (bucket_id = 'anatomical-models' and public.is_admin());

revoke all on public.profiles from anon;
grant select on public.systems, public.regions, public.organs, public.structures, public.anatomy_content, public.anatomical_models,
  public.model_structure_mappings, public.animations, public.lessons, public.lesson_sections, public.histology_images,
  public.quizzes, public.questions, public.question_options to anon;
