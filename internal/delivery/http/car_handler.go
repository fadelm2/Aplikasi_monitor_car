package http

import (
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/usecase"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type CarHandler struct {
	carUsecase usecase.CarUsecase
}

func NewCarHandler(carUsecase usecase.CarUsecase) *CarHandler {
	return &CarHandler{carUsecase: carUsecase}
}

func (h *CarHandler) GetAll(c *fiber.Ctx) error {
	params := model.CarListParams{
		Page:   c.QueryInt("page", 1),
		Limit:  c.QueryInt("limit", 10),
		Status: c.Query("status"),
		Search: c.Query("search"),
	}

	cars, total, err := h.carUsecase.GetAll(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse(
			"Failed to get cars",
			err.Error(),
		))
	}

	totalPages := int(total) / params.Limit
	if int(total)%params.Limit > 0 {
		totalPages++
	}

	return c.JSON(model.PaginationResponse{
		Success:    true,
		Data:       cars,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalItems: total,
		TotalPages: totalPages,
	})
}

func (h *CarHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	car, err := h.carUsecase.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(model.ErrorResponse(
			"Car not found",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Car found", car))
}

func (h *CarHandler) Create(c *fiber.Ctx) error {
	var req model.CarRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	car, err := h.carUsecase.Create(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to create car",
			err.Error(),
		))
	}

	return c.Status(fiber.StatusCreated).JSON(model.SuccessResponse("Car created successfully", car))
}

func (h *CarHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	var req model.CarRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	car, err := h.carUsecase.Update(id, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to update car",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Car updated successfully", car))
}

func (h *CarHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	if err := h.carUsecase.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to delete car",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Car deleted successfully", nil))
}

func (h *CarHandler) UpdateLocation(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	var req model.UpdateLocationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	if err := h.carUsecase.UpdateLocation(id, req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Failed to update location",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Location updated successfully", nil))
}
