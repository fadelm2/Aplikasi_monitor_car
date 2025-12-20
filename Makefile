.PHONY: run build migrate-up migrate-down seed

# Run the application
run:
	go run cmd/main.go

# Build the application
build:
	go build -o bin/fleet-monitor cmd/main.go

# Run database migrations up
migrate-up:
	migrate -path db/migrations -database "postgres://postgres:postgres@localhost:5480/fleet_monitor?sslmode=disable" up

# Run database migrations down
migrate-down:
	migrate -path db/migrations -database "postgres://postgres:postgres@localhost:5432/fleet_monitor?sslmode=disable" down

# Install dependencies
deps:
	go mod download
	go mod tidy

# Create initial admin user
seed:
	@echo "Run: curl -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\",\"role\":\"admin\"}'"


# Create new migration file
# Cara pakai: make migrate-create name=nama_file_migrasi
migrate-create:
	@echo "Creating migration files for: $(name)"
	migrate create -ext sql -dir $(MIGRATE_PATH) -seq $(name)