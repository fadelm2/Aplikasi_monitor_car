package entity

import "time"

type TripLog struct {
	ID        int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	CarID     int64      `gorm:"not null" json:"car_id"`
	Car       *Car       `gorm:"foreignKey:CarID" json:"car,omitempty"`
	DriverID  int64      `gorm:"not null" json:"driver_id"`
	Driver    *Driver    `gorm:"foreignKey:DriverID" json:"driver,omitempty"`
	StartTime time.Time  `gorm:"autoCreateTime" json:"start_time"`
	EndTime   *time.Time `json:"end_time"`
	StartKm   int        `json:"start_km"`
	EndKm     *int       `json:"end_km"`
	Notes     string     `gorm:"type:text" json:"notes"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (TripLog) TableName() string {
	return "trip_logs"
}
