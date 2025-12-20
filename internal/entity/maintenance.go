package entity

import "time"

type Maintenance struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	CarID        int64     `gorm:"not null" json:"car_id"`
	Car          *Car      `gorm:"foreignKey:CarID" json:"car,omitempty"`
	ServiceDate  time.Time `gorm:"not null" json:"service_date"`
	Description  string    `gorm:"type:text;not null" json:"description"`
	Cost         float64   `gorm:"type:decimal(15,2);default:0" json:"cost"`
	WorkshopName string    `gorm:"size:100" json:"workshop_name"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Maintenance) TableName() string {
	return "maintenances"
}
