package model

type DashboardSummary struct {
	TotalCars       int64           `json:"total_cars"`
	AvailableCars   int64           `json:"available_cars"`
	InUseCars       int64           `json:"in_use_cars"`
	MaintenanceCars int64           `json:"maintenance_cars"`
	TotalDrivers    int64           `json:"total_drivers"`
	ActiveDrivers   int64           `json:"active_drivers"`
	RecentTrips     []TripResponse  `json:"recent_trips"`
}

type ActivityItem struct {
	Type        string `json:"type"` // checkout, checkin, maintenance
	Description string `json:"description"`
	CarPlate    string `json:"car_plate"`
	DriverName  string `json:"driver_name,omitempty"`
	Timestamp   string `json:"timestamp"`
}
