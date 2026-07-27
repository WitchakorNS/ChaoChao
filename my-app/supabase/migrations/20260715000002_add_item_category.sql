-- ============================================================
-- Additive migration: give `item` a category slug.
-- The original ER schema had no category concept, but the CHAOCHAO
-- UI (Home + Explore) filters listings by category. This adds a
-- lightweight slug column that maps to the presentational category
-- metadata in the app (`lib/categories.ts`).
-- ============================================================
ALTER TABLE item
    ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'camera'
    CHECK (category IN (
        'camera', 'event', 'audio', 'camping',
        'tools', 'sport', 'live', 'travel'
    ));

CREATE INDEX idx_item_category ON item(category);
