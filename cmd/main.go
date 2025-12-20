package main

import (
	"fmt"
	"log"

	"fleet-monitor/internal/config"
	"fleet-monitor/internal/delivery/http"
	"fleet-monitor/internal/delivery/http/middleware"
	"fleet-monitor/internal/helper"
	"fleet-monitor/internal/repository"
	"fleet-monitor/internal/usecase"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	db := config.ConnectDatabase(cfg)

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: helper.GlobalErrorHandler,
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	carRepo := repository.NewCarRepository(db)
	driverRepo := repository.NewDriverRepository(db)
	tripRepo := repository.NewTripRepository(db)
	maintenanceRepo := repository.NewMaintenanceRepository(db)

	// Initialize usecases
	authUsecase := usecase.NewAuthUsecase(userRepo, cfg)
	carUsecase := usecase.NewCarUsecase(carRepo)
	driverUsecase := usecase.NewDriverUsecase(driverRepo)
	tripUsecase := usecase.NewTripUsecase(tripRepo, carRepo, driverRepo)
	maintenanceUsecase := usecase.NewMaintenanceUsecase(maintenanceRepo, carRepo)
	dashboardUsecase := usecase.NewDashboardUsecase(carRepo, driverRepo, tripRepo)

	// Initialize handlers
	authHandler := http.NewAuthHandler(authUsecase)
	carHandler := http.NewCarHandler(carUsecase)
	driverHandler := http.NewDriverHandler(driverUsecase)
	tripHandler := http.NewTripHandler(tripUsecase)
	maintenanceHandler := http.NewMaintenanceHandler(maintenanceUsecase)
	dashboardHandler := http.NewDashboardHandler(dashboardUsecase)

	// JWT middleware
	jwtMiddleware := middleware.JWTMiddleware(cfg)

	// Routes
	api := app.Group("/api")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/login", authHandler.Login)
	auth.Post("/register", authHandler.Register)

	// Protected routes
	api.Use(jwtMiddleware)

	// Dashboard routes
	api.Get("/dashboard/summary", dashboardHandler.GetSummary)

	// Car routes
	cars := api.Group("/cars")
	cars.Get("/", carHandler.GetAll)
	cars.Get("/:id", carHandler.GetByID)
	cars.Post("/", carHandler.Create)
	cars.Put("/:id", carHandler.Update)
	cars.Delete("/:id", carHandler.Delete)
	cars.Put("/:id/location", carHandler.UpdateLocation)

	// Driver routes
	drivers := api.Group("/drivers")
	drivers.Get("/", driverHandler.GetAll)
	drivers.Get("/:id", driverHandler.GetByID)
	drivers.Post("/", driverHandler.Create)
	drivers.Put("/:id", driverHandler.Update)
	drivers.Delete("/:id", driverHandler.Delete)

	// Trip routes
	trips := api.Group("/trips")
	trips.Get("/", tripHandler.GetAll)
	trips.Get("/:id", tripHandler.GetByID)
	trips.Post("/checkout", tripHandler.Checkout)
	trips.Post("/checkin", tripHandler.Checkin)

	// Maintenance routes
	maintenances := api.Group("/maintenances")
	maintenances.Get("/", maintenanceHandler.GetAll)
	maintenances.Get("/:id", maintenanceHandler.GetByID)
	maintenances.Post("/", maintenanceHandler.Create)
	maintenances.Put("/:id", maintenanceHandler.Update)
	maintenances.Delete("/:id", maintenanceHandler.Delete)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Start server
	port := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(port))
}
