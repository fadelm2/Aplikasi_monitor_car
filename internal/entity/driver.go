package entity

import "time"

type Driver struct {
	ID            int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	PhoneNumber   string    `gorm:"size:20" json:"phone_number"`
	LicenseNumber string    `gorm:"size:50;unique" json:"license_number"`
	Status        string    `gorm:"size:20;default:'OFF_DUTY'" json:"status"` // ACTIVE, OFF_DUTY
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Driver) TableName() string {
	return "drivers"
}

const (
	DriverStatusActive  = "ACTIVE"
	DriverStatusOffDuty = "OFF_DUTY"
)
