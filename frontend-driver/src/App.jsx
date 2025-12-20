import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDriverStore } from './store/driverStore'

// Pages
import DriverLogin from './pages/DriverLogin'
import DriverHome from './pages/DriverHome'
import DriverCheckIn from './pages/DriverCheckIn'
import DriverCheckOut from './pages/DriverCheckOut'
import DriverHistory from './pages/DriverHistory'
import DriverProfile from './pages/DriverProfile'

// Layout
import DriverLayout from './components/DriverLayout'

function ProtectedRoute({ children }) {
  const { token } = useDriverStore()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<DriverLogin />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DriverLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<DriverHome />} />
          <Route path="checkin" element={<DriverCheckIn />} />
          <Route path="checkout" element={<DriverCheckOut />} />
          <Route path="history" element={<DriverHistory />} />
          <Route path="profile" element={<DriverProfile />} />
        </Route>
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
