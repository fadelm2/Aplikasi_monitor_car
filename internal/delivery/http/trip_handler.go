package http

import (
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/usecase"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type TripHandler struct {
	tripUsecase usecase.TripUsecase
}

func NewTripHandler(tripUsecase usecase.TripUsecase) *TripHandler {
	return &TripHandler{tripUsecase: tripUsecase}
}

func (h *TripHandler) GetAll(c *fiber.Ctx) error {
	active := c.Query("active")
	var activePtr *bool
	if active != "" {
		val := active == "true"
		activePtr = &val
	}

	params := model.TripListParams{
		Page:     c.QueryInt("page", 1),
		Limit:    c.QueryInt("limit", 10),
		CarID:    int64(c.QueryInt("car_id", 0)),
		DriverID: int64(c.QueryInt("driver_id", 0)),
		Active:   activePtr,
	}

	trips, total, err := h.tripUsecase.GetAll(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse(
			"Failed to get trips",
			err.Error(),
		))
	}

	totalPages := int(total) / params.Limit
	if int(total)%params.Limit > 0 {
		totalPages++
	}

	return c.JSON(model.PaginationResponse{
		Success:    true,
		Data:       trips,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalItems: total,
		TotalPages: totalPages,
	})
}

func (h *TripHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid ID",
			"ID must be a number",
		))
	}

	trip, err := h.tripUsecase.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(model.ErrorResponse(
			"Trip not found",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Trip found", trip))
}

func (h *TripHandler) Checkout(c *fiber.Ctx) error {
	var req model.CheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	trip, err := h.tripUsecase.Checkout(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Checkout failed",
			err.Error(),
		))
	}

	return c.Status(fiber.StatusCreated).JSON(model.SuccessResponse("Checkout successful", trip))
}

func (h *TripHandler) Checkin(c *fiber.Ctx) error {
	var req model.CheckinRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Invalid request",
			err.Error(),
		))
	}

	trip, err := h.tripUsecase.Checkin(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse(
			"Checkin failed",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Checkin successful", trip))
}
