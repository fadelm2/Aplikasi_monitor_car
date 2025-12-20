package model

import "time"

type MaintenanceRequest struct {
	CarID        int64     `json:"car_id" validate:"required"`
	ServiceDate  time.Time `json:"service_date" validate:"required"`
	Description  string    `json:"description" validate:"required"`
	Cost         float64   `json:"cost" validate:"min=0"`
	WorkshopName string    `json:"workshop_name"`
}

type MaintenanceResponse struct {
	ID           int64        `json:"id"`
	CarID        int64        `json:"car_id"`
	Car          *CarResponse `json:"car,omitempty"`
	ServiceDate  time.Time    `json:"service_date"`
	Description  string       `json:"description"`
	Cost         float64      `json:"cost"`
	WorkshopName string       `json:"workshop_name"`
	CreatedAt    time.Time    `json:"created_at"`
}

type MaintenanceListParams struct {
	Page   int   `query:"page"`
	Limit  int   `query:"limit"`
	CarID  int64 `query:"car_id"`
}
