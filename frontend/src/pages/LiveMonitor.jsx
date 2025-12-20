import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { carsAPI } from '../services/api'
import { Car, RefreshCw, MapPin, Search } from 'lucide-react' // Tambah icon Search
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom marker icons
const createMarkerIcon = (color) => new L.DivIcon({
    className: 'custom-marker',
    html: `
    <div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>
  `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

const statusColors = {
    AVAILABLE: '#10b981',
    IN_USE: '#ef4444',
    MAINTENANCE: '#f59e0b',
}

const statusLabels = {
    AVAILABLE: 'Ready',
    IN_USE: 'Sedang Jalan',
    MAINTENANCE: 'Bengkel',
}

export default function LiveMonitor() {
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(new Date())
    const [searchQuery, setSearchQuery] = useState('') // State untuk pencarian

    useEffect(() => {
        fetchCars()
        // Refresh every 30 seconds
        const interval = setInterval(fetchCars, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchCars = async () => {
        try {
            const response = await carsAPI.getAll({ limit: 100 })
            setCars(response.data.data || [])
            setLastUpdate(new Date())
        } catch (error) {
            console.error('Failed to fetch cars:', error)
        } finally {
            setLoading(false)
        }
    }

    // 1. Filter cars yang punya lokasi dulu
    const carsWithLocation = cars.filter(car => car.last_lat && car.last_lng)

    // 2. Filter berdasarkan search query (Plat atau Nama Supir)
    const filteredCars = carsWithLocation.filter(car => {
        const query = searchQuery.toLowerCase()
        const matchPlate = car.license_plate?.toLowerCase().includes(query)
        // Gunakan optional chaining (?.) untuk jaga-jaga jika current_driver null
        const matchDriver = car.current_driver?.name?.toLowerCase().includes(query)

        return matchPlate || matchDriver
    })

    // Default center (Jakarta)
    const defaultCenter = [-6.2088, 106.8456]
    // Center map ke mobil pertama yang ditemukan (jika ada), kalau tidak ke default
    const center = carsWithLocation.length > 0
        ? [carsWithLocation[0].last_lat, carsWithLocation[0].last_lng]
        : defaultCenter

    return (
        <div className="space-y-6 animate-fade-in h-full">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
                    <p className="text-gray-400 mt-1">
                        Pantau lokasi armada secara realtime • Update: {lastUpdate.toLocaleTimeString('id-ID')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari plat atau supir..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                        />
                    </div>

                    <button
                        onClick={fetchCars}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg
                        hover:bg-primary-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Legend & Stats */}
            <div className="flex flex-wrap items-center gap-4">
                {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-400 text-sm">{statusLabels[status]}</span>
                    </div>
                ))}
                <span className="text-gray-500 text-sm ml-auto font-medium">
                    Menampilkan {filteredCars.length} dari {carsWithLocation.length} unit
                </span>
            </div>

            {/* Map */}
            <div className="glass rounded-xl p-2 h-[calc(100vh-280px)] min-h-[400px]">
                {loading && cars.length === 0 ? ( // Loading awal saja
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <MapContainer
                        center={center}
                        zoom={12}
                        className="h-full w-full rounded-lg"
                        style={{ background: '#1e293b' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Render markers berdasarkan filteredCars */}
                        {filteredCars.map((car) => (
                            <Marker
                                key={car.id}
                                position={[car.last_lat, car.last_lng]}
                                icon={createMarkerIcon(statusColors[car.status] || statusColors.AVAILABLE)}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Car size={20} className="text-primary-500" />
                                            <span className="font-bold text-lg">{car.license_plate}</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>Mobil:</strong> {car.brand} {car.model}</p>
                                            <p><strong>Tahun:</strong> {car.year}</p>
                                            <p>
                                                <strong>Status:</strong>
                                                <span
                                                    className="ml-2 px-2 py-0.5 rounded text-white text-xs"
                                                    style={{ backgroundColor: statusColors[car.status] }}
                                                >
                                                    {statusLabels[car.status]}
                                                </span>
                                            </p>
                                            {car.current_driver && (
                                                <p><strong>Supir:</strong> {car.current_driver.name}</p>
                                            )}
                                            {car.last_update_loc && (
                                                <p className="text-gray-500">
                                                    <MapPin size={12} className="inline mr-1" />
                                                    {new Date(car.last_update_loc).toLocaleString('id-ID')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Empty state filter result */}
            {!loading && filteredCars.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                    <Search size={48} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Tidak ditemukan</h3>
                    <p className="text-gray-400">
                        {searchQuery
                            ? `Tidak ada mobil dengan kata kunci "${searchQuery}"`
                            : "Belum ada data lokasi GPS yang tersedia"
                        }
                    </p>
                </div>
            )}
        </div>
    )
}