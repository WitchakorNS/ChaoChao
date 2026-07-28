-- ============================================================
-- CHAOCHAO demo seed data
-- Mirrors the app's original mock catalog so the DB-backed site
-- shows the same content. Run automatically by `supabase db reset`.
-- Workflow states + roles are already inserted by the init migration.
--
-- NOTE: state/role ids are resolved with inline subqueries (not helper
-- functions) because the seed runs as a single batch — a function created
-- earlier in the batch is not yet visible to later statements.
-- ============================================================

-- ============================================================
-- Users
-- ============================================================
INSERT INTO user_account (user_id, name, email, password_hash, current_state_id, created_at) VALUES
  (1, 'คุณผู้ใช้ (เดโม)', 'demo@chaochao.app',    '$2a$10$demoHashDemoHashDemoHa', (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='UserVerificationFlow' AND ws.state_name='Verified'),    '2024-01-10'),
  (2, 'สมชาย โฟโต้',       'somchai@chaochao.app', '$2a$10$demoHashDemoHashDemoHa', (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='UserVerificationFlow' AND ws.state_name='Verified'),    '2022-03-04'),
  (3, 'เอ๋ อีเวนต์เฮาส์',  'ae@chaochao.app',      '$2a$10$demoHashDemoHashDemoHa', (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='UserVerificationFlow' AND ws.state_name='Verified'),    '2021-06-20'),
  (4, 'นิว แคมป์โปร',      'new@chaochao.app',     '$2a$10$demoHashDemoHashDemoHa', (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='UserVerificationFlow' AND ws.state_name='Verified'),    '2023-02-15'),
  (5, 'มายด์',             'mind@chaochao.app',    '$2a$10$demoHashDemoHashDemoHa', (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='UserVerificationFlow' AND ws.state_name='Verified'),    '2024-05-01'),
  (6, 'โจ้ ครีเอเตอร์',    'joe@chaochao.app',     '$2a$10$demoHashDemoHashDemoHa', (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='UserVerificationFlow' AND ws.state_name='NotVerified'), '2025-01-08'),
  (7, 'แอดมิน CHAOCHAO',   'admin@chaochao.app',   '$2a$10$demoHashDemoHashDemoHa', (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='UserVerificationFlow' AND ws.state_name='Verified'),    '2021-01-01');
SELECT setval('user_account_user_id_seq', 7, true);

-- Single-role accounts so the UI's role-based navigation is unambiguous:
--   u_me = renter, somchai/ae/new = lender, mind/joe = renter, admin = admin.
INSERT INTO user_role (user_id, role_id) VALUES
  (1, (SELECT role_id FROM role WHERE role_name='User')),
  (2, (SELECT role_id FROM role WHERE role_name='Shop')),
  (3, (SELECT role_id FROM role WHERE role_name='Shop')),
  (4, (SELECT role_id FROM role WHERE role_name='Shop')),
  (5, (SELECT role_id FROM role WHERE role_name='User')),
  (6, (SELECT role_id FROM role WHERE role_name='User')),
  (7, (SELECT role_id FROM role WHERE role_name='Admin'));

