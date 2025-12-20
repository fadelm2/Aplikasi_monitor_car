-- 1. Insert 1 Akun Admin Default
INSERT INTO users (username, password, role)
VALUES
    ('admin_fadel', '$2a$10$X7.p...hash_bcrypt_contoh...', 'admin')
    ON CONFLICT DO NOTHING; -- Jaga-jaga kalau run ulang biar gak error duplicate

-- 2. Insert 100 Drivers Dummy
INSERT INTO drivers (name, phone_number, license_number, status)
SELECT
    'Supir ' || i,
    '0812' || (10000000 + i),
    'SIM-A-' || (5000 + i),
    CASE WHEN (i % 2) = 0 THEN 'ACTIVE' ELSE 'OFF_DUTY' END
FROM generate_series(1, 100) AS i;

-- 3. Insert 100 Cars Dummy
INSERT INTO cars (license_plate, brand, model, year, status, last_lat, last_lng, last_update_loc)
SELECT
    'B ' || (1000 + i) || ' TES',
    CASE (i % 4)
        WHEN 0 THEN 'Toyota' WHEN 1 THEN 'Honda'
        WHEN 2 THEN 'Daihatsu' ELSE 'Mitsubishi'
        END,
    CASE (i % 4)
        WHEN 0 THEN 'Avanza' WHEN 1 THEN 'Brio'
        WHEN 2 THEN 'Xenia' ELSE 'Pajero'
        END,
    2019 + (i % 5),
    'AVAILABLE',
    -6.200000 + (random() * 0.05),
    106.816666 + (random() * 0.05),
    NOW()
FROM generate_series(1, 100) AS i;

-- 4. Simulasi Status & Link Driver
-- Kita pastikan subquery benar-benar mengambil data
UPDATE cars
SET
    status = 'IN_USE',
    current_driver_id = (
        SELECT id FROM drivers
        WHERE status = 'ACTIVE'
        ORDER BY random()
    LIMIT 1
    )
WHERE id IN (SELECT id FROM cars ORDER BY random() LIMIT 30);

-- 5. Insert Trip Logs Dummy (FIXED HERE)
-- Tambahkan filter: AND current_driver_id IS NOT NULL
INSERT INTO trip_logs (car_id, driver_id, start_time, start_km, notes)
SELECT
    id,
    current_driver_id,
    NOW() - interval '2 hours',
    10000 + (floor(random() * 5000)::int),
    'Pengiriman Barang Dummy'
FROM cars
WHERE status = 'IN_USE' AND current_driver_id IS NOT NULL;

-- 6. Insert Maintenances Dummy
INSERT INTO maintenances (car_id, service_date, description, cost, workshop_name)
SELECT
    id,
    NOW() - interval '1 day',
    'Ganti Oli dan Tune Up Berkala',
    500000 + (floor(random() * 200000)::int),
    'Bengkel Fadel Jaya'
FROM cars
WHERE status = 'MAINTENANCE';