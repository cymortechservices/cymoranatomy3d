# Admin setup

Admin rights are never granted via sign-up. After creating your account normally:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

(run in the Supabase SQL editor). The `/admin` route then shows Content, Assets and Tables tabs. **Assets** lists built-in bundles and lets an admin upload a GLB with creator, source URL, licence, attribution and modification metadata into the `anatomical-models` bucket; uploaded rows appear in the viewer via `registerRemoteBundles`.

Upload flow caveat: it is implemented but has not been exercised against a live Supabase project.
