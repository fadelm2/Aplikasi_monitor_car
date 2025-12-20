package model

import "time"

type CarRequest struct {
	LicensePlate string `json:"license_plate" validate:"required,max=20"`
	Brand        string `json:"brand" validate:"required,max=50"`
	Model        string `json:"model" validate:"required,max=50"`
	Year         int    `json:"year" validate:"omitempty,min=1900,max=2100"`
	Status       string `json:"status" validate:"omitempty,oneof=AVAILABLE IN_USE MAINTENANCE"`
}

type CarResponse struct {
	ID              int64           `json:"id"`
	LicensePlate    string          `json:"license_plate"`
	Brand           string          `json:"brand"`
	Model           string          `json:"model"`
	Year            int             `json:"year"`
	Status          string          `json:"status"`
	CurrentDriverID *int64          `json:"current_driver_id"`
	CurrentDriver   *DriverResponse `json:"current_driver,omitempty"`
	LastLat         *float64        `json:"last_lat"`
	LastLng         *float64        `json:"last_lng"`
	LastUpdateLoc   *time.Time      `json:"last_update_loc"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

type UpdateLocationRequest struct {
	Lat float64 `json:"lat" validate:"required,latitude"`
	Lng float64 `json:"lng" validate:"required,longitude"`
}

type CarListParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Status string `query:"status"`
	Search string `query:"search"`
}
