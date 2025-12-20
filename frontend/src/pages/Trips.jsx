import { useState, useEffect } from 'react'
import { tripsAPI, carsAPI, driversAPI } from '../services/api'
import { Route, Car, Users, ArrowRight, ArrowLeft, Loader2, X } from 'lucide-react'

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative glass rounded-xl w-full max-w-md p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default function Trips() {
    const [trips, setTrips] = useState([])
    const [availableCars, setAvailableCars] = useState([])
    const [availableDrivers, setAvailableDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [checkoutModal, setCheckoutModal] = useState(false)
    const [checkinModal, setCheckinModal] = useState(false)
    const [selectedTrip, setSelectedTrip] = useState(null)
    const [saving, setSaving] = useState(false)

    const [checkoutForm, setCheckoutForm] = useState({ car_id: '', driver_id: '', start_km: 0, notes: '' })
    const [checkinForm, setCheckinForm] = useState({ trip_id: 0, end_km: 0, notes: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [tripsRes, carsRes, driversRes] = await Promise.all([
                tripsAPI.getAll({ limit: 50 }),
                carsAPI.getAll({ status: 'AVAILABLE', limit: 100 }),
                driversAPI.getAll({ status: 'OFF_DUTY', limit: 100 }),
            ])
            setTrips(tripsRes.data.data || [])
            setAvailableCars(carsRes.data.data || [])
            setAvailableDrivers(driversRes.data.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCheckout = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await tripsAPI.checkout({
                car_id: parseInt(checkoutForm.car_id),
                driver_id: parseInt(checkoutForm.driver_id),
                start_km: parseInt(checkoutForm.start_km),
                notes: checkoutForm.notes,
            })
            setCheckoutModal(false)
            setCheckoutForm({ car_id: '', driver_id: '', start_km: 0, notes: '' })
            fetchData()
        } catch (error) {
            alert(error.response?.data?.error || 'Checkout gagal')
        } finally {
            setSaving(false)
        }
    }

    const handleCheckin = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await tripsAPI.checkin({
                trip_id: checkinForm.trip_id,
                end_km: parseInt(checkinForm.end_km),
                notes: checkinForm.notes,
            })
            setCheckinModal(false)
            setSelectedTrip(null)
            fetchData()
        } catch (error) {
            alert(error.response?.data?.error || 'Checkin gagal')
        } finally {
            setSaving(false)
        }
    }

    const openCheckinModal = (trip) => {
        setSelectedTrip(trip)
        setCheckinForm({ trip_id: trip.id, end_km: trip.start_km, notes: '' })
        setCheckinModal(true)
    }

    const activeTrips = trips.filter(t => !t.end_time)
    const completedTrips = trips.filter(t => t.end_time)

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Operasional Trip</h1>
                    <p className="text-gray-400 mt-1">Serah terima kendaraan</p>
                </div>
                <button
                    onClick={() => setCheckoutModal(true)}
                    disabled={availableCars.length === 0 || availableDrivers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg
            hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowRight size={18} /> Checkout Mobil
                </button>
            </div>

            {/* Active Trips */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    Trip Aktif ({activeTrips.length})
                </h2>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-primary-500" />
                    </div>
                ) : activeTrips.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Tidak ada trip aktif</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTrips.map(trip => (
                            <div key={trip.id} className="bg-dark-200 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <Car size={20} className="text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{trip.car?.license_plate}</p>
                                            <p className="text-gray-500 text-sm">{trip.car?.brand} {trip.car?.model}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openCheckinModal(trip)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg
                      hover:bg-blue-500 transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Checkin
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                    <Users size={14} />
                                    <span>{trip.driver?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Start KM: {trip.start_km}</span>
                                    <span className="text-gray-500">
                                        {new Date(trip.start_time).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Trips */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Riwayat Trip</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="text-left p-3 text-gray-400 font-medium">Mobil</th>
                                <th className="text-left p-3 text-gray-400 font-medium">Supir</th>
                                <th className="text-left p-3 text-gray-400 font-medium">Mulai</th>
                                <th className="text-left p-3 text-gray-400 font-medium">Selesai</th>
                                <th className="text-left p-3 text-gray-400 font-medium">KM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedTrips.slice(0, 10).map(trip => (
                                <tr key={trip.id} className="border-b border-gray-800">
                                    <td className="p-3 text-white">{trip.car?.license_plate}</td>
                                    <td className="p-3 text-gray-300">{trip.driver?.name}</td>
                                    <td className="p-3 text-gray-400 text-sm">
                                        {new Date(trip.start_time).toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-3 text-gray-400 text-sm">
                                        {trip.end_time ? new Date(trip.end_time).toLocaleString('id-ID') : '-'}
                                    </td>
                                    <td className="p-3 text-gray-300">{trip.start_km} → {trip.end_km || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Checkout Modal */}
            <Modal isOpen={checkoutModal} onClose={() => setCheckoutModal(false)} title="Checkout Mobil">
                <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Pilih Mobil</label>
                        <select
                            value={checkoutForm.car_id}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, car_id: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            required
                        >
                            <option value="">-- Pilih Mobil --</option>
                            {availableCars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.license_plate} - {car.brand} {car.model}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Pilih Supir</label>
                        <select
                            value={checkoutForm.driver_id}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, driver_id: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            required
                        >
                            <option value="">-- Pilih Supir --</option>
                            {availableDrivers.map(driver => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">KM Awal</label>
                        <input
                            type="number"
                            value={checkoutForm.start_km}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, start_km: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Catatan</label>
                        <textarea
                            value={checkoutForm.notes}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500 resize-none"
                            rows="2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-500
              disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 size={18} className="animate-spin" />}
                        {saving ? 'Processing...' : 'Checkout Mobil'}
                    </button>
                </form>
            </Modal>

            {/* Checkin Modal */}
            <Modal isOpen={checkinModal} onClose={() => setCheckinModal(false)} title="Checkin Mobil">
                {selectedTrip && (
                    <form onSubmit={handleCheckin} className="space-y-4">
                        <div className="bg-dark-200 rounded-lg p-4 mb-4">
                            <p className="text-gray-400 text-sm">Mobil</p>
                            <p className="text-white font-semibold">{selectedTrip.car?.license_plate}</p>
                            <p className="text-gray-400 text-sm mt-2">Supir</p>
                            <p className="text-white">{selectedTrip.driver?.name}</p>
                            <p className="text-gray-400 text-sm mt-2">KM Awal</p>
                            <p className="text-white">{selectedTrip.start_km}</p>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">KM Akhir</label>
                            <input
                                type="number"
                                value={checkinForm.end_km}
                                onChange={(e) => setCheckinForm({ ...checkinForm, end_km: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500"
                                min={selectedTrip.start_km}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Catatan</label>
                            <textarea
                                value={checkinForm.notes}
                                onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500 resize-none"
                                rows="2"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500
                disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving && <Loader2 size={18} className="animate-spin" />}
                            {saving ? 'Processing...' : 'Checkin Mobil'}
                        </button>
                    </form>
                )}
            </Modal>
        </div>
    )
}
