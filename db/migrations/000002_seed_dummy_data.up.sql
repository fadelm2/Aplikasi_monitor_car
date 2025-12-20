-- 1. Insert 1 Akun Admin Default
INSERT INTO users (username, password, role)
VALUES
    ('admin_fadel', '$2a$10$X7.p...hash_bcrypt_contoh...', 'admin');

-- 2. Insert 100 Drivers Dummy
-- Menggunakan generate_series untuk loop 1 sampai 100
INSERT INTO drivers (name, phone_number, license_number, status)
SELECT
    'Supir ' || i, -- Nama: Supir 1, Supir 2...
    '0812' || (10000000 + i),
    'SIM-A-' || (5000 + i),
    CASE WHEN (i % 2) = 0 THEN 'ACTIVE' ELSE 'OFF_DUTY' END
FROM generate_series(1, 100) AS i;

-- 3. Insert 100 Cars Dummy
-- Plat nomor diurutkan, Lokasi diacak di sekitar Jakarta (Lat -6.2, Lng 106.8)
INSERT INTO cars (license_plate, brand, model, year, status, last_lat, last_lng, last_update_loc)
SELECT
    'B ' || (1000 + i) || ' TES', -- Plat: B 1001 TES
    CASE (i % 4)
        WHEN 0 THEN 'Toyota'
        WHEN 1 THEN 'Honda'
        WHEN 2 THEN 'Daihatsu'
        ELSE 'Mitsubishi'
        END,
    CASE (i % 4)
        WHEN 0 THEN 'Avanza'
        WHEN 1 THEN 'Brio'
        WHEN 2 THEN 'Xenia'
        ELSE 'Pajero'
        END,
    2019 + (i % 5), -- Tahun antara 2019 - 2023
    'AVAILABLE', -- Default available dulu
    -6.200000 + (random() * 0.05), -- Random Latitude (Jakarta Area)
    106.816666 + (random() * 0.05), -- Random Longitude (Jakarta Area)
    NOW()
FROM generate_series(1, 100) AS i;

-- 4. Simulasi Status & Link Driver (Update Random Data)
-- Ubah 30 mobil menjadi IN_USE dan pasangkan dengan driver secara acak
UPDATE cars
SET
    status = 'IN_USE',
    current_driver_id = (SELECT id FROM drivers WHERE status = 'ACTIVE' ORDER BY random() LIMIT 1)
WHERE id IN (SELECT id FROM cars ORDER BY random() LIMIT 30);

-- Ubah 10 mobil menjadi MAINTENANCE
UPDATE cars
SET status = 'MAINTENANCE'
WHERE id IN (SELECT id FROM cars WHERE status = 'AVAILABLE' ORDER BY random() LIMIT 10);

-- 5. Insert Trip Logs Dummy (Untuk mobil yang sedang IN_USE)
INSERT INTO trip_logs (car_id, driver_id, start_time, start_km, notes)
SELECT
    id,
    current_driver_id,
    NOW() - interval '2 hours',
    10000 + (floor(random() * 5000)::int),
    'Pengiriman Barang Dummy'
FROM cars
WHERE status = 'IN_USE';

-- 6. Insert Maintenances Dummy (Untuk mobil yang sedang MAINTENANCE)
INSERT INTO maintenances (car_id, service_date, description, cost, workshop_name)
SELECT
    id,
    NOW() - interval '1 day',
    'Ganti Oli dan Tune Up Berkala',
    500000 + (floor(random() * 200000)::int),
    'Bengkel Fadel Jaya'
FROM cars
WHERE status = 'MAINTENANCE';