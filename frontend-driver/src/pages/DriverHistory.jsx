import { useState, useEffect } from 'react'
import { useDriverStore } from '../store/driverStore'
import { driverAPI } from '../services/api'
import {
    Car,
    Calendar,
    Clock,
    Loader2,
    ChevronRight,
    MapPin
} from 'lucide-react'

export default function DriverHistory() {
    const { driver } = useDriverStore()
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        fetchTrips()
    }, [driver])

    const fetchTrips = async (pageNum = 1) => {
        if (!driver) return

        try {
            const response = await driverAPI.getHistory(driver.driverId || driver.id, {
                page: pageNum,
                limit: 10
            })

            const newTrips = response.data.data || []
            if (pageNum === 1) {
                setTrips(newTrips)
            } else {
                setTrips(prev => [...prev, ...newTrips])
            }

            setHasMore(newTrips.length === 10)
            setPage(pageNum)
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadMore = () => {
        fetchTrips(page + 1)
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (startTime, endTime) => {
        const start = new Date(startTime)
        const startStr = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

        if (!endTime) return `${startStr} - Ongoing`

        const end = new Date(endTime)
        const endStr = end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        return `${startStr} - ${endStr}`
    }

    const calculateDistance = (startKm, endKm) => {
        if (!endKm) return '-'
        return (endKm - startKm).toLocaleString() + ' KM'
    }

    const calculateDuration = (startTime, endTime) => {
        if (!endTime) return 'Ongoing'
        const start = new Date(startTime)
        const end = new Date(endTime)
        const diff = Math.floor((end - start) / 1000 / 60)

        if (diff < 60) return `${diff}m`
        const hours = Math.floor(diff / 60)
        const minutes = diff % 60
        return `${hours}j ${minutes}m`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <div className="p-4 pb-24 animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Riwayat Saya</h1>
                <p className="text-gray-400 mt-1">Daftar perjalanan yang sudah dilakukan</p>
            </div>

            {trips.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-dark-200 flex items-center justify-center mb-4">
                        <Car size={32} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400">Belum ada riwayat perjalanan</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map((trip) => (
                        <div key={trip.id} className="glass rounded-2xl p-4 hover:bg-dark-100/50 transition-colors">
                            <div className="flex items-start gap-4">
                                {/* Car Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                    ${trip.end_time
                                        ? 'bg-gradient-to-br from-primary-500 to-teal-600'
                                        : 'bg-gradient-to-br from-yellow-500 to-orange-600'
                                    }`}>
                                    <Car size={24} className="text-white" />
                                </div>

                                {/* Trip Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-white font-semibold truncate">
                                            {trip.car?.license_plate || 'N/A'}
                                        </h3>
                                        {!trip.end_time && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        {trip.car?.brand} {trip.car?.model}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Calendar size={14} />
                                            <span>{formatDate(trip.start_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Clock size={14} />
                                            <span>{calculateDuration(trip.start_time, trip.end_time)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Distance */}
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-primary-400 font-semibold">
                                        <MapPin size={16} />
                                        <span>{calculateDistance(trip.start_km, trip.end_km)}</span>
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">
                                        {formatTime(trip.start_time, trip.end_time)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Load More */}
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            className="w-full py-4 bg-dark-100 text-gray-400 font-medium rounded-xl
                                hover:bg-dark-200 active:bg-dark-100 transition-colors flex items-center justify-center gap-2"
                        >
                            Muat Lebih Banyak
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
