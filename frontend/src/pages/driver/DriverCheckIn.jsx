import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDriverStore } from '../../store/driverStore'
import { driverAPI } from '../../services/api'
import {
    Car,
    Camera,
    Gauge,
    CheckCircle2,
    ChevronLeft,
    Loader2,
    X,
    Fuel,
    CircleDot,
    FileText
} from 'lucide-react'

export default function DriverCheckIn() {
    const navigate = useNavigate()
    const { driver, setActiveTrip } = useDriverStore()
    const fileInputRef = useRef(null)

    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        carId: '',
        startKm: '',
        fuelOk: false,
        tiresOk: false,
        stnkOk: false,
        photo: null,
        photoPreview: null
    })

    // Fetch available cars
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await driverAPI.getAvailableCars()
                setCars(response.data.data || [])
            } catch (err) {
                setError('Gagal memuat daftar mobil')
            } finally {
                setLoading(false)
            }
        }
        fetchCars()
    }, [])

    const handlePhotoCapture = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photo: file,
                    photoPreview: reader.result
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const removePhoto = () => {
        setFormData(prev => ({
            ...prev,
            photo: null,
            photoPreview: null
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.carId) {
            setError('Pilih mobil terlebih dahulu')
            return
        }
        if (!formData.startKm) {
            setError('Masukkan KM awal')
            return
        }
        if (!formData.fuelOk || !formData.tiresOk || !formData.stnkOk) {
            setError('Lengkapi semua checklist')
            return
        }
        if (!formData.photo) {
            setError('Foto kondisi mobil wajib diambil')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const checkoutData = {
                car_id: parseInt(formData.carId),
                driver_id: driver.driverId || driver.id,
                start_km: parseInt(formData.startKm),
                notes: `Checklist: Fuel OK, Tires OK, STNK OK. Photo attached.`
            }

            const response = await driverAPI.checkout(checkoutData)
            const trip = response.data.data

            // Find the selected car
            const selectedCar = cars.find(c => c.id === parseInt(formData.carId))
            setActiveTrip(trip, selectedCar)

            navigate('/driver/home')
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal memulai perjalanan')
        } finally {
            setSubmitting(false)
        }
    }

    const selectedCar = cars.find(c => c.id === parseInt(formData.carId))

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
                        <h1 className="text-xl font-bold text-white">Ambil Mobil</h1>
                        <p className="text-gray-500 text-sm">Check-in & mulai perjalanan</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Select Car */}
                <div className="glass rounded-2xl p-5">
                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                        <Car size={20} className="text-emerald-400" />
                        Pilih Mobil
                    </label>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada mobil tersedia
                        </div>
                    ) : (
                        <select
                            value={formData.carId}
                            onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                            className="w-full px-4 py-4 bg-dark-200 border border-gray-700 rounded-xl
                                text-white text-lg appearance-none cursor-pointer
                                focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="">-- Pilih Mobil --</option>
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.license_plate} - {car.brand} {car.model}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedCar && (
                        <div className="mt-4 p-4 bg-dark-200 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Car size={24} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-white font-semibold">{selectedCar.license_plate}</p>
                                <p className="text-gray-400 text-sm">{selectedCar.brand} {selectedCar.model} ({selectedCar.year})</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Start KM */}
                <div className="glass rounded-2xl p-5">
                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                        <Gauge size={20} className="text-emerald-400" />
                        KM Awal (Odometer)
                    </label>
                    <input
                        type="number"
                        value={formData.startKm}
                        onChange={(e) => setFormData({ ...formData, startKm: e.target.value })}
                        className="w-full px-4 py-4 bg-dark-200 border border-gray-700 rounded-xl
                            text-white text-lg
                            focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Contoh: 45320"
                        min="0"
                    />
                </div>

                {/* Quick Checklist */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-4">Checklist Cepat</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-4 p-4 bg-dark-200 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.fuelOk}
                                onChange={(e) => setFormData({ ...formData, fuelOk: e.target.checked })}
                                className="hidden"
                            />
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
                                ${formData.fuelOk ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                                {formData.fuelOk && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <Fuel size={20} className="text-yellow-400" />
                            <span className="text-white">Bensin Aman?</span>
                        </label>

                        <label className="flex items-center gap-4 p-4 bg-dark-200 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.tiresOk}
                                onChange={(e) => setFormData({ ...formData, tiresOk: e.target.checked })}
                                className="hidden"
                            />
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
                                ${formData.tiresOk ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                                {formData.tiresOk && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <CircleDot size={20} className="text-gray-400" />
                            <span className="text-white">Ban Aman?</span>
                        </label>

                        <label className="flex items-center gap-4 p-4 bg-dark-200 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.stnkOk}
                                onChange={(e) => setFormData({ ...formData, stnkOk: e.target.checked })}
                                className="hidden"
                            />
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
                                ${formData.stnkOk ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                                {formData.stnkOk && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <FileText size={20} className="text-blue-400" />
                            <span className="text-white">STNK Ada?</span>
                        </label>
                    </div>
                </div>

                {/* Photo Upload */}
                <div className="glass rounded-2xl p-5">
                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                        <Camera size={20} className="text-emerald-400" />
                        Foto Kondisi Mobil <span className="text-red-400">*</span>
                    </label>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                        id="photo-input"
                    />

                    {formData.photoPreview ? (
                        <div className="relative">
                            <img
                                src={formData.photoPreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="photo-input"
                            className="flex flex-col items-center justify-center h-40 bg-dark-200 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors"
                        >
                            <Camera size={40} className="text-gray-500 mb-2" />
                            <span className="text-gray-400">Tap untuk ambil foto</span>
                        </label>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-500 
                        text-white font-bold text-xl rounded-2xl
                        hover:from-emerald-500 hover:to-teal-400
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-dark-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 flex items-center justify-center gap-3
                        shadow-lg shadow-emerald-500/30 active:scale-[0.98]"
                >
                    {submitting && <Loader2 size={24} className="animate-spin" />}
                    {submitting ? 'Memproses...' : 'MULAI PERJALANAN'}
                </button>
            </form>
        </div>
    )
}
