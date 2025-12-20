package repository

import (
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"

	"gorm.io/gorm"
)

type CarRepository interface {
	FindAll(params model.CarListParams) ([]entity.Car, int64, error)
	FindByID(id int64) (*entity.Car, error)
	FindByLicensePlate(plate string) (*entity.Car, error)
	Create(car *entity.Car) error
	Update(car *entity.Car) error
	Delete(id int64) error
	UpdateLocation(id int64, lat, lng float64) error
	UpdateStatus(id int64, status string, driverID *int64) error
	CountByStatus(status string) (int64, error)
}

type carRepository struct {
	db *gorm.DB
}

func NewCarRepository(db *gorm.DB) CarRepository {
	return &carRepository{db: db}
}

func (r *carRepository) FindAll(params model.CarListParams) ([]entity.Car, int64, error) {
	var cars []entity.Car
	var total int64

	query := r.db.Model(&entity.Car{}).Preload("CurrentDriver")

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.Search != "" {
		search := "%" + params.Search + "%"
		query = query.Where("license_plate ILIKE ? OR brand ILIKE ? OR model ILIKE ?", search, search, search)
	}

	query.Count(&total)

	if params.Limit <= 0 {
		params.Limit = 10
	}
	if params.Page <= 0 {
		params.Page = 1
	}
	offset := (params.Page - 1) * params.Limit

	err := query.Offset(offset).Limit(params.Limit).Order("id DESC").Find(&cars).Error
	return cars, total, err
}

func (r *carRepository) FindByID(id int64) (*entity.Car, error) {
	var car entity.Car
	err := r.db.Preload("CurrentDriver").First(&car, id).Error
	if err != nil {
		return nil, err
	}
	return &car, nil
}

func (r *carRepository) FindByLicensePlate(plate string) (*entity.Car, error) {
	var car entity.Car
	err := r.db.Where("license_plate = ?", plate).First(&car).Error
	if err != nil {
		return nil, err
	}
	return &car, nil
}

func (r *carRepository) Create(car *entity.Car) error {
	return r.db.Create(car).Error
}

func (r *carRepository) Update(car *entity.Car) error {
	return r.db.Save(car).Error
}

func (r *carRepository) Delete(id int64) error {
	return r.db.Delete(&entity.Car{}, id).Error
}

func (r *carRepository) UpdateLocation(id int64, lat, lng float64) error {
	return r.db.Model(&entity.Car{}).Where("id = ?", id).Updates(map[string]interface{}{
		"last_lat":        lat,
		"last_lng":        lng,
		"last_update_loc": gorm.Expr("NOW()"),
	}).Error
}

func (r *carRepository) UpdateStatus(id int64, status string, driverID *int64) error {
	return r.db.Model(&entity.Car{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":            status,
		"current_driver_id": driverID,
	}).Error
}

func (r *carRepository) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.Model(&entity.Car{}).Where("status = ?", status).Count(&count).Error
	return count, err
}
