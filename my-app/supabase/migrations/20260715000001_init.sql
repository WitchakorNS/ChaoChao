-- ============================================================
-- CHAOCHAO — Database Schema (PostgreSQL / Supabase)
-- แปลงจาก ER Spec ต้นฉบับ พร้อมปรับสำหรับ PostgreSQL และลดความซับซ้อน
--
-- การปรับที่ทำจากเอกสารต้นฉบับ:
--   1. เรียงลำดับ CREATE TABLE ใหม่ตาม dependency จริง
--      (workflow tables ต้องมาก่อน user_account/item/rental_order)
--   2. WorkflowState ใช้ surrogate key (state_id) เดี่ยวๆ แทน composite PK
--      -> ตัด column state_workflow_id ออกจากทุกตารางที่อ้างอิง (ตามที่เอกสารแนะนำเอง)
--   3. AUTO_INCREMENT -> SERIAL, ENUM -> VARCHAR+CHECK, TINYINT -> SMALLINT,
--      DATETIME -> TIMESTAMP (ให้ตรงกับ PostgreSQL/Supabase)
--   4. เพิ่ม updated_at + trigger auto-update ให้ item, rental_order, payment
--   5. Index เฉพาะคอลัมน์ที่ยังไม่ถูกครอบคลุมโดย PK/UNIQUE ที่มีอยู่แล้ว
-- ============================================================

