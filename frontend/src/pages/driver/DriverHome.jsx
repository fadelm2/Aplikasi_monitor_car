import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDriverStore } from '../../store/driverStore'
import { driverAPI } from '../../services/api'
import {
    Car,
    Play,
    Square,
    Clock,
    Gauge,
    AlertTriangle,
    Loader2,
    MapPin
} from 'lucide-react'

export default function DriverHome() {
    const navigate = useNavigate()
    const { driver, activeTrip, activeCar, setActiveTrip } = useDriverStore()
    const [loading, setLoading] = useState(true)
    const [tripDuration, setTripDuration] = useState('00:00:00')

    // Check for active trip on mount
    useEffect(() => {
        const checkActiveTrip = async () => {
            if (!driver) return

            try {
                const response = await driverAPI.getActiveTrip(driver.driverId || driver.id)
                if (response.data.data && response.data.data.length > 0) {
                    const trip = response.data.data[0]
                    setActiveTrip(trip, trip.car)
                }
            } catch (err) {
                console.error('Error checking active trip:', err)
            } finally {
                setLoading(false)
            }
        }

        checkActiveTrip()
    }, [driver, setActiveTrip])

    // Update trip duration timer
    useEffect(() => {
        if (!activeTrip) return

        const updateDuration = () => {
            const start = new Date(activeTrip.start_time)
            const now = new Date()
            const diff = Math.floor((now - start) / 1000)

            const hours = Math.floor(diff / 3600).toString().padStart(2, '0')
            const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
            const seconds = (diff % 60).toString().padStart(2, '0')

            setTripDuration(`${hours}:${minutes}:${seconds}`)
        }

        updateDuration()
        const interval = setInterval(updateDuration, 1000)

        return () => clearInterval(interval)
    }, [activeTrip])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-emerald-500" />
            </div>
        )
    }

    // State 2: On Trip
    if (activeTrip) {
        return (
            <div className="p-4 pb-24 space-y-6">
                {/* Header */}
                <div className="text-center py-4">
                    <p className="text-gray-400">Sedang dalam perjalanan</p>
                    <h1 className="text-2xl font-bold text-white mt-1">
                        Perjalanan Aktif
                    </h1>
                </div>

                {/* Car Card */}
                <div className="glass rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                            <Car size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">
                                {activeCar?.license_plate || activeTrip.car?.license_plate || 'N/A'}
                            </h3>
                            <p className="text-gray-400">
                                {activeCar?.brand || activeTrip.car?.brand} {activeCar?.model || activeTrip.car?.model}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <Gauge size={14} />
                                <span>KM Awal: {activeTrip.start_km?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timer */}
                <div className="glass rounded-2xl p-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                        <Clock size={18} />
                        <span>Durasi Perjalanan</span>
                    </div>
                    <div className="text-5xl font-mono font-bold text-white tracking-wider">
                        {tripDuration}
                    </div>
                </div>

                {/* Main Action - End Trip */}
                <button
                    onClick={() => navigate('/driver/checkout')}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-500 
                        text-white font-bold text-xl rounded-2xl
                        hover:from-red-500 hover:to-rose-400
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-200
                        transition-all duration-200 flex items-center justify-center gap-3
                        shadow-lg shadow-red-500/30 active:scale-[0.98]"
                >
                    <Square size={24} className="fill-white" />
                    SELESAI / KEMBALIKAN
                </button>

                {/* Secondary - Report Issue */}
                <button
                    onClick={() => navigate('/driver/checkout', { state: { reportIssue: true } })}
                    className="w-full py-4 bg-dark-100 border-2 border-yellow-500/50
                        text-yellow-400 font-semibold text-lg rounded-2xl
                        hover:bg-yellow-500/10
                        transition-all duration-200 flex items-center justify-center gap-3"
                >
                    <AlertTriangle size={22} />
                    Lapor Masalah / Darurat
                </button>
            </div>
        )
    }

    // State 1: Idle
    return (
        <div className="p-4 pb-24 space-y-6">
            {/* Header */}
            <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                    <Car size={40} className="text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                    Halo, {driver?.name || 'Supir'}!
                </h1>
                <p className="text-gray-400 mt-2">
                    Anda belum membawa mobil.
                </p>
            </div>

            {/* Status Card */}
            <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <MapPin size={24} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Status: Siap</h3>
                        <p className="text-gray-500 text-sm">Tekan tombol untuk mulai perjalanan</p>
                    </div>
                </div>
            </div>

            {/* Main Action - Start Trip */}
            <button
                onClick={() => navigate('/driver/checkin')}
                className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-500 
                    text-white font-bold text-xl rounded-2xl
                    hover:from-emerald-500 hover:to-teal-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-dark-200
                    transition-all duration-200 flex items-center justify-center gap-3
                    shadow-lg shadow-emerald-500/30 active:scale-[0.98]"
            >
                <Play size={28} className="fill-white" />
                MULAI PERJALANAN (Check-In)
            </button>
        </div>
    )
}
