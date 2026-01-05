import axios from 'axios'
import { useDriverStore } from '../store/driverStore'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = useDriverStore.getState().token
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
            useDriverStore.getState().logout()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Driver API
export const driverAPI = {
    // Login
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
