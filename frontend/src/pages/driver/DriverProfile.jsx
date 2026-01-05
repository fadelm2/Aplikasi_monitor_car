import { useNavigate } from 'react-router-dom'
import { useDriverStore } from '../../store/driverStore'
import {
    User,
    Phone,
    CreditCard,
    LogOut,
    ChevronRight,
    Car
} from 'lucide-react'

export default function DriverProfile() {
    const navigate = useNavigate()
    const { driver, logout } = useDriverStore()

    const handleLogout = () => {
        logout()
        navigate('/driver/login')
    }

    return (
        <div className="p-4 pb-24">
            {/* Profile Header */}
            <div className="glass rounded-2xl p-6 text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                    <User size={40} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                    {driver?.name || 'Supir'}
                </h1>
                <p className="text-gray-400 mt-1">Driver</p>
            </div>

            {/* Profile Info */}
            <div className="glass rounded-2xl overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-gray-400 text-sm font-medium">Informasi Akun</h3>
                </div>

                <div className="divide-y divide-gray-800">
                    <div className="flex items-center gap-4 p-4">
                        <div className="w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center">
                            <User size={20} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm">Nama</p>
                            <p className="text-white">{driver?.name || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4">
                        <div className="w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center">
                            <Phone size={20} className="text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm">No. HP</p>
                            <p className="text-white">{driver?.phone || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4">
                        <div className="w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center">
                            <CreditCard size={20} className="text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm">No. SIM</p>
                            <p className="text-white">{driver?.licenseNumber || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4">
                        <div className="w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center">
                            <Car size={20} className="text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm">ID Driver</p>
                            <p className="text-white">{driver?.driverId || driver?.id || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Info */}
            <div className="glass rounded-2xl overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-gray-400 text-sm font-medium">Tentang Aplikasi</h3>
                </div>

                <div className="divide-y divide-gray-800">
                    <div className="flex items-center justify-between p-4">
                        <span className="text-white">Versi Aplikasi</span>
                        <span className="text-gray-400">1.0.0</span>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-400 
                    font-semibold rounded-2xl hover:bg-red-500/20 transition-colors
                    flex items-center justify-center gap-3"
            >
                <LogOut size={20} />
                Keluar
            </button>

            {/* Footer */}
            <p className="text-center text-gray-600 text-sm mt-8">
                © 2024 Fleet Monitor
            </p>
        </div>
    )
}
