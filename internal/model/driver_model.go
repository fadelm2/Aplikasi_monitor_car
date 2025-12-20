package model

import "time"

type DriverRequest struct {
	Name          string `json:"name" validate:"required,max=100"`
	PhoneNumber   string `json:"phone_number" validate:"omitempty,max=20"`
	LicenseNumber string `json:"license_number" validate:"omitempty,max=50"`
	Status        string `json:"status" validate:"omitempty,oneof=ACTIVE OFF_DUTY"`
}

type DriverResponse struct {
	ID            int64     `json:"id"`
	Name          string    `json:"name"`
	PhoneNumber   string    `json:"phone_number"`
	LicenseNumber string    `json:"license_number"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type DriverListParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Status string `query:"status"`
	Search string `query:"search"`
}
