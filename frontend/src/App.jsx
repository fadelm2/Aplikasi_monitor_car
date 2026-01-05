import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiveMonitor from './pages/LiveMonitor'
import Cars from './pages/Cars'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'

// Driver App imports
import DriverLayout from './components/driver/DriverLayout'
import DriverLogin from './pages/driver/DriverLogin'
import DriverHome from './pages/driver/DriverHome'
import DriverCheckIn from './pages/driver/DriverCheckIn'
import DriverCheckOut from './pages/driver/DriverCheckOut'
import DriverHistory from './pages/driver/DriverHistory'
import DriverProfile from './pages/driver/DriverProfile'

function ProtectedRoute({ children }) {
    const { token } = useAuthStore()
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return children
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Admin Panel Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="monitor" element={<LiveMonitor />} />
                    <Route path="cars" element={<Cars />} />
                    <Route path="drivers" element={<Drivers />} />
                    <Route path="trips" element={<Trips />} />
                    <Route path="maintenance" element={<Maintenance />} />
                </Route>

                {/* Driver App Routes */}
                <Route path="/driver/login" element={<DriverLogin />} />
                <Route path="/driver" element={<DriverLayout />}>
                    <Route index element={<Navigate to="/driver/home" replace />} />
                    <Route path="home" element={<DriverHome />} />
                    <Route path="checkin" element={<DriverCheckIn />} />
                    <Route path="checkout" element={<DriverCheckOut />} />
                    <Route path="history" element={<DriverHistory />} />
                    <Route path="profile" element={<DriverProfile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App

