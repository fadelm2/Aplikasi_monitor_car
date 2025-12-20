package usecase

import (
	"errors"
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/repository"

	"gorm.io/gorm"
)

type TripUsecase interface {
	GetAll(params model.TripListParams) ([]model.TripResponse, int64, error)
	GetByID(id int64) (*model.TripResponse, error)
	Checkout(req model.CheckoutRequest) (*model.TripResponse, error)
	Checkin(req model.CheckinRequest) (*model.TripResponse, error)
}

type tripUsecase struct {
	tripRepo   repository.TripRepository
	carRepo    repository.CarRepository
	driverRepo repository.DriverRepository
}

func NewTripUsecase(
	tripRepo repository.TripRepository,
	carRepo repository.CarRepository,
	driverRepo repository.DriverRepository,
) TripUsecase {
	return &tripUsecase{
		tripRepo:   tripRepo,
		carRepo:    carRepo,
		driverRepo: driverRepo,
	}
}

func (u *tripUsecase) GetAll(params model.TripListParams) ([]model.TripResponse, int64, error) {
	trips, total, err := u.tripRepo.FindAll(params)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.TripResponse
	for _, trip := range trips {
		responses = append(responses, u.toResponse(&trip))
	}
	return responses, total, nil
}

func (u *tripUsecase) GetByID(id int64) (*model.TripResponse, error) {
	trip, err := u.tripRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("trip not found")
		}
		return nil, err
	}
	response := u.toResponse(trip)
	return &response, nil
}

func (u *tripUsecase) Checkout(req model.CheckoutRequest) (*model.TripResponse, error) {
	// Check car exists and is available
	car, err := u.carRepo.FindByID(req.CarID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("car not found")
		}
		return nil, err
	}
	if car.Status != entity.CarStatusAvailable {
		return nil, errors.New("car is not available")
	}

	// Check driver exists and is off duty
	driver, err := u.driverRepo.FindByID(req.DriverID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("driver not found")
		}
		return nil, err
	}
	if driver.Status != entity.DriverStatusOffDuty {
		return nil, errors.New("driver is already on duty")
	}

	// Check driver doesn't have active trip
	_, err = u.tripRepo.FindActiveByDriverID(req.DriverID)
	if err == nil {
		return nil, errors.New("driver already has an active trip")
	}

	// Create trip
	trip := &entity.TripLog{
		CarID:    req.CarID,
		DriverID: req.DriverID,
		StartKm:  req.StartKm,
		Notes:    req.Notes,
	}

	if err := u.tripRepo.Create(trip); err != nil {
		return nil, err
	}

	// Update car status
	if err := u.carRepo.UpdateStatus(req.CarID, entity.CarStatusInUse, &req.DriverID); err != nil {
		return nil, err
	}

	// Update driver status
	if err := u.driverRepo.UpdateStatus(req.DriverID, entity.DriverStatusActive); err != nil {
		return nil, err
	}

	// Reload trip with relations
	trip, _ = u.tripRepo.FindByID(trip.ID)
	response := u.toResponse(trip)
	return &response, nil
}

func (u *tripUsecase) Checkin(req model.CheckinRequest) (*model.TripResponse, error) {
	// Find trip
	trip, err := u.tripRepo.FindByID(req.TripID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("trip not found")
		}
		return nil, err
	}

	if trip.EndTime != nil {
		return nil, errors.New("trip already ended")
	}

	// End trip
	if err := u.tripRepo.EndTrip(req.TripID, req.EndKm, req.Notes); err != nil {
		return nil, err
	}

	// Update car status
	if err := u.carRepo.UpdateStatus(trip.CarID, entity.CarStatusAvailable, nil); err != nil {
		return nil, err
	}

	// Update driver status
	if err := u.driverRepo.UpdateStatus(trip.DriverID, entity.DriverStatusOffDuty); err != nil {
		return nil, err
	}

	// Reload trip
	trip, _ = u.tripRepo.FindByID(req.TripID)
	response := u.toResponse(trip)
	return &response, nil
}

func (u *tripUsecase) toResponse(trip *entity.TripLog) model.TripResponse {
	resp := model.TripResponse{
		ID:        trip.ID,
		CarID:     trip.CarID,
		DriverID:  trip.DriverID,
		StartTime: trip.StartTime,
		EndTime:   trip.EndTime,
		StartKm:   trip.StartKm,
		EndKm:     trip.EndKm,
		Notes:     trip.Notes,
		CreatedAt: trip.CreatedAt,
	}
	if trip.Car != nil {
		resp.Car = &model.CarResponse{
			ID:           trip.Car.ID,
			LicensePlate: trip.Car.LicensePlate,
			Brand:        trip.Car.Brand,
			Model:        trip.Car.Model,
			Status:       trip.Car.Status,
		}
	}
	if trip.Driver != nil {
		resp.Driver = &model.DriverResponse{
			ID:     trip.Driver.ID,
			Name:   trip.Driver.Name,
			Status: trip.Driver.Status,
		}
	}
	return resp
}
