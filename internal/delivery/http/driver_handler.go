package http

import (
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/usecase"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type DriverHandler struct {
	driverUsecase usecase.DriverUsecase
}

func NewDriverHandler(driverUsecase usecase.DriverUsecase) *DriverHandler {
	return &DriverHandler{driverUsecase: driverUsecase}
}

func (h *DriverHandler) GetAll(c *fiber.Ctx) error {
	params := model.DriverListParams{
		Page:   c.QueryInt("page", 1),
		Limit:  c.QueryInt("limit", 10),
		Status: c.Query("status"),
		Search: c.Query("search"),
	}

	drivers, total, err := h.driverUsecase.GetAll(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse(
			"Failed to get drivers",
			err.Error(),
		))
	}

	totalPages := int(total) / params.Limit
	if int(total)%params.Limit > 0 {
		totalPages++
	}

	return c.JSON(model.PaginationResponse{
		Success:    true,
		Data:       drivers,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalItems: total,
		TotalPages: totalPages,
	})
}

func (h *DriverHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	driver, err := h.driverUsecase.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(model.ErrorResponse(
			"Driver not found",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Driver found", driver))
}

func (h *DriverHandler) Create(c *fiber.Ctx) error {
	var req model.DriverRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	driver, err := h.driverUsecase.Create(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to create driver",
			err.Error(),
		))
	}

	return c.Status(fiber.StatusCreated).JSON(model.SuccessResponse("Driver created successfully", driver))
}

func (h *DriverHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	var req model.DriverRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	driver, err := h.driverUsecase.Update(id, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to update driver",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Driver updated successfully", driver))
}

func (h *DriverHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	if err := h.driverUsecase.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to delete driver",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Driver deleted successfully", nil))
}
