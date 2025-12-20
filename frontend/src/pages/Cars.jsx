import { useState, useEffect } from 'react'
import { carsAPI } from '../services/api'
import { Car, Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react'

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'IN_USE', label: 'In Use' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
]

const statusColors = {
    AVAILABLE: 'bg-green-500/20 text-green-400',
    IN_USE: 'bg-red-500/20 text-red-400',
    MAINTENANCE: 'bg-yellow-500/20 text-yellow-400',
}

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

export default function Cars() {
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCar, setEditingCar] = useState(null)
    const [formData, setFormData] = useState({
        license_plate: '', brand: '', model: '', year: new Date().getFullYear(), status: 'AVAILABLE'
    })
    const [saving, setSaving] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, total: 0 })

    useEffect(() => {
        fetchCars()
    }, [search, statusFilter, pagination.page])

    const fetchCars = async () => {
        try {
            const response = await carsAPI.getAll({
                page: pagination.page,
                limit: 10,
                search,
                status: statusFilter
            })
            setCars(response.data.data || [])
            setPagination(prev => ({ ...prev, total: response.data.total_pages }))
        } catch (error) {
            console.error('Failed to fetch cars:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingCar) {
                await carsAPI.update(editingCar.id, formData)
            } else {
                await carsAPI.create(formData)
            }
            setModalOpen(false)
            setEditingCar(null)
            setFormData({ license_plate: '', brand: '', model: '', year: new Date().getFullYear(), status: 'AVAILABLE' })
            fetchCars()
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menyimpan data')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (car) => {
        setEditingCar(car)
        setFormData({
            license_plate: car.license_plate,
            brand: car.brand,
            model: car.model,
            year: car.year,
            status: car.status,
        })
        setModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus mobil ini?')) return
        try {
            await carsAPI.delete(id)
            fetchCars()
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menghapus')
        }
    }

    const openAddModal = () => {
        setEditingCar(null)
        setFormData({ license_plate: '', brand: '', model: '', year: new Date().getFullYear(), status: 'AVAILABLE' })
        setModalOpen(true)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manajemen Armada</h1>
                    <p className="text-gray-400 mt-1">Kelola data mobil perusahaan</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg
            hover:bg-primary-500 transition-colors"
                >
                    <Plus size={18} /> Tambah Mobil
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Cari plat nomor, brand, model..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg
              text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
            focus:outline-none focus:border-primary-500"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-200 border-b border-gray-700">
                            <tr>
                                <th className="text-left p-4 text-gray-400 font-medium">Plat Nomor</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Brand</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Model</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Tahun</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Supir</th>
                                <th className="text-right p-4 text-gray-400 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center">
                                        <Loader2 size={24} className="animate-spin text-primary-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : cars.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        <Car size={48} className="mx-auto mb-2 text-gray-600" />
                                        Tidak ada data mobil
                                    </td>
                                </tr>
                            ) : cars.map(car => (
                                <tr key={car.id} className="border-b border-gray-800 hover:bg-dark-200/50">
                                    <td className="p-4 text-white font-medium">{car.license_plate}</td>
                                    <td className="p-4 text-gray-300">{car.brand}</td>
                                    <td className="p-4 text-gray-300">{car.model}</td>
                                    <td className="p-4 text-gray-300">{car.year}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[car.status]}`}>
                                            {car.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300">{car.current_driver?.name || '-'}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleEdit(car)} className="p-2 text-gray-400 hover:text-primary-400">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(car.id)} className="p-2 text-gray-400 hover:text-red-400">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCar ? 'Edit Mobil' : 'Tambah Mobil'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Plat Nomor</label>
                        <input
                            type="text"
                            value={formData.license_plate}
                            onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            placeholder="B 1234 CD"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Brand</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500"
                                placeholder="Toyota"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Model</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500"
                                placeholder="Avanza"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Tahun</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500"
                                min="1900"
                                max="2100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-primary-500"
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="IN_USE">In Use</option>
                                <option value="MAINTENANCE">Maintenance</option>
                            </select>
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
