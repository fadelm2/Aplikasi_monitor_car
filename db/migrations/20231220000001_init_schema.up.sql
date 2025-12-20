-- 1. Table Users (Admin/Operator)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Akan diisi hash bcrypt
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table Drivers (Supir)
-- Dibuat sebelum table cars karena cars punya referensi ke sini
CREATE TABLE drivers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    license_number VARCHAR(50) UNIQUE, -- Nomor SIM
    status VARCHAR(20) DEFAULT 'OFF_DUTY', -- ACTIVE, OFF_DUTY
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table Cars (Mobil)
CREATE TABLE cars (
    id BIGSERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE, -- Plat Nomor (B 1234 CD)
    brand VARCHAR(50) NOT NULL, -- Toyota, Honda
    model VARCHAR(50) NOT NULL, -- Avanza, Brio
    year INT,
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, IN_USE, MAINTENANCE
    current_driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL, -- Siapa yang bawa sekarang
    last_lat DECIMAL(10, 8), -- Latitude GPS
    last_lng DECIMAL(11, 8), -- Longitude GPS
    last_update_loc TIMESTAMP, -- Waktu terakhir lokasi terupdate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table Trip Logs (Riwayat Perjalanan)
CREATE TABLE trip_logs (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    driver_id BIGINT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP, -- Nullable, diisi saat finish
    start_km INT,
    end_km INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table Maintenances (Riwayat Service)
CREATE TABLE maintenances (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    service_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL, -- Ganti Oli, Tune Up, dll
    cost DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Biaya
    workshop_name VARCHAR(100), -- Nama Bengkel
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk mempercepat pencarian (Optional tapi recommended)
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_trip_logs_car_id ON trip_logs(car_id);