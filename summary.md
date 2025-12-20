# Project Master Plan: Corporate Fleet Monitoring System

## 1. Project Overview
**Name:** Corporate Fleet Monitor
**Description:** Aplikasi web monitoring operasional 100+ unit mobil perusahaan secara realtime, mencakup manajemen aset, tracking lokasi supir, jadwal service, dan pelaporan.
**Target Users:** Admin Operasional, Manajer Logistik.

---

## 2. Technology Stack & Libraries

### Backend (Golang)
* **Language:** Go 1.20+
* **Architecture:** Clean Architecture (Layered Strategy)
* **Web Framework:** [GoFiber](https://github.com/gofiber/fiber) (v2/v3)
* **ORM:** [GORM](https://github.com/go-gorm/gorm) (Driver: MySQL/PostgreSQL)
* **Configuration:** [Viper](https://github.com/spf13/viper) (Read .env / config.json)
* **Validation:** [Go Playground Validator](https://github.com/go-playground/validator)
* **Logging:** [Logrus](https://github.com/sirupsen/logrus)
* **Auth:** [Golang JWT](https://github.com/golang-jwt/jwt)
* **Migration:** [Golang Migrate](https://github.com/golang-migrate/migrate)

### Frontend (React JS)
* **Core:** React (Vite Build Tool)
* **Language:** JavaScript / TypeScript (Recommended)
* **Styling:** Tailwind CSS + ShadcnUI / HeadlessUI
* **State Management:** Zustand (Simpler) or Redux Toolkit
* **HTTP Client:** Axios
* **Maps (FREE):** [React Leaflet](https://react-leaflet.js.org/) + OpenStreetMap Tiles
* **Icons:** Lucide React
* **Charts:** Recharts (untuk Laporan/Statistik)

---

## 3. Backend Specification

### A. Folder Structure (Layered Clean Architecture)
*Structure reflects the provided VS Code screenshot.*

```text
/
├── api/                # OpenAPI/Swagger docs
├── cmd/
│   └── main.go         # App Entry Point (Dep Injection & Server Start)
├── db/
│   └── migrations/     # SQL Migration files (.sql)
├── internal/
│   ├── config/         # Load Viper, DB Conn, Logger setup, Fiber Config
│   ├── delivery/       # Delivery Layer (Presenters)
│   │   └── http/       # Fiber Handlers (Parse Req -> Call Usecase -> JSON Resp)
│   │       ├── auth_handler.go
│   │       ├── car_handler.go
│   │       └── ...
│   ├── entity/         # Domain Entities (GORM Models / DB Representation)
│   │   ├── user.go
│   │   ├── car.go
│   │   └── ...
│   ├── helper/         # Global Utilities (Tx Manager, WebResponse, ErrorHandler)
│   ├── model/          # DTOs (Data Transfer Objects for JSON Req/Res)
│   │   ├── web_response.go
│   │   ├── car_model.go
│   │   └── ...
│   ├── repository/     # Data Access Layer (Query Logic)
│   │   ├── car_repository.go
│   │   └── ...
│   └── usecase/        # Business Logic Layer (Validation & Rules)
│       ├── car_usecase.go
│       └── ...
├── test/               # Unit & Integration Tests
├── .env.example
├── Dockerfile
├── Makefile
├── go.mod
└── go.sum




B. Database Schema (Design)
1. users (Admin)

id (PK), username, password (hashed), role, created_at.

2. cars (Master Mobil)

id (PK)

license_plate (Unique, e.g., B 1234 CD)

brand (e.g., Toyota)

model (e.g., Avanza)

year (Int)

status (Enum: AVAILABLE, IN_USE, MAINTENANCE)

current_driver_id (FK -> drivers.id, Nullable)

last_lat (Decimal/Float)

last_lng (Decimal/Float)

last_update_loc (Timestamp)

3. drivers (Master Supir)

id (PK)

name

phone_number

license_number (No SIM)

status (Enum: ACTIVE, OFF_DUTY)

4. trip_logs (Riwayat Perjalanan)

id (PK)

car_id (FK), driver_id (FK)

start_time, end_time (Nullable)

start_km, end_km

notes

5. maintenances (Riwayat Service)

id (PK)

car_id (FK)

service_date

description (e.g., Ganti Oli, Tune up)

cost (Decimal)

workshop_name (Nama Bengkel)

C. Key API Endpoints
Auth: POST /users/login

Cars: CRUD POST/GET/PUT/DELETE /cars, PUT /cars/:id/location (Update GPS).

Drivers: CRUD POST/GET/PUT/DELETE /drivers.

Transactions:

POST /trip/checkout (Supir ambil mobil -> Update status IN_USE).

POST /trip/checkin (Supir balikin mobil -> Update status AVAILABLE).

Maintenance: POST /maintenance (Catat service baru).

Dashboard: GET /dashboard/summary (Stats).

4. Frontend Specification (React)
A. Navigation / Sidebar Menus
Dashboard (Overview)

Cards: Total Armada, Mobil Ready, Sedang Jalan, Dalam Perbaikan.

Mini List: 5 Aktivitas Terakhir (Siapa baru ambil mobil).

Alert: Notifikasi mobil yang pajaknya/servisnya jatuh tempo.

Live Monitoring (Map)

Lib: React Leaflet.

View: Peta fullscreen dengan Marker mobil.

Logic: Fetch data /cars setiap 30-60 detik. Marker warna hijau (Ready), Merah (Jalan), Kuning (Bengkel).

Manajemen Armada (Cars)

Table List Mobil (Search, Filter by Status).

Modal Add/Edit Mobil.

Detail Page: Lihat riwayat trip & service spesifik mobil tersebut.

Manajemen Supir (Drivers)

Table List Supir.

Status indikator (Siapa yang sedang menyetir sekarang).

Operasional (Trip)

Form "Serah Terima Kunci" (Checkout).

Form "Pengembalian Mobil" (Checkin) + Input KM Akhir.

Bengkel (Maintenance)

Jadwal Service rutin.

Input history perbaikan & biaya.

Laporan (Reports)

Laporan Penggunaan Bulanan (Export Excel/PDF).

Laporan Biaya Service.