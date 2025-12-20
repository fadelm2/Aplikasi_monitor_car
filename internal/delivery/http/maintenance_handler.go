package http

import (
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/usecase"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type MaintenanceHandler struct {
	maintenanceUsecase usecase.MaintenanceUsecase
}

func NewMaintenanceHandler(maintenanceUsecase usecase.MaintenanceUsecase) *MaintenanceHandler {
	return &MaintenanceHandler{maintenanceUsecase: maintenanceUsecase}
}

func (h *MaintenanceHandler) GetAll(c *fiber.Ctx) error {
	params := model.MaintenanceListParams{
		Page:  c.QueryInt("page", 1),
		Limit: c.QueryInt("limit", 10),
		CarID: int64(c.QueryInt("car_id", 0)),
	}

	maintenances, total, err := h.maintenanceUsecase.GetAll(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse(
			"Failed to get maintenances",
			err.Error(),
		))
	}

	totalPages := int(total) / params.Limit
	if int(total)%params.Limit > 0 {
		totalPages++
	}

	return c.JSON(model.PaginationResponse{
		Success:    true,
		Data:       maintenances,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalItems: total,
		TotalPages: totalPages,
	})
}

func (h *MaintenanceHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	maintenance, err := h.maintenanceUsecase.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(model.ErrorResponse(
			"Maintenance not found",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Maintenance found", maintenance))
}

func (h *MaintenanceHandler) Create(c *fiber.Ctx) error {
	var req model.MaintenanceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	maintenance, err := h.maintenanceUsecase.Create(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to create maintenance",
			err.Error(),
		))
	}

	return c.Status(fiber.StatusCreated).JSON(model.SuccessResponse("Maintenance created successfully", maintenance))
}

func (h *MaintenanceHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	var req model.MaintenanceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	maintenance, err := h.maintenanceUsecase.Update(id, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to update maintenance",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Maintenance updated successfully", maintenance))
}

func (h *MaintenanceHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	if err := h.maintenanceUsecase.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to delete maintenance",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Maintenance deleted successfully", nil))
}
