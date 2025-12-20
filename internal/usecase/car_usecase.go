package usecase

import (
	"errors"
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/repository"

	"gorm.io/gorm"
)

type CarUsecase interface {
	GetAll(params model.CarListParams) ([]model.CarResponse, int64, error)
	GetByID(id int64) (*model.CarResponse, error)
	Create(req model.CarRequest) (*model.CarResponse, error)
	Update(id int64, req model.CarRequest) (*model.CarResponse, error)
	Delete(id int64) error
	UpdateLocation(id int64, req model.UpdateLocationRequest) error
}

type carUsecase struct {
	carRepo repository.CarRepository
}

func NewCarUsecase(carRepo repository.CarRepository) CarUsecase {
	return &carUsecase{carRepo: carRepo}
}

func (u *carUsecase) GetAll(params model.CarListParams) ([]model.CarResponse, int64, error) {
	cars, total, err := u.carRepo.FindAll(params)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.CarResponse
	for _, car := range cars {
		responses = append(responses, u.toResponse(&car))
	}
	return responses, total, nil
}

func (u *carUsecase) GetByID(id int64) (*model.CarResponse, error) {
	car, err := u.carRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("car not found")
		}
		return nil, err
	}
	response := u.toResponse(car)
	return &response, nil
}

func (u *carUsecase) Create(req model.CarRequest) (*model.CarResponse, error) {
	existing, _ := u.carRepo.FindByLicensePlate(req.LicensePlate)
	if existing != nil {
		return nil, errors.New("license plate already exists")
	}

	status := req.Status
	if status == "" {
		status = entity.CarStatusAvailable
	}

	car := &entity.Car{
		LicensePlate: req.LicensePlate,
		Brand:        req.Brand,
		Model:        req.Model,
		Year:         req.Year,
		Status:       status,
	}

	if err := u.carRepo.Create(car); err != nil {
		return nil, err
	}

	response := u.toResponse(car)
	return &response, nil
}

func (u *carUsecase) Update(id int64, req model.CarRequest) (*model.CarResponse, error) {
	car, err := u.carRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("car not found")
		}
		return nil, err
	}

	if req.LicensePlate != car.LicensePlate {
		existing, _ := u.carRepo.FindByLicensePlate(req.LicensePlate)
		if existing != nil && existing.ID != id {
			return nil, errors.New("license plate already exists")
		}
	}

	car.LicensePlate = req.LicensePlate
	car.Brand = req.Brand
	car.Model = req.Model
	car.Year = req.Year
	if req.Status != "" {
		car.Status = req.Status
	}

	if err := u.carRepo.Update(car); err != nil {
		return nil, err
	}

	response := u.toResponse(car)
	return &response, nil
}

func (u *carUsecase) Delete(id int64) error {
	_, err := u.carRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("car not found")
		}
		return err
	}
	return u.carRepo.Delete(id)
}

func (u *carUsecase) UpdateLocation(id int64, req model.UpdateLocationRequest) error {
	_, err := u.carRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("car not found")
		}
		return err
	}
	return u.carRepo.UpdateLocation(id, req.Lat, req.Lng)
}

func (u *carUsecase) toResponse(car *entity.Car) model.CarResponse {
	resp := model.CarResponse{
		ID:              car.ID,
		LicensePlate:    car.LicensePlate,
		Brand:           car.Brand,
		Model:           car.Model,
		Year:            car.Year,
		Status:          car.Status,
		CurrentDriverID: car.CurrentDriverID,
		LastLat:         car.LastLat,
		LastLng:         car.LastLng,
		LastUpdateLoc:   car.LastUpdateLoc,
		CreatedAt:       car.CreatedAt,
		UpdatedAt:       car.UpdatedAt,
	}
	if car.CurrentDriver != nil {
		resp.CurrentDriver = &model.DriverResponse{
			ID:            car.CurrentDriver.ID,
			Name:          car.CurrentDriver.Name,
			PhoneNumber:   car.CurrentDriver.PhoneNumber,
			LicenseNumber: car.CurrentDriver.LicenseNumber,
			Status:        car.CurrentDriver.Status,
		}
	}
	return resp
}
