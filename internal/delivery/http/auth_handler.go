package http

import (
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/usecase"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	authUsecase usecase.AuthUsecase
}

func NewAuthHandler(authUsecase usecase.AuthUsecase) *AuthHandler {
	return &AuthHandler{authUsecase: authUsecase}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req model.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	result, err := h.authUsecase.Login(req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse(
			"Login failed",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Login successful", result))
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req model.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	result, err := h.authUsecase.Register(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Registration failed",
			err.Error(),
		))
	}

	return c.Status(fiber.StatusCreated).JSON(model.SuccessResponse("User registered successfully", result))
}
