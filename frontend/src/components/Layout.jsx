import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
    LayoutDashboard,
    Map,
    Car,
    Users,
    Route,
    Wrench,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/monitor', icon: Map, label: 'Live Monitor' },
    { path: '/cars', icon: Car, label: 'Armada' },
    { path: '/drivers', icon: Users, label: 'Supir' },
    { path: '/trips', icon: Route, label: 'Operasional' },
    { path: '/maintenance', icon: Wrench, label: 'Bengkel' },
]

export default function Layout() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-dark-300 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-dark-200 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-800">
                        <h1 className="text-2xl font-bold gradient-text">Fleet Monitor</h1>
                        <p className="text-gray-500 text-sm mt-1">Corporate Fleet Management</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                        : 'text-gray-400 hover:bg-dark-100 hover:text-white'}
                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User info & Logout */}
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-medium">{user?.username || 'Admin'}</p>
                                <p className="text-gray-500 text-sm capitalize">{user?.role || 'admin'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg
                text-gray-400 hover:bg-red-500/10 hover:text-red-400
                transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <header className="lg:hidden bg-dark-200 border-b border-gray-800 p-4 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-bold gradient-text">Fleet Monitor</h1>
                    <div className="w-6" />
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
