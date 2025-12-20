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

export default api
