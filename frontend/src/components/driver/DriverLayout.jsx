import { Outlet, NavLink, Navigate } from 'react-router-dom'
import { useDriverStore } from '../../store/driverStore'
import { Home, History, User } from 'lucide-react'

function DriverProtectedRoute({ children }) {
    const { token } = useDriverStore()
    if (!token) {
        return <Navigate to="/driver/login" replace />
    }
    return children
}

export default function DriverLayout() {
    const navItems = [
        { to: '/driver/home', icon: Home, label: 'Home' },
        { to: '/driver/history', icon: History, label: 'Riwayat' },
        { to: '/driver/profile', icon: User, label: 'Profil' },
    ]

    return (
        <DriverProtectedRoute>
            <div className="min-h-screen bg-dark-300">
                {/* Main Content */}
                <main className="pb-20">
                    <Outlet />
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-dark-200/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
                    <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
                        {navItems.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => `
                                    flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all
                                    ${isActive
                                        ? 'text-emerald-400'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/20' : ''}`}>
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-xs font-medium">{label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </DriverProtectedRoute>
    )
}

export { DriverProtectedRoute }
