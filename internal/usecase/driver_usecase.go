package usecase

import (
	"errors"
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/repository"

	"gorm.io/gorm"
)

type DriverUsecase interface {
	GetAll(params model.DriverListParams) ([]model.DriverResponse, int64, error)
	GetByID(id int64) (*model.DriverResponse, error)
	Create(req model.DriverRequest) (*model.DriverResponse, error)
	Update(id int64, req model.DriverRequest) (*model.DriverResponse, error)
	Delete(id int64) error
}

type driverUsecase struct {
	driverRepo repository.DriverRepository
}

func NewDriverUsecase(driverRepo repository.DriverRepository) DriverUsecase {
	return &driverUsecase{driverRepo: driverRepo}
}

func (u *driverUsecase) GetAll(params model.DriverListParams) ([]model.DriverResponse, int64, error) {
	drivers, total, err := u.driverRepo.FindAll(params)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.DriverResponse
	for _, driver := range drivers {
		responses = append(responses, u.toResponse(&driver))
	}
	return responses, total, nil
}

func (u *driverUsecase) GetByID(id int64) (*model.DriverResponse, error) {
	driver, err := u.driverRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("driver not found")
		}
		return nil, err
	}
	response := u.toResponse(driver)
	return &response, nil
}

func (u *driverUsecase) Create(req model.DriverRequest) (*model.DriverResponse, error) {
	status := req.Status
	if status == "" {
		status = entity.DriverStatusOffDuty
	}

	driver := &entity.Driver{
		Name:          req.Name,
		PhoneNumber:   req.PhoneNumber,
		LicenseNumber: req.LicenseNumber,
		Status:        status,
	}

	if err := u.driverRepo.Create(driver); err != nil {
		return nil, err
	}

	response := u.toResponse(driver)
	return &response, nil
}

func (u *driverUsecase) Update(id int64, req model.DriverRequest) (*model.DriverResponse, error) {
	driver, err := u.driverRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("driver not found")
		}
		return nil, err
	}

	driver.Name = req.Name
	driver.PhoneNumber = req.PhoneNumber
	driver.LicenseNumber = req.LicenseNumber
	if req.Status != "" {
		driver.Status = req.Status
	}

	if err := u.driverRepo.Update(driver); err != nil {
		return nil, err
	}

	response := u.toResponse(driver)
	return &response, nil
}

func (u *driverUsecase) Delete(id int64) error {
	_, err := u.driverRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("driver not found")
		}
		return err
	}
	return u.driverRepo.Delete(id)
}

func (u *driverUsecase) toResponse(driver *entity.Driver) model.DriverResponse {
	return model.DriverResponse{
		ID:            driver.ID,
		Name:          driver.Name,
		PhoneNumber:   driver.PhoneNumber,
		LicenseNumber: driver.LicenseNumber,
		Status:        driver.Status,
		CreatedAt:     driver.CreatedAt,
		UpdatedAt:     driver.UpdatedAt,
	}
}