-- ============================================================
-- Items
-- ============================================================
INSERT INTO item (item_id, owner_id, item_name, item_description, price, deposit, current_state_id, category, created_at) VALUES
  (1, 2, 'กล้อง Sony A7 III พร้อมเลนส์ 24-70mm', 'กล้อง Full-frame ยอดนิยมสำหรับงานถ่ายภาพและวิดีโอ พร้อมเลนส์ซูมมาตรฐาน คุณภาพเยี่ยม เหมาะทั้งงานอีเวนต์และงานสตูดิโอ มาพร้อมแบตเตอรี่ 2 ก้อนและการ์ด SD', 890, 15000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'camera', '2024-02-01'),
  (2, 2, 'ชุดไฟ Softbox สำหรับถ่ายวิดีโอ 2 ดวง', 'ชุดไฟต่อเนื่อง Softbox 2 ดวง ปรับความสว่างได้ พร้อมขาตั้ง เหมาะสำหรับถ่ายวิดีโอ สัมภาษณ์ และไลฟ์สด', 350, 3000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'camera', '2024-02-01'),
  (3, 3, 'ไมโครโฟนไร้สาย Rode Wireless GO II', 'ไมค์ไร้สายคุณภาพสูง 2 ตัวส่ง 1 ตัวรับ เสียงคมชัด เหมาะสำหรับไลฟ์สด สัมภาษณ์ และคอนเทนต์', 250, 2500, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'live', '2024-02-01'),
  (4, 3, 'โปรเจคเตอร์พกพา Full HD 3000 lumens', 'โปรเจคเตอร์ความสว่างสูง เหมาะสำหรับงานอีเวนต์ ประชุม หรือดูหนังกลางแจ้ง รองรับ HDMI และ USB', 450, 5000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Rented'), 'event', '2024-02-01'),
  (5, 4, 'เต็นท์แคมป์ปิ้ง 4 คน กันน้ำ', 'เต็นท์โดมสำหรับ 4 คน กันน้ำ กางง่าย น้ำหนักเบา พร้อมฟลายชีทและเสาครบชุด เหมาะสำหรับทริปแคมป์ปิ้ง', 300, 2000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'camping', '2024-02-01'),
  (6, 3, 'ลำโพง Bluetooth ขนาดใหญ่ 200W', 'ลำโพงพกพากำลังขับสูง เสียงดังกระหึ่ม เหมาะสำหรับงานปาร์ตี้ อีเวนต์ และกิจกรรมกลางแจ้ง แบตอึด 12 ชั่วโมง', 400, 4000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'audio', '2024-02-01'),
  (7, 2, 'Gimbal กันสั่นสำหรับมือถือ DJI OM 5', 'ไม้กันสั่นสำหรับสมาร์ตโฟน พับเก็บได้ พร้อมขาตั้งในตัว เหมาะสำหรับถ่ายวิดีโอและวล็อก', 180, 1500, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'live', '2024-02-01'),
  (8, 3, 'โต๊ะพับอเนกประสงค์สำหรับอีเวนต์ (ชุด 4 ตัว)', 'โต๊ะพับน้ำหนักเบา แข็งแรง เหมาะสำหรับออกบูธ งานเลี้ยง หรือกิจกรรมกลางแจ้ง ชุดละ 4 ตัว', 220, 1000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'event', '2024-02-01'),
  (9, 5, 'สว่านไร้สาย Makita พร้อมชุดดอกสว่าน', 'สว่านไฟฟ้าไร้สายกำลังสูง พร้อมแบต 2 ก้อนและชุดดอกสว่านครบชุด เหมาะสำหรับงานช่างทั่วไป', 200, 2500, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'tools', '2024-02-01'),
  (10, 4, 'จักรยานเสือภูเขา Trek ไซซ์ M', 'จักรยานเสือภูเขา 21 สปีด สภาพดี เหมาะสำหรับปั่นเที่ยวและออกกำลังกาย พร้อมหมวกกันน็อก', 260, 3500, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'sport', '2024-02-01'),
  (11, 2, 'ชุดไฟ LED Panel พร้อมขาตั้ง 2 ดวง', 'ไฟ LED Panel ปรับอุณหภูมิสีได้ พร้อมขาตั้งและอะแดปเตอร์ เหมาะสำหรับถ่ายภาพ วิดีโอ และไลฟ์สด', 320, 3000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Published'), 'camera', '2024-03-01'),
  (12, 2, 'ไมค์บูมพร้อมขาตั้งสำหรับบันทึกเสียง', 'ไมโครโฟนช็อตกันพร้อมบูมและขาตั้ง เหมาะสำหรับงานถ่ายทำและพอดแคสต์ ให้เสียงคมชัด', 240, 2000, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Rented'), 'live', '2024-03-01'),
  (13, 2, 'กระเป๋ากล้องกันกระแทกขนาดใหญ่', 'กระเป๋าเป้ใส่กล้องและเลนส์ กันกระแทกและกันน้ำ มีช่องแบ่งปรับได้ เหมาะสำหรับเดินทางถ่ายงาน', 120, 800, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='ItemFlow' AND ws.state_name='Removed'), 'travel', '2024-03-01');
SELECT setval('item_item_id_seq', 13, true);

INSERT INTO item_image (item_id, image_url) VALUES
  (1,'sony1'),(1,'sony2'),(1,'sony3'),
  (2,'softbox1'),(2,'softbox2'),
  (3,'mic1'),(3,'mic2'),
  (4,'proj1'),
  (5,'tent1'),(5,'tent2'),
  (6,'speaker1'),
  (7,'gimbal1'),
  (8,'table1'),
  (9,'drill1'),
  (10,'bike1'),
  (11,'led1'),(11,'led2'),
  (12,'boom1'),
  (13,'bag1');

INSERT INTO item_location (item_id, location_name, location_type) VALUES
  (1,'กรุงเทพฯ · ลาดพร้าว','pickup&return'),
  (2,'กรุงเทพฯ · ลาดพร้าว','pickup&return'),
  (3,'นนทบุรี','pickup&return'),
  (4,'นนทบุรี','pickup&return'),
  (5,'เชียงใหม่','pickup&return'),
  (6,'นนทบุรี','pickup&return'),
  (7,'กรุงเทพฯ · ลาดพร้าว','pickup&return'),
  (8,'นนทบุรี','pickup&return'),
  (9,'กรุงเทพฯ · บางนา','pickup&return'),
  (10,'เชียงใหม่','pickup&return'),
  (11,'กรุงเทพฯ · บางนา','pickup&return'),
  (12,'กรุงเทพฯ · บางนา','pickup&return'),
  (13,'กรุงเทพฯ · บางนา','pickup&return');

INSERT INTO availability (item_id, availability_date, start_time, end_time) VALUES
  (1,'2026-07-15','09:00','18:00'),
  (2,'2026-07-14','09:00','18:00'),
  (3,'2026-07-16','09:00','18:00'),
  (4,'2026-07-20','09:00','18:00'),
  (5,'2026-07-15','09:00','18:00'),
  (6,'2026-07-14','09:00','18:00'),
  (7,'2026-07-17','09:00','18:00'),
  (8,'2026-07-15','09:00','18:00'),
  (9,'2026-07-14','09:00','18:00'),
  (10,'2026-07-18','09:00','18:00'),
  (11,'2026-07-15','09:00','18:00'),
  (12,'2026-07-24','09:00','18:00'),
  (13,'2026-07-15','09:00','18:00');

-- ============================================================
-- Rental orders (+ items, payments)
-- ============================================================
INSERT INTO rental_order (rental_order_id, renter_id, current_state_id, pickup_time, return_time, total_price, total_deposit, created_at) VALUES
  (1, 1, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Confirmed'), '2026-07-16 10:00', '2026-07-19 10:00', 2670, 15000, '2026-07-12'),
  (2, 1, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Confirmed'), '2026-07-25 10:00', '2026-07-28 10:00', 900,  2000,  '2026-07-13'),
  (3, 1, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Ongoing'),   '2026-07-10 10:00', '2026-07-15 10:00', 2000, 4000,  '2026-07-05'),
  (4, 1, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Completed'), '2026-06-22 10:00', '2026-06-24 10:00', 500,  2500,  '2026-06-20'),
  (5, 5, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Pending'),   '2026-07-20 10:00', '2026-07-22 10:00', 640,  3000,  '2026-07-14'),
  (6, 6, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Pending'),   '2026-07-28 10:00', '2026-07-30 10:00', 480,  2000,  '2026-07-14'),
  (7, 6, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Disputed'),  '2026-06-02 10:00', '2026-06-05 10:00', 1350, 5000,  '2026-06-01'),
  (8,  5, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Completed'), '2026-06-25 10:00', '2026-06-28 10:00', 2670, 15000, '2026-06-24'),
  (9,  6, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Completed'), '2026-06-12 10:00', '2026-06-14 10:00', 1780, 15000, '2026-06-11'),
  (10, 5, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Completed'), '2026-05-27 10:00', '2026-05-30 10:00', 2670, 15000, '2026-05-26'),
  (11, 6, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Completed'), '2026-06-17 10:00', '2026-06-20 10:00', 900,  2000,  '2026-06-16'),
  (12, 5, (SELECT ws.state_id FROM workflow_state ws JOIN workflow_definition wd ON ws.workflow_id=wd.workflow_id WHERE wd.workflow_name='RentalOrderFlow' AND ws.state_name='Completed'), '2026-06-07 10:00', '2026-06-10 10:00', 500,  2500,  '2026-06-06');
SELECT setval('rental_order_rental_order_id_seq', 12, true);

INSERT INTO rental_order_item (rental_order_id, item_id, quantity, price_at_order, deposit_at_order) VALUES
  (1, 1, 1, 890, 15000),
  (2, 5, 1, 300, 2000),
  (3, 6, 1, 400, 4000),
  (4, 3, 1, 250, 2500),
  (5, 11, 1, 320, 3000),
  (6, 12, 1, 240, 2000),
  (7, 4, 1, 450, 5000),
  (8, 1, 1, 890, 15000),
  (9, 1, 1, 890, 15000),
  (10, 1, 1, 890, 15000),
  (11, 5, 1, 300, 2000),
  (12, 3, 1, 250, 2500);

INSERT INTO payment (rental_order_id, total_amount, status, payment_date) VALUES
  (1, 17804, 'Paid',    '2026-07-13'),
  (2, 2945,  'Pending', NULL),
  (3, 6100,  'Paid',    '2026-07-06'),
  (4, 3025,  'Paid',    '2026-06-20'),
  (5, 3672,  'Pending', NULL),
  (6, 2504,  'Pending', NULL),
  (7, 6418,  'Paid',    '2026-06-01'),
  (8, 17804, 'Paid',    '2026-06-25'),
  (9, 16869, 'Paid',    '2026-06-12'),
  (10, 17804,'Paid',    '2026-05-27'),
  (11, 2945, 'Paid',    '2026-06-17'),
  (12, 3025, 'Paid',    '2026-06-07');

-- ============================================================
-- Evidence
-- ============================================================
INSERT INTO rental_evidence (rental_order_id, evidence_type, image_url, uploaded_at) VALUES
  (3, 'before_pickup', 'ev_a', '2026-07-10 09:32'),
  (7, 'after_return',  'ev_b', '2026-06-05 18:10');

-- ============================================================
-- Reviews (+ images)
-- ============================================================
INSERT INTO review (review_id, user_id, rental_order_id, rating, comment, created_at) VALUES
  (1, 5, 8,  5, 'กล้องสภาพดีมาก เจ้าของใจดี อธิบายการใช้งานละเอียด ส่งมอบตรงเวลา ประทับใจมากครับ', '2026-06-28'),
  (2, 6, 9,  5, 'ภาพสวยมาก เลนส์คมชัด คุ้มค่าเช่า จะกลับมาเช่าอีกแน่นอน', '2026-06-15'),
  (3, 5, 10, 5, 'ใช้ถ่ายงานแต่งงาน ไฟล์สวยมาก แบตให้มา 2 ก้อนใช้ได้ทั้งวัน', '2026-05-30'),
  (4, 6, 11, 5, 'เต็นท์กางง่ายมาก กันน้ำได้จริง ฝนตกทั้งคืนไม่มีปัญหา แนะนำเลย', '2026-06-20'),
  (5, 5, 12, 5, 'เสียงคมชัดมาก ใช้ไลฟ์สดลื่นไหล ไม่มีสัญญาณขาด', '2026-06-10');
SELECT setval('review_review_id_seq', 5, true);

INSERT INTO review_image (review_id, image_url) VALUES
  (1, 'rev1');