-- ============================================================
-- 1. role
-- ============================================================
CREATE TABLE role (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE CHECK (role_name IN ('Admin','User','Shop')),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. workflow_definition
-- ============================================================
CREATE TABLE workflow_definition (
    workflow_id     SERIAL PRIMARY KEY,
    workflow_name   VARCHAR(100) NOT NULL,
    target_entity   VARCHAR(20) NOT NULL CHECK (target_entity IN ('RentalOrder','Item','UserAccount')),
    version         INT NOT NULL DEFAULT 1,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. workflow_state  (simplified: surrogate PK ไม่ composite)
-- ============================================================
CREATE TABLE workflow_state (
    state_id        SERIAL PRIMARY KEY,
    workflow_id     INT NOT NULL REFERENCES workflow_definition(workflow_id) ON DELETE CASCADE,
    state_name      VARCHAR(50) NOT NULL,
    is_initial      BOOLEAN NOT NULL DEFAULT FALSE,
    is_final        BOOLEAN NOT NULL DEFAULT FALSE,
    display_order   INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_workflow_state_workflow_id ON workflow_state(workflow_id);

-- ============================================================
-- 4. workflow_transition
-- ============================================================
CREATE TABLE workflow_transition (
    transition_id       SERIAL PRIMARY KEY,
    workflow_id         INT NOT NULL REFERENCES workflow_definition(workflow_id) ON DELETE CASCADE,
    from_state_id       INT NOT NULL REFERENCES workflow_state(state_id) ON DELETE RESTRICT,
    to_state_id         INT NOT NULL REFERENCES workflow_state(state_id) ON DELETE RESTRICT,
    action_name         VARCHAR(50) NOT NULL,
    allowed_role_id     INT REFERENCES role(role_id) ON DELETE SET NULL,
    requires_condition  TEXT
);
CREATE INDEX idx_workflow_transition_workflow_id ON workflow_transition(workflow_id);

-- ============================================================
-- 5. user_account
-- ============================================================
CREATE TABLE user_account (
    user_id           SERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    current_state_id  INT REFERENCES workflow_state(state_id) ON DELETE RESTRICT,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_account_current_state_id ON user_account(current_state_id);

-- ============================================================
-- 6. user_role  (Associative M:N)
-- ============================================================
CREATE TABLE user_role (
    user_id      INT NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE,
    role_id      INT NOT NULL REFERENCES role(role_id) ON DELETE CASCADE,
    assigned_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by  INT REFERENCES user_account(user_id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_role_role_id ON user_role(role_id);

-- ============================================================
-- 7. item
-- ============================================================
CREATE TABLE item (
    item_id            SERIAL PRIMARY KEY,
    owner_id           INT NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    item_name          VARCHAR(150) NOT NULL,
    item_description   TEXT,
    price              DECIMAL(10,2) NOT NULL,
    deposit            DECIMAL(10,2) NOT NULL,
    current_state_id   INT NOT NULL REFERENCES workflow_state(state_id) ON DELETE RESTRICT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_item_owner_id ON item(owner_id);
CREATE INDEX idx_item_current_state_id ON item(current_state_id);

-- ============================================================
-- 8. item_location  (Weak, owner: item)
-- ============================================================
CREATE TABLE item_location (
    location_id     SERIAL,
    item_id         INT NOT NULL REFERENCES item(item_id) ON DELETE CASCADE,
    location_name   VARCHAR(200) NOT NULL,
    location_type   VARCHAR(20) NOT NULL CHECK (location_type IN ('pickup','return','pickup&return')),
    PRIMARY KEY (item_id, location_id)
);

-- ============================================================
-- 9. item_image  (Weak, owner: item)
-- ============================================================
CREATE TABLE item_image (
    image_id   SERIAL,
    item_id    INT NOT NULL REFERENCES item(item_id) ON DELETE CASCADE,
    image_url  VARCHAR(500) NOT NULL,
    PRIMARY KEY (item_id, image_id)
);

-- ============================================================
-- 10. availability  (Weak, owner: item)
-- ============================================================
CREATE TABLE availability (
    availability_id    SERIAL,
    item_id            INT NOT NULL REFERENCES item(item_id) ON DELETE CASCADE,
    availability_date  DATE NOT NULL,
    start_time         TIME NOT NULL,
    end_time           TIME NOT NULL,
    PRIMARY KEY (item_id, availability_id)
);

-- ============================================================
-- 11. rental_order
-- ============================================================
CREATE TABLE rental_order (
    rental_order_id   SERIAL PRIMARY KEY,
    renter_id         INT NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    current_state_id  INT NOT NULL REFERENCES workflow_state(state_id) ON DELETE RESTRICT,
    pickup_time       TIMESTAMP NOT NULL,
    return_time       TIMESTAMP NOT NULL,
    total_price       DECIMAL(10,2) NOT NULL,
    total_deposit     DECIMAL(10,2) NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_rental_order_renter_id ON rental_order(renter_id);
CREATE INDEX idx_rental_order_current_state_id ON rental_order(current_state_id);

-- ============================================================
-- 12. rental_order_item  (Associative M:N, price snapshot)
-- ============================================================
CREATE TABLE rental_order_item (
    rental_order_id   INT NOT NULL REFERENCES rental_order(rental_order_id) ON DELETE CASCADE,
    item_id           INT NOT NULL REFERENCES item(item_id) ON DELETE RESTRICT,
    quantity          INT NOT NULL DEFAULT 1,
    price_at_order    DECIMAL(10,2) NOT NULL,
    deposit_at_order  DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (rental_order_id, item_id)
);
CREATE INDEX idx_rental_order_item_item_id ON rental_order_item(item_id);

-- ============================================================
-- 13. rental_evidence  (Weak, owner: rental_order)
-- ============================================================
CREATE TABLE rental_evidence (
    evidence_id      SERIAL,
    rental_order_id  INT NOT NULL REFERENCES rental_order(rental_order_id) ON DELETE CASCADE,
    evidence_type    VARCHAR(20) NOT NULL CHECK (evidence_type IN ('before_pickup','after_return')),
    image_url        VARCHAR(500) NOT NULL,
    uploaded_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rental_order_id, evidence_id)
);

-- ============================================================
-- 14. payment  (Strong Entity, Unique FK บังคับ 1:1)
-- ============================================================
CREATE TABLE payment (
    payment_id        SERIAL PRIMARY KEY,
    rental_order_id   INT NOT NULL UNIQUE REFERENCES rental_order(rental_order_id) ON DELETE CASCADE,
    total_amount      DECIMAL(10,2) NOT NULL,
    status            VARCHAR(30) NOT NULL CHECK (status IN ('Pending','Paid','Failed','Refunded')),
    payment_date      TIMESTAMP,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 15. review
-- ============================================================
CREATE TABLE review (
    review_id        SERIAL PRIMARY KEY,
    user_id          INT NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE,
    rental_order_id  INT REFERENCES rental_order(rental_order_id) ON DELETE SET NULL,
    rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment          TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_review_user_id ON review(user_id);
CREATE INDEX idx_review_rental_order_id ON review(rental_order_id);

-- ============================================================
-- 16. review_image  (Weak, owner: review)
-- ============================================================
CREATE TABLE review_image (
    image_id     SERIAL,
    review_id    INT NOT NULL REFERENCES review(review_id) ON DELETE CASCADE,
    image_url    VARCHAR(500) NOT NULL,
    uploaded_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id, image_id)
);

-- ============================================================
-- Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_item_updated_at
    BEFORE UPDATE ON item
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rental_order_updated_at
    BEFORE UPDATE ON rental_order
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payment_updated_at
    BEFORE UPDATE ON payment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Seed data
-- ============================================================

INSERT INTO role (role_name) VALUES ('Admin'), ('User'), ('Shop');

-- RentalOrderFlow
INSERT INTO workflow_definition (workflow_name, target_entity)
VALUES ('RentalOrderFlow', 'RentalOrder');

INSERT INTO workflow_state (workflow_id, state_name, is_initial, is_final, display_order)
SELECT wd.workflow_id, s.state_name, s.is_initial, s.is_final, s.display_order
FROM workflow_definition wd
CROSS JOIN (VALUES
    ('Pending',   TRUE,  FALSE, 1),
    ('Confirmed', FALSE, FALSE, 2),
    ('PickedUp',  FALSE, FALSE, 3),
    ('Ongoing',   FALSE, FALSE, 4),
    ('Returned',  FALSE, FALSE, 5),
    ('Completed', FALSE, TRUE,  6),
    ('Cancelled', FALSE, TRUE,  7),
    ('Disputed',  FALSE, FALSE, 8)
) AS s(state_name, is_initial, is_final, display_order)
WHERE wd.workflow_name = 'RentalOrderFlow';

-- ItemFlow
INSERT INTO workflow_definition (workflow_name, target_entity)
VALUES ('ItemFlow', 'Item');

INSERT INTO workflow_state (workflow_id, state_name, is_initial, is_final, display_order)
SELECT wd.workflow_id, s.state_name, s.is_initial, s.is_final, s.display_order
FROM workflow_definition wd
CROSS JOIN (VALUES
    ('Draft',       TRUE,  FALSE, 1),
    ('Published',   FALSE, FALSE, 2),
    ('Rented',      FALSE, FALSE, 3),
    ('Unavailable', FALSE, FALSE, 4),
    ('Removed',     FALSE, TRUE,  5)
) AS s(state_name, is_initial, is_final, display_order)
WHERE wd.workflow_name = 'ItemFlow';

-- UserVerificationFlow
INSERT INTO workflow_definition (workflow_name, target_entity)
VALUES ('UserVerificationFlow', 'UserAccount');

INSERT INTO workflow_state (workflow_id, state_name, is_initial, is_final, display_order)
SELECT wd.workflow_id, s.state_name, s.is_initial, s.is_final, s.display_order
FROM workflow_definition wd
CROSS JOIN (VALUES
    ('NotVerified',   TRUE,  FALSE, 1),
    ('PendingReview', FALSE, FALSE, 2),
    ('Verified',      FALSE, TRUE,  3),
    ('Rejected',      FALSE, TRUE,  4)
) AS s(state_name, is_initial, is_final, display_order)
WHERE wd.workflow_name = 'UserVerificationFlow';
