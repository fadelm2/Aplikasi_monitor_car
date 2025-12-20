package usecase

import (
	"errors"
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/repository"

	"gorm.io/gorm"
)

type MaintenanceUsecase interface {
	GetAll(params model.MaintenanceListParams) ([]model.MaintenanceResponse, int64, error)
	GetByID(id int64) (*model.MaintenanceResponse, error)
	Create(req model.MaintenanceRequest) (*model.MaintenanceResponse, error)
	Update(id int64, req model.MaintenanceRequest) (*model.MaintenanceResponse, error)
	Delete(id int64) error
}

type maintenanceUsecase struct {
	maintenanceRepo repository.MaintenanceRepository
	carRepo         repository.CarRepository
}

func NewMaintenanceUsecase(
	maintenanceRepo repository.MaintenanceRepository,
	carRepo repository.CarRepository,
) MaintenanceUsecase {
	return &maintenanceUsecase{
		maintenanceRepo: maintenanceRepo,
		carRepo:         carRepo,
	}
}

func (u *maintenanceUsecase) GetAll(params model.MaintenanceListParams) ([]model.MaintenanceResponse, int64, error) {
	maintenances, total, err := u.maintenanceRepo.FindAll(params)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.MaintenanceResponse
	for _, m := range maintenances {
		responses = append(responses, u.toResponse(&m))
	}
	return responses, total, nil
}

func (u *maintenanceUsecase) GetByID(id int64) (*model.MaintenanceResponse, error) {
	maintenance, err := u.maintenanceRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("maintenance not found")
		}
		return nil, err
	}
	response := u.toResponse(maintenance)
	return &response, nil
}

func (u *maintenanceUsecase) Create(req model.MaintenanceRequest) (*model.MaintenanceResponse, error) {
	// Verify car exists
	car, err := u.carRepo.FindByID(req.CarID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("car not found")
		}
		return nil, err
	}

	maintenance := &entity.Maintenance{
		CarID:        req.CarID,
		ServiceDate:  req.ServiceDate,
		Description:  req.Description,
		Cost:         req.Cost,
		WorkshopName: req.WorkshopName,
	}

	if err := u.maintenanceRepo.Create(maintenance); err != nil {
		return nil, err
	}

	// Optionally update car status to maintenance
	if car.Status == entity.CarStatusAvailable {
		u.carRepo.UpdateStatus(req.CarID, entity.CarStatusMaintenance, nil)
	}

	maintenance, _ = u.maintenanceRepo.FindByID(maintenance.ID)
	response := u.toResponse(maintenance)
	return &response, nil
}

func (u *maintenanceUsecase) Update(id int64, req model.MaintenanceRequest) (*model.MaintenanceResponse, error) {
	maintenance, err := u.maintenanceRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("maintenance not found")
		}
		return nil, err
	}

	maintenance.ServiceDate = req.ServiceDate
	maintenance.Description = req.Description
	maintenance.Cost = req.Cost
	maintenance.WorkshopName = req.WorkshopName

	if err := u.maintenanceRepo.Update(maintenance); err != nil {
		return nil, err
	}

	response := u.toResponse(maintenance)
	return &response, nil
}

func (u *maintenanceUsecase) Delete(id int64) error {
	_, err := u.maintenanceRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("maintenance not found")
		}
		return err
	}
	return u.maintenanceRepo.Delete(id)
}

func (u *maintenanceUsecase) toResponse(m *entity.Maintenance) model.MaintenanceResponse {
	resp := model.MaintenanceResponse{
		ID:           m.ID,
		CarID:        m.CarID,
		ServiceDate:  m.ServiceDate,
		Description:  m.Description,
		Cost:         m.Cost,
		WorkshopName: m.WorkshopName,
		CreatedAt:    m.CreatedAt,
	}
	if m.Car != nil {
		resp.Car = &model.CarResponse{
			ID:           m.Car.ID,
			LicensePlate: m.Car.LicensePlate,
			Brand:        m.Car.Brand,
			Model:        m.Car.Model,
		}
	}
	return resp
}
