package repository

import (
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"
	"time"

	"gorm.io/gorm"
)

type TripRepository interface {
	FindAll(params model.TripListParams) ([]entity.TripLog, int64, error)
	FindByID(id int64) (*entity.TripLog, error)
	FindActiveByCarID(carID int64) (*entity.TripLog, error)
	FindActiveByDriverID(driverID int64) (*entity.TripLog, error)
	FindRecent(limit int) ([]entity.TripLog, error)
	Create(trip *entity.TripLog) error
	Update(trip *entity.TripLog) error
	EndTrip(id int64, endKm int, notes string) error
}

type tripRepository struct {
	db *gorm.DB
}

func NewTripRepository(db *gorm.DB) TripRepository {
	return &tripRepository{db: db}
}

func (r *tripRepository) FindAll(params model.TripListParams) ([]entity.TripLog, int64, error) {
	var trips []entity.TripLog
	var total int64

	query := r.db.Model(&entity.TripLog{}).Preload("Car").Preload("Driver")

	if params.CarID > 0 {
		query = query.Where("car_id = ?", params.CarID)
	}
	if params.DriverID > 0 {
		query = query.Where("driver_id = ?", params.DriverID)
	}
	if params.Active != nil {
		if *params.Active {
			query = query.Where("end_time IS NULL")
		} else {
			query = query.Where("end_time IS NOT NULL")
		}
	}

	query.Count(&total)

	if params.Limit <= 0 {
		params.Limit = 10
	}
	if params.Page <= 0 {
		params.Page = 1
	}
	offset := (params.Page - 1) * params.Limit

	err := query.Offset(offset).Limit(params.Limit).Order("id DESC").Find(&trips).Error
	return trips, total, err
}

func (r *tripRepository) FindByID(id int64) (*entity.TripLog, error) {
	var trip entity.TripLog
	err := r.db.Preload("Car").Preload("Driver").First(&trip, id).Error
	if err != nil {
		return nil, err
	}
	return &trip, nil
}

func (r *tripRepository) FindActiveByCarID(carID int64) (*entity.TripLog, error) {
	var trip entity.TripLog
	err := r.db.Where("car_id = ? AND end_time IS NULL", carID).First(&trip).Error
	if err != nil {
		return nil, err
	}
	return &trip, nil
}

func (r *tripRepository) FindActiveByDriverID(driverID int64) (*entity.TripLog, error) {
	var trip entity.TripLog
	err := r.db.Where("driver_id = ? AND end_time IS NULL", driverID).First(&trip).Error
	if err != nil {
		return nil, err
	}
	return &trip, nil
}

func (r *tripRepository) FindRecent(limit int) ([]entity.TripLog, error) {
	var trips []entity.TripLog
	err := r.db.Preload("Car").Preload("Driver").Order("id DESC").Limit(limit).Find(&trips).Error
	return trips, err
}

func (r *tripRepository) Create(trip *entity.TripLog) error {
	return r.db.Create(trip).Error
}

func (r *tripRepository) Update(trip *entity.TripLog) error {
	return r.db.Save(trip).Error
}

func (r *tripRepository) EndTrip(id int64, endKm int, notes string) error {
	now := time.Now()
	return r.db.Model(&entity.TripLog{}).Where("id = ?", id).Updates(map[string]interface{}{
		"end_time": now,
		"end_km":   endKm,
		"notes":    gorm.Expr("CONCAT(notes, ?::text)", "\n"+notes),
	}).Error
}
