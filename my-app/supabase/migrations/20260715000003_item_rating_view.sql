-- ============================================================
-- View: per-item rating aggregate.
-- Reviews attach to a rental_order (not directly to an item), so we
-- aggregate ratings through rental_order_item to get a rating per item.
-- The app reads this to show listing ratings / review counts.
-- ============================================================
CREATE VIEW item_rating AS
SELECT
    roi.item_id                         AS item_id,
    ROUND(AVG(r.rating)::numeric, 2)    AS avg_rating,
    COUNT(*)                            AS review_count
FROM review r
JOIN rental_order_item roi ON roi.rental_order_id = r.rental_order_id
GROUP BY roi.item_id;
