import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
}

// Dashboard API
export const dashboardAPI = {
    getSummary: () => api.get('/dashboard/summary'),
}

// Cars API
export const carsAPI = {
    getAll: (params) => api.get('/cars', { params }),
    getById: (id) => api.get(`/cars/${id}`),
    create: (data) => api.post('/cars', data),
    update: (id, data) => api.put(`/cars/${id}`, data),
    delete: (id) => api.delete(`/cars/${id}`),
    updateLocation: (id, data) => api.put(`/cars/${id}/location`, data),
}

// Drivers API
export const driversAPI = {
    getAll: (params) => api.get('/drivers', { params }),
    getById: (id) => api.get(`/drivers/${id}`),
    create: (data) => api.post('/drivers', data),
    update: (id, data) => api.put(`/drivers/${id}`, data),
    delete: (id) => api.delete(`/drivers/${id}`),
}

// Trips API
export const tripsAPI = {
    getAll: (params) => api.get('/trips', { params }),
    getById: (id) => api.get(`/trips/${id}`),
    checkout: (data) => api.post('/trips/checkout', data),
    checkin: (data) => api.post('/trips/checkin', data),
}

// Maintenance API
export const maintenanceAPI = {
    getAll: (params) => api.get('/maintenances', { params }),
    getById: (id) => api.get(`/maintenances/${id}`),
    create: (data) => api.post('/maintenances', data),
    update: (id, data) => api.put(`/maintenances/${id}`, data),
    delete: (id) => api.delete(`/maintenances/${id}`),
}

// Driver App API
export const driverAPI = {
    // Use same auth endpoint - driver logs in with their credentials
    login: (data) => api.post('/auth/login', data),

    // Get available cars for checkout
    getAvailableCars: () => api.get('/cars', { params: { status: 'AVAILABLE' } }),

    // Get driver's active trip (ongoing trip)
    getActiveTrip: (driverId) => api.get('/trips', {
        params: { driver_id: driverId, active: true, limit: 1 }
    }),

    // Get driver's trip history
    getHistory: (driverId, params = {}) => api.get('/trips', {
        params: { ...params, driver_id: driverId }
    }),

    // Checkout (start trip)
    checkout: (data) => api.post('/trips/checkout', data),

    // Checkin (end trip)
    checkin: (data) => api.post('/trips/checkin', data),

    // Get driver info by ID
    getDriver: (id) => api.get(`/drivers/${id}`),
}

export default api
