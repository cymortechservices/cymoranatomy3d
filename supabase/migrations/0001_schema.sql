-- CYMOR ANATOMY 3D: schema. Run in order: 0001 (schema), 0002 (security), then supabase/seed.sql.

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- profiles (one per auth user)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner' check (char_length(display_name) between 1 and 60),
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- Every new auth user gets a student profile. Admin is NEVER granted by sign-up: see docs/ADMIN_SETUP.md.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1), 'Learner'), 60))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- ---------------------------------------------------------------- anatomy content
create table public.systems (
  id text primary key, name text not null, summary text, introduction text,
  status text not null default 'introductory' check (status in ('demonstration','introductory')),
  major_organs text[] default '{}', major_structures text[] default '{}', functions text[] default '{}',
  structural_adaptations text[] default '{}', physiological_relationships text[] default '{}', related_systems text[] default '{}',
  learning_objectives text[] default '{}', revision_questions jsonb default '[]', "references" jsonb default '[]',
  bundle_ids text[] default '{}', sort_order int default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.regions (
  id text primary key, name text not null, description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organs (
  id text primary key, name text not null, description text,
  system_id text references public.systems(id) on update cascade on delete set null,
  region_id text references public.regions(id) on update cascade on delete set null,
  structure_ids text[] default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.structures (
  id text primary key, anatomical_name text not null, common_name text, synonyms text[] default '{}',
  system_id text references public.systems(id) on update cascade on delete set null,
  region_id text references public.regions(id) on update cascade on delete set null,
  organ_id text references public.organs(id) on update cascade on delete set null,
  classification text, anatomical_position text, location text,
  external_characteristics text[], internal_characteristics text[], structural_adaptations text[], functions text[] default '{}',
  blood_supply text, nerve_supply text, lymphatic_drainage text, anatomical_relations text[], articulations text[], attachments text[],
  clinical_relevance text[], related_structures text[] default '{}', illustration_reference text, "references" jsonb default '[]',
  difficulty_level text check (difficulty_level in ('beginner','intermediate','advanced')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index structures_system_idx on public.structures(system_id);
create index structures_organ_idx on public.structures(organ_id);
create index structures_region_idx on public.structures(region_id);
create index structures_name_idx on public.structures using gin (to_tsvector('simple', anatomical_name || ' ' || coalesce(common_name,'')));
create index organs_system_idx on public.organs(system_id);

create table public.anatomy_content (
  id uuid primary key default gen_random_uuid(),
  structure_id text not null references public.structures(id) on delete cascade,
  heading text not null, body text not null, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index anatomy_content_structure_idx on public.anatomy_content(structure_id, sort_order);

-- ---------------------------------------------------------------- 3D models
-- One row per model bundle (a GLB plus a mesh manifest). Built-in bundles are registered with file_url null: the app
-- ships them. Uploaded bundles carry storage URLs and appear in the laboratory.
create table public.anatomical_models (
  id text primary key check (id ~ '^[a-z0-9-]{3,40}$'),
  name text not null, synonyms text[] default '{}',
  system_id text, region_id text, organ_id text, classification text,
  file_url text, manifest_url text, file_format text default 'glb' check (file_format in ('glb','gltf')),
  origin text not null default 'uploaded' check (origin in ('builtin','uploaded')),
  creator text not null, source text, source_url text not null,
  licence_name text not null, licence_url text not null, attribution text not null,
  modified boolean not null default false, modification_notes text,
  mesh_count int, tris_out bigint, bbox jsonb, mesh_ids jsonb, selectable_structures jsonb,
  view_modes text[] default '{orbit,isolate,hide,xray}', size_bytes bigint, sha256 text, preview_url text,
  verification_status text not null default 'unverified' check (verification_status in ('verified','unverified','failed','rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index anatomical_models_system_idx on public.anatomical_models(system_id);
create trigger anatomical_models_updated before update on public.anatomical_models for each row execute function public.set_updated_at();

create table public.model_structure_mappings (
  model_id text not null references public.anatomical_models(id) on delete cascade,
  mesh_id text not null,
  structure_id text not null references public.structures(id) on delete cascade,
  primary key (model_id, mesh_id, structure_id)
);
create index model_structure_mappings_structure_idx on public.model_structure_mappings(structure_id);

create table public.animations (
  id text primary key, title text not null, system_id text references public.systems(id) on delete set null,
  summary text, duration_s numeric, kind text, steps jsonb default '[]', structure_ids text[] default '{}', simplifications text[] default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- learning content
create table public.lessons (
  id text primary key, title text not null, subject text not null check (subject in ('anatomy','physiology','histology','embryology')),
  system_id text references public.systems(id) on delete set null, region_id text, organ_id text,
  difficulty text check (difficulty in ('beginner','intermediate','advanced')), summary text,
  learning_objectives text[] default '{}', related_structure_ids text[] default '{}', exercises jsonb default '[]',
  bundle_id text, "references" jsonb default '[]',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id text not null references public.lessons(id) on delete cascade,
  sort_order int not null, heading text not null, body text[] not null default '{}', kind text default 'text',
  unique (lesson_id, sort_order)
);
create table public.histology_images (
  id text primary key, name text not null, classification text, data jsonb not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quizzes (
  id text primary key, title text not null, topic text not null, created_at timestamptz not null default now()
);
create table public.questions (
  id text primary key, quiz_id text references public.quizzes(id) on delete cascade,
  type text not null check (type in ('mcq','tf','match','identify','label','fill')),
  topic text not null, difficulty text not null, prompt text not null, explanation text,
  correct text, structure_id text references public.structures(id) on delete set null,
  payload jsonb not null default '{}',   -- accepted answers, match pairs, label pins, diagram info
  created_at timestamptz not null default now()
);
create index questions_topic_idx on public.questions(topic, difficulty);
create table public.question_options (
  question_id text not null references public.questions(id) on delete cascade,
  option_id text not null, text text not null, sort_order int not null default 0,
  primary key (question_id, option_id)
);

-- ---------------------------------------------------------------- user data (own rows only, enforced in 0002)
create table public.quiz_attempts (
  id text primary key, user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null, difficulty text not null, mode text not null check (mode in ('timed','untimed')),
  total int not null check (total > 0), correct int not null check (correct >= 0), percent int not null check (percent between 0 and 100),
  incorrect_question_ids text[] default '{}', taken_at timestamptz not null default now(),
  check (correct <= total)
);
create index quiz_attempts_user_idx on public.quiz_attempts(user_id, taken_at desc);
create table public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  structure_id text not null, created_at timestamptz not null default now(),
  primary key (user_id, structure_id)
);
create table public.study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null, completed boolean not null default true, updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create table public.tutor_conversations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation', updated_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index tutor_conversations_user_idx on public.tutor_conversations(user_id, updated_at desc);
create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')), content text not null check (char_length(content) <= 8000),
  created_at timestamptz not null default now()
);
create index tutor_messages_conv_idx on public.tutor_messages(conversation_id, created_at);

-- updated_at triggers for content tables
do $$ declare t text; begin
  foreach t in array array['systems','regions','organs','structures','anatomy_content','animations','lessons','histology_images'] loop
    execute format('create trigger %I_updated before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop; end $$;
