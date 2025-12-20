package http

import (
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/usecase"

	"github.com/gofiber/fiber/v2"
)

type DashboardHandler struct {
	dashboardUsecase usecase.DashboardUsecase
}

func NewDashboardHandler(dashboardUsecase usecase.DashboardUsecase) *DashboardHandler {
	return &DashboardHandler{dashboardUsecase: dashboardUsecase}
}

func (h *DashboardHandler) GetSummary(c *fiber.Ctx) error {
	summary, err := h.dashboardUsecase.GetSummary()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse(
			"Failed to get dashboard summary",
			err.Error(),
		))
	}

	return c.JSON(model.SuccessResponse("Dashboard summary", summary))
}
