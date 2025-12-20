import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { Car, Users, Route, Wrench, TrendingUp, Clock } from 'lucide-react'

function StatCard({ title, value, icon: Icon, color, subtext }) {
    return (
        <div className="glass rounded-xl p-6 card-hover">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {subtext && <p className="text-gray-500 text-sm mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    )
}

function RecentActivity({ trips }) {
    if (!trips || trips.length === 0) {
        return (
            <div className="text-center py-8">
                <Route size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada aktivitas</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {trips.map((trip) => (
                <div key={trip.id} className="flex items-center gap-4 p-4 bg-dark-200 rounded-lg">
                    <div className={`p-2 rounded-lg ${trip.end_time ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                        <Route size={20} className={trip.end_time ? 'text-green-400' : 'text-blue-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                            {trip.car?.license_plate || 'Unknown'} - {trip.driver?.name || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-sm">
                            {trip.end_time ? 'Selesai' : 'Sedang Berjalan'} • KM: {trip.start_km}{trip.end_km ? ` - ${trip.end_km}` : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm">
                            {new Date(trip.start_time).toLocaleDateString('id-ID')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSummary()
    }, [])

    const fetchSummary = async () => {
        try {
            const response = await dashboardAPI.getSummary()
            setSummary(response.data.data)
        } catch (error) {
            console.error('Failed to fetch dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">Overview armada perusahaan</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Armada"
                    value={summary?.total_cars || 0}
                    icon={Car}
                    color="bg-gradient-to-br from-primary-500 to-primary-600"
                />
                <StatCard
                    title="Mobil Ready"
                    value={summary?.available_cars || 0}
                    icon={TrendingUp}
                    color="status-available"
                    subtext="Siap digunakan"
                />
                <StatCard
                    title="Sedang Jalan"
                    value={summary?.in_use_cars || 0}
                    icon={Route}
                    color="status-in-use"
                    subtext={`${summary?.active_drivers || 0} supir aktif`}
                />
                <StatCard
                    title="Dalam Perbaikan"
                    value={summary?.maintenance_cars || 0}
                    icon={Wrench}
                    color="status-maintenance"
                    subtext="Di bengkel"
                />
            </div>

            {/* Second row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2 glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Aktivitas Terbaru</h2>
                            <p className="text-gray-500 text-sm">5 trip terakhir</p>
                        </div>
                        <Clock size={20} className="text-gray-500" />
                    </div>
                    <RecentActivity trips={summary?.recent_trips} />
                </div>

                {/* Quick stats */}
                <div className="glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Statistik Supir</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-dark-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-primary-400" />
                                <span className="text-gray-300">Total Supir</span>
                            </div>
                            <span className="text-xl font-bold text-white">{summary?.total_drivers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-dark-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-green-400" />
                                <span className="text-gray-300">Aktif</span>
                            </div>
                            <span className="text-xl font-bold text-green-400">{summary?.active_drivers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-dark-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-gray-400" />
                                <span className="text-gray-300">Off Duty</span>
                            </div>
                            <span className="text-xl font-bold text-gray-400">
                                {(summary?.total_drivers || 0) - (summary?.active_drivers || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
