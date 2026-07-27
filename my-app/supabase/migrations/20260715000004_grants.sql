-- ============================================================
-- Read grants for the CHAOCHAO demo.
-- The ER schema never granted table privileges to the PostgREST roles,
-- so the anon key (used by the app's Supabase client) got "permission
-- denied". This is a public, read-only demo, so we grant SELECT on all
-- public tables + views to anon/authenticated. No RLS is enabled, so all
-- rows are readable — appropriate for demo data only.
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO anon, authenticated;
