import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDriverStore } from '../store/driverStore'
import { driverAPI } from '../services/api'
import { Truck, Eye, EyeOff, Loader2, User } from 'lucide-react'

export default function DriverLogin() {
    const navigate = useNavigate()
    const { setAuth, setActiveTrip } = useDriverStore()
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await driverAPI.login(formData)
            const { token, user } = response.data.data

            setAuth(token, {
                id: user.id,
                name: user.username,
                driverId: user.id
            })

            // Check if driver has an active trip
            try {
                const tripResponse = await driverAPI.getActiveTrip(user.id)
                if (tripResponse.data.data && tripResponse.data.data.length > 0) {
                    const activeTrip = tripResponse.data.data[0]
                    setActiveTrip(activeTrip, activeTrip.car)
                }
            } catch (tripErr) {
                // No active trip, that's fine
            }

            navigate('/home')
        } catch (err) {
            setError(err.response?.data?.error || 'Login gagal. Coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark-300 flex flex-col items-center justify-center p-6">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-teal-600 mb-4 shadow-lg shadow-primary-500/30">
                        <Truck size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Fleet Driver</h1>
                    <p className="text-gray-400 mt-2">Aplikasi Supir</p>
                </div>

                {/* Login form */}
                <div className="glass rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center">
                            <User size={20} className="text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Masuk</h2>
                            <p className="text-gray-500 text-sm">Login ke akun Anda</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Username / No HP
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-4 bg-dark-200 border border-gray-700 rounded-xl
                                    text-white placeholder-gray-500 text-lg
                                    focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                                    transition-colors"
                                placeholder="Masukkan username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-4 bg-dark-200 border border-gray-700 rounded-xl
                                        text-white placeholder-gray-500 text-lg
                                        focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                                        transition-colors pr-14"
                                    placeholder="Masukkan password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-primary-600 to-teal-500 
                                text-white font-bold text-lg rounded-xl
                                hover:from-primary-500 hover:to-teal-400
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-200 flex items-center justify-center gap-3
                                shadow-lg shadow-primary-500/30 active:scale-[0.98]"
                        >
                            {loading && <Loader2 size={24} className="animate-spin" />}
                            {loading ? 'Masuk...' : 'MASUK'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-sm mt-8">
                    © 2024 Fleet Monitor
                </p>
            </div>
        </div>
    )
}
