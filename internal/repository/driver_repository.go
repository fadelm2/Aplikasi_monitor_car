package repository

import (
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"

	"gorm.io/gorm"
)

type DriverRepository interface {
	FindAll(params model.DriverListParams) ([]entity.Driver, int64, error)
	FindByID(id int64) (*entity.Driver, error)
	Create(driver *entity.Driver) error
	Update(driver *entity.Driver) error
	Delete(id int64) error
	UpdateStatus(id int64, status string) error
	CountByStatus(status string) (int64, error)
	Count() (int64, error)
}

type driverRepository struct {
	db *gorm.DB
}

func NewDriverRepository(db *gorm.DB) DriverRepository {
	return &driverRepository{db: db}
}

func (r *driverRepository) FindAll(params model.DriverListParams) ([]entity.Driver, int64, error) {
	var drivers []entity.Driver
	var total int64

	query := r.db.Model(&entity.Driver{})

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.Search != "" {
		search := "%" + params.Search + "%"
		query = query.Where("name ILIKE ? OR phone_number ILIKE ? OR license_number ILIKE ?", search, search, search)
	}

	query.Count(&total)

	if params.Limit <= 0 {
		params.Limit = 10
	}
	if params.Page <= 0 {
		params.Page = 1
	}
	offset := (params.Page - 1) * params.Limit

	err := query.Offset(offset).Limit(params.Limit).Order("id DESC").Find(&drivers).Error
	return drivers, total, err
}

func (r *driverRepository) FindByID(id int64) (*entity.Driver, error) {
	var driver entity.Driver
	err := r.db.First(&driver, id).Error
	if err != nil {
		return nil, err
	}
	return &driver, nil
}

func (r *driverRepository) Create(driver *entity.Driver) error {
	return r.db.Create(driver).Error
}

func (r *driverRepository) Update(driver *entity.Driver) error {
	return r.db.Save(driver).Error
}

func (r *driverRepository) Delete(id int64) error {
	return r.db.Delete(&entity.Driver{}, id).Error
}

func (r *driverRepository) UpdateStatus(id int64, status string) error {
	return r.db.Model(&entity.Driver{}).Where("id = ?", id).Update("status", status).Error
}

func (r *driverRepository) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.Model(&entity.Driver{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

func (r *driverRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&entity.Driver{}).Count(&count).Error
	return count, err
}
