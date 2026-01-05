import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDriverStore } from '../../store/driverStore'
import { driverAPI } from '../../services/api'
import {
    Car,
    Gauge,
    CheckCircle2,
    ChevronLeft,
    Loader2,
    Clock,
    MapPin,
    FileText,
    Lock
} from 'lucide-react'

export default function DriverCheckOut() {
    const navigate = useNavigate()
    const location = useLocation()
    const { activeTrip, activeCar, clearActiveTrip } = useDriverStore()

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        endKm: '',
        notes: location.state?.reportIssue ? '' : '',
        carLocked: false,
        stnkReturned: false
    })

    // Calculate distance
    const startKm = activeTrip?.start_km || 0
    const endKm = parseInt(formData.endKm) || 0
    const distance = endKm >= startKm ? endKm - startKm : 0

    // Calculate duration
    const getDuration = () => {
        if (!activeTrip?.start_time) return '00:00'
        const start = new Date(activeTrip.start_time)
        const now = new Date()
        const diff = Math.floor((now - start) / 1000)
        const hours = Math.floor(diff / 3600)
        const minutes = Math.floor((diff % 3600) / 60)
        return `${hours}j ${minutes}m`
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.endKm) {
            setError('Masukkan KM akhir')
            return
        }
        if (endKm < startKm) {
            setError(`KM Akhir tidak boleh kurang dari KM Awal (${startKm.toLocaleString()})`)
            return
        }
        if (!formData.carLocked || !formData.stnkReturned) {
            setError('Lengkapi semua checklist')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const checkinData = {
                trip_id: activeTrip.id,
                end_km: parseInt(formData.endKm),
                notes: formData.notes || 'Perjalanan selesai tanpa kendala'
            }

            await driverAPI.checkin(checkinData)
            clearActiveTrip()
            navigate('/driver/home')
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal menyelesaikan perjalanan')
        } finally {
            setSubmitting(false)
        }
    }

    if (!activeTrip) {
        return (
            <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Tidak ada perjalanan aktif</p>
                    <button
                        onClick={() => navigate('/driver/home')}
                        className="px-6 py-3 bg-dark-100 text-white rounded-xl"
                    >
                        Kembali ke Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark-300 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-dark-300/80 backdrop-blur-lg border-b border-gray-800">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center text-gray-400 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Kembalikan Mobil</h1>
                        <p className="text-gray-500 text-sm">Check-out & selesaikan perjalanan</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Current Trip Info */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-4">Info Perjalanan</h3>
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                            <Car size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-white">
                                {activeCar?.license_plate || activeTrip.car?.license_plate || 'N/A'}
                            </h4>
                            <p className="text-gray-400">
                                {activeCar?.brand || activeTrip.car?.brand} {activeCar?.model || activeTrip.car?.model}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-dark-200 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Clock size={14} />
                                <span>Durasi</span>
                            </div>
                            <p className="text-white font-semibold">{getDuration()}</p>
                        </div>
                        <div className="p-3 bg-dark-200 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Gauge size={14} />
                                <span>KM Awal</span>
                            </div>
                            <p className="text-white font-semibold">{startKm.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* End KM */}
                <div className="glass rounded-2xl p-5">
                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                        <Gauge size={20} className="text-red-400" />
                        KM Akhir (Odometer)
                    </label>
                    <input
                        type="number"
                        value={formData.endKm}
                        onChange={(e) => setFormData({ ...formData, endKm: e.target.value })}
                        className="w-full px-4 py-4 bg-dark-200 border border-gray-700 rounded-xl
                            text-white text-lg
                            focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="Contoh: 45450"
                        min={startKm}
                    />

                    {/* Distance calculation */}
                    {formData.endKm && (
                        <div className="mt-4 p-4 bg-dark-200 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin size={18} />
                                    <span>Jarak Tempuh</span>
                                </div>
                                <span className={`text-2xl font-bold ${endKm >= startKm ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {distance.toLocaleString()} KM
                                </span>
                            </div>
                            {endKm < startKm && (
                                <p className="text-red-400 text-sm mt-2">
                                    KM Akhir harus ≥ KM Awal ({startKm.toLocaleString()})
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Notes / Issues */}
                <div className="glass rounded-2xl p-5">
                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                        <FileText size={20} className="text-yellow-400" />
                        Catatan / Laporan Kendala
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-4 bg-dark-200 border border-gray-700 rounded-xl
                            text-white resize-none h-28
                            focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                        placeholder="Ada kendala mesin/lecet? Tulis di sini (opsional)"
                    />
                </div>

                {/* Checklist */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-4">Checklist Akhir</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-4 p-4 bg-dark-200 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.carLocked}
                                onChange={(e) => setFormData({ ...formData, carLocked: e.target.checked })}
                                className="hidden"
                            />
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
                                ${formData.carLocked ? 'bg-red-500 border-red-500' : 'border-gray-600'}`}>
                                {formData.carLocked && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <Lock size={20} className="text-gray-400" />
                            <span className="text-white">Mobil sudah dikunci?</span>
                        </label>

                        <label className="flex items-center gap-4 p-4 bg-dark-200 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.stnkReturned}
                                onChange={(e) => setFormData({ ...formData, stnkReturned: e.target.checked })}
                                className="hidden"
                            />
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
                                ${formData.stnkReturned ? 'bg-red-500 border-red-500' : 'border-gray-600'}`}>
                                {formData.stnkReturned && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <FileText size={20} className="text-blue-400" />
                            <span className="text-white">STNK sudah dikembalikan?</span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-500 
                        text-white font-bold text-xl rounded-2xl
                        hover:from-red-500 hover:to-rose-400
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 flex items-center justify-center gap-3
                        shadow-lg shadow-red-500/30 active:scale-[0.98]"
                >
                    {submitting && <Loader2 size={24} className="animate-spin" />}
                    {submitting ? 'Memproses...' : 'SELESAIKAN PERJALANAN'}
                </button>
            </form>
        </div>
    )
}
