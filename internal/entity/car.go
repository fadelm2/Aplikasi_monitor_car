package entity

import "time"

type Car struct {
	ID              int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	LicensePlate    string     `gorm:"size:20;not null;unique" json:"license_plate"`
	Brand           string     `gorm:"size:50;not null" json:"brand"`
	Model           string     `gorm:"size:50;not null" json:"model"`
	Year            int        `json:"year"`
	Status          string     `gorm:"size:20;default:'AVAILABLE'" json:"status"` // AVAILABLE, IN_USE, MAINTENANCE
	CurrentDriverID *int64     `json:"current_driver_id"`
	CurrentDriver   *Driver    `gorm:"foreignKey:CurrentDriverID" json:"current_driver,omitempty"`
	LastLat         *float64   `gorm:"type:decimal(10,8)" json:"last_lat"`
	LastLng         *float64   `gorm:"type:decimal(11,8)" json:"last_lng"`
	LastUpdateLoc   *time.Time `json:"last_update_loc"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Car) TableName() string {
	return "cars"
}

const (
	CarStatusAvailable   = "AVAILABLE"
	CarStatusInUse       = "IN_USE"
	CarStatusMaintenance = "MAINTENANCE"
)
