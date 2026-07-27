-- ============================================================
-- Write support for the CHAOCHAO demo.
--
-- 1) The UI offers four evidence types (before/after pickup and
--    before/after return) but the original CHECK only allowed two.
--    Widen it so uploads from the app are storable.
-- 2) All mutations go through a server-side service-role client
--    (lib/supabase/admin.ts), so grant that role full DML plus the
--    sequence access SERIAL inserts need.
-- ============================================================

ALTER TABLE rental_evidence
    DROP CONSTRAINT IF EXISTS rental_evidence_evidence_type_check;

ALTER TABLE rental_evidence
    ADD CONSTRAINT rental_evidence_evidence_type_check
    CHECK (evidence_type IN (
        'before_pickup', 'after_pickup', 'before_return', 'after_return'
    ));

GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO service_role;
