import { useState, useEffect } from 'react'
import { maintenanceAPI, carsAPI } from '../services/api'
import { Wrench, Plus, Calendar, Banknote, Building2, Loader2, X, Trash2 } from 'lucide-react'

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

export default function Maintenance() {
    const [maintenances, setMaintenances] = useState([])
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        car_id: '', service_date: '', description: '', cost: 0, workshop_name: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [mainRes, carsRes] = await Promise.all([
                maintenanceAPI.getAll({ limit: 50 }),
                carsAPI.getAll({ limit: 100 }),
            ])
            setMaintenances(mainRes.data.data || [])
            setCars(carsRes.data.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await maintenanceAPI.create({
                car_id: parseInt(formData.car_id),
                service_date: new Date(formData.service_date).toISOString(),
                description: formData.description,
                cost: parseFloat(formData.cost) || 0,
                workshop_name: formData.workshop_name,
            })
            setModalOpen(false)
            setFormData({ car_id: '', service_date: '', description: '', cost: 0, workshop_name: '' })
            fetchData()
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menyimpan data')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus data maintenance ini?')) return
        try {
            await maintenanceAPI.delete(id)
            fetchData()
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menghapus')
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
    }

    const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Maintenance & Service</h1>
                    <p className="text-gray-400 mt-1">Riwayat perbaikan dan service kendaraan</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg
            hover:bg-primary-500 transition-colors"
                >
                    <Plus size={18} /> Catat Service
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-600/20 rounded-lg">
                            <Wrench size={24} className="text-primary-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Service</p>
                            <p className="text-2xl font-bold text-white">{maintenances.length}</p>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <Banknote size={24} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Biaya</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Building2 size={24} className="text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Mobil Maintenance</p>
                            <p className="text-2xl font-bold text-white">
                                {cars.filter(c => c.status === 'MAINTENANCE').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Riwayat Service</h2>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-primary-500" />
                    </div>
                ) : maintenances.length === 0 ? (
                    <div className="text-center py-8">
                        <Wrench size={48} className="mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">Belum ada data maintenance</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {maintenances.map(maintenance => (
                            <div key={maintenance.id} className="bg-dark-200 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-yellow-500/20 rounded-lg mt-1">
                                            <Wrench size={20} className="text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">
                                                {maintenance.car?.license_plate || 'Unknown'} - {maintenance.car?.brand} {maintenance.car?.model}
                                            </p>
                                            <p className="text-gray-300 mt-1">{maintenance.description}</p>
                                            <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Calendar size={14} />
                                                    {new Date(maintenance.service_date).toLocaleDateString('id-ID')}
                                                </div>
                                                <div className="flex items-center gap-1 text-green-400">
                                                    <Banknote size={14} />
                                                    {formatCurrency(maintenance.cost)}
                                                </div>
                                                {maintenance.workshop_name && (
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <Building2 size={14} />
                                                        {maintenance.workshop_name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(maintenance.id)}
                                        className="p-2 text-gray-400 hover:text-red-400"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Catat Service Baru">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Pilih Mobil</label>
                        <select
                            value={formData.car_id}
                            onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            required
                        >
                            <option value="">-- Pilih Mobil --</option>
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.license_plate} - {car.brand} {car.model}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Tanggal Service</label>
                        <input
                            type="date"
                            value={formData.service_date}
                            onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Deskripsi Perbaikan</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500 resize-none"
                            placeholder="Ganti oli, tune up, dll"
                            rows="2"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Biaya (Rp)</label>
                            <input
                                type="number"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Nama Bengkel</label>
                            <input
                                type="text"
                                value={formData.workshop_name}
                                onChange={(e) => setFormData({ ...formData, workshop_name: e.target.value })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500"
                                placeholder="Nama bengkel"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500
              disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 size={18} className="animate-spin" />}
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}
