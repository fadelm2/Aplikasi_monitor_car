package model

import "time"

type CheckoutRequest struct {
	CarID    int64  `json:"car_id" validate:"required"`
	DriverID int64  `json:"driver_id" validate:"required"`
	StartKm  int    `json:"start_km" validate:"min=0"`
	Notes    string `json:"notes"`
}

type CheckinRequest struct {
	TripID int64  `json:"trip_id" validate:"required"`
	EndKm  int    `json:"end_km" validate:"min=0"`
	Notes  string `json:"notes"`
}

type TripResponse struct {
	ID        int64           `json:"id"`
	CarID     int64           `json:"car_id"`
	Car       *CarResponse    `json:"car,omitempty"`
	DriverID  int64           `json:"driver_id"`
	Driver    *DriverResponse `json:"driver,omitempty"`
	StartTime time.Time       `json:"start_time"`
	EndTime   *time.Time      `json:"end_time"`
	StartKm   int             `json:"start_km"`
	EndKm     *int            `json:"end_km"`
	Notes     string          `json:"notes"`
	CreatedAt time.Time       `json:"created_at"`
}

type TripListParams struct {
	Page     int   `query:"page"`
	Limit    int   `query:"limit"`
	CarID    int64 `query:"car_id"`
	DriverID int64 `query:"driver_id"`
	Active   *bool `query:"active"`
}
