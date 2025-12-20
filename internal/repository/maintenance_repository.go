package repository

import (
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"

	"gorm.io/gorm"
)

type MaintenanceRepository interface {
	FindAll(params model.MaintenanceListParams) ([]entity.Maintenance, int64, error)
	FindByID(id int64) (*entity.Maintenance, error)
	FindByCarID(carID int64) ([]entity.Maintenance, error)
	Create(maintenance *entity.Maintenance) error
	Update(maintenance *entity.Maintenance) error
	Delete(id int64) error
}

type maintenanceRepository struct {
	db *gorm.DB
}

func NewMaintenanceRepository(db *gorm.DB) MaintenanceRepository {
	return &maintenanceRepository{db: db}
}

func (r *maintenanceRepository) FindAll(params model.MaintenanceListParams) ([]entity.Maintenance, int64, error) {
	var maintenances []entity.Maintenance
	var total int64

	query := r.db.Model(&entity.Maintenance{}).Preload("Car")

	if params.CarID > 0 {
		query = query.Where("car_id = ?", params.CarID)
	}

	query.Count(&total)

	if params.Limit <= 0 {
		params.Limit = 10
	}
	if params.Page <= 0 {
		params.Page = 1
	}
	offset := (params.Page - 1) * params.Limit

	err := query.Offset(offset).Limit(params.Limit).Order("service_date DESC").Find(&maintenances).Error
	return maintenances, total, err
}

func (r *maintenanceRepository) FindByID(id int64) (*entity.Maintenance, error) {
	var maintenance entity.Maintenance
	err := r.db.Preload("Car").First(&maintenance, id).Error
	if err != nil {
		return nil, err
	}
	return &maintenance, nil
}

func (r *maintenanceRepository) FindByCarID(carID int64) ([]entity.Maintenance, error) {
	var maintenances []entity.Maintenance
	err := r.db.Where("car_id = ?", carID).Order("service_date DESC").Find(&maintenances).Error
	return maintenances, err
}

func (r *maintenanceRepository) Create(maintenance *entity.Maintenance) error {
	return r.db.Create(maintenance).Error
}

func (r *maintenanceRepository) Update(maintenance *entity.Maintenance) error {
	return r.db.Save(maintenance).Error
}

func (r *maintenanceRepository) Delete(id int64) error {
	return r.db.Delete(&entity.Maintenance{}, id).Error
}
