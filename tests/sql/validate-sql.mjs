import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
const root = new URL('../../supabase/', import.meta.url).pathname
const db = new PGlite()
// Minimal stand-ins for what Supabase provides.
await db.exec(`
create schema auth; create schema storage;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create role anon; create role authenticated;
`)
for (const f of ['migrations/0001_schema.sql', 'migrations/0002_security.sql', 'seed.sql']) { await db.exec(readFileSync(root + f, 'utf8')); console.log('ok', f) }
const c = async (t) => (await db.query(`select count(*)::int n from public.${t}`)).rows[0].n
for (const t of ['systems','organs','structures','lessons','lesson_sections','questions','question_options','anatomical_models','model_structure_mappings','histology_images']) console.log(t, await c(t))
// RLS behaviour: create two users, one admin
await db.exec(`insert into auth.users(id,email) values ('00000000-0000-0000-0000-000000000001','a@x.io'),('00000000-0000-0000-0000-000000000002','b@x.io');
 update public.profiles set role='admin' where id='00000000-0000-0000-0000-000000000002';`)
console.log('profiles auto-created', await c('profiles'))
const as = async (uid, sql) => { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`); try { return await db.query(sql) } finally { await db.exec('reset role') } }
await db.exec(`grant all on all tables in schema public to authenticated;`)
await as('00000000-0000-0000-0000-000000000001', `insert into public.bookmarks(user_id,structure_id) values ('00000000-0000-0000-0000-000000000001','left-ventricle')`)
const other = await as('00000000-0000-0000-0000-000000000002', `select count(*)::int n from public.bookmarks`)
console.log('admin/other user sees user1 bookmarks (expect 0):', other.rows[0].n)
try { await as('00000000-0000-0000-0000-000000000001', `insert into public.bookmarks(user_id,structure_id) values ('00000000-0000-0000-0000-000000000002','x')`); console.log('FAIL: wrote other user row') } catch (e) { console.log('blocked cross-user insert: ok') }
const up = await as('00000000-0000-0000-0000-000000000001', `update public.structures set common_name='hacked' where id='left-ventricle' returning id`)
console.log('student content update rows (expect 0):', up.rows.length)
const up2 = await as('00000000-0000-0000-0000-000000000002', `update public.structures set common_name='Left ventricle' where id='left-ventricle' returning id`)
console.log('admin content update rows (expect 1):', up2.rows.length)
try { await as('00000000-0000-0000-0000-000000000001', `update public.profiles set role='admin' where id='00000000-0000-0000-0000-000000000001'`); const r = await db.query(`select role from public.profiles where id='00000000-0000-0000-0000-000000000001'`); console.log('self-promotion result role (expect student):', r.rows[0].role) } catch (e) { console.log('self-promotion blocked: ok') }
