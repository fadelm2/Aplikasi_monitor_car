package usecase

import (
	"fleet-monitor/internal/entity"
	"fleet-monitor/internal/model"
	"fleet-monitor/internal/repository"
)

type DashboardUsecase interface {
	GetSummary() (*model.DashboardSummary, error)
}

type dashboardUsecase struct {
	carRepo    repository.CarRepository
	driverRepo repository.DriverRepository
	tripRepo   repository.TripRepository
}

func NewDashboardUsecase(
	carRepo repository.CarRepository,
	driverRepo repository.DriverRepository,
	tripRepo repository.TripRepository,
) DashboardUsecase {
	return &dashboardUsecase{
		carRepo:    carRepo,
		driverRepo: driverRepo,
		tripRepo:   tripRepo,
	}
}

func (u *dashboardUsecase) GetSummary() (*model.DashboardSummary, error) {
	availableCars, _ := u.carRepo.CountByStatus(entity.CarStatusAvailable)
	inUseCars, _ := u.carRepo.CountByStatus(entity.CarStatusInUse)
	maintenanceCars, _ := u.carRepo.CountByStatus(entity.CarStatusMaintenance)
	totalCars := availableCars + inUseCars + maintenanceCars

	totalDrivers, _ := u.driverRepo.Count()
	activeDrivers, _ := u.driverRepo.CountByStatus(entity.DriverStatusActive)

	recentTrips, _ := u.tripRepo.FindRecent(5)
	var tripResponses []model.TripResponse
	for _, trip := range recentTrips {
		resp := model.TripResponse{
			ID:        trip.ID,
			CarID:     trip.CarID,
			DriverID:  trip.DriverID,
			StartTime: trip.StartTime,
			EndTime:   trip.EndTime,
			StartKm:   trip.StartKm,
			EndKm:     trip.EndKm,
			Notes:     trip.Notes,
		}
		if trip.Car != nil {
			resp.Car = &model.CarResponse{
				ID:           trip.Car.ID,
				LicensePlate: trip.Car.LicensePlate,
				Brand:        trip.Car.Brand,
				Model:        trip.Car.Model,
			}
		}
		if trip.Driver != nil {
			resp.Driver = &model.DriverResponse{
				ID:   trip.Driver.ID,
				Name: trip.Driver.Name,
			}
		}
		tripResponses = append(tripResponses, resp)
	}

	return &model.DashboardSummary{
		TotalCars:       totalCars,
		AvailableCars:   availableCars,
		InUseCars:       inUseCars,
		MaintenanceCars: maintenanceCars,
		TotalDrivers:    totalDrivers,
		ActiveDrivers:   activeDrivers,
		RecentTrips:     tripResponses,
	}, nil
}
