import { useState, useEffect } from 'react'
import { driversAPI } from '../services/api'
import { Users, Plus, Search, Edit2, Trash2, X, Loader2, Phone, CreditCard } from 'lucide-react'

const statusColors = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    OFF_DUTY: 'bg-gray-500/20 text-gray-400',
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

export default function Drivers() {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingDriver, setEditingDriver] = useState(null)
    const [formData, setFormData] = useState({
        name: '', phone_number: '', license_number: '', status: 'OFF_DUTY'
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchDrivers()
    }, [search, statusFilter])

    const fetchDrivers = async () => {
        try {
            const response = await driversAPI.getAll({ limit: 100, search, status: statusFilter })
            setDrivers(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch drivers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingDriver) {
                await driversAPI.update(editingDriver.id, formData)
            } else {
                await driversAPI.create(formData)
            }
            setModalOpen(false)
            setEditingDriver(null)
            setFormData({ name: '', phone_number: '', license_number: '', status: 'OFF_DUTY' })
            fetchDrivers()
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menyimpan data')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (driver) => {
        setEditingDriver(driver)
        setFormData({
            name: driver.name,
            phone_number: driver.phone_number,
            license_number: driver.license_number,
            status: driver.status,
        })
        setModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus supir ini?')) return
        try {
            await driversAPI.delete(id)
            fetchDrivers()
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menghapus')
        }
    }

    const openAddModal = () => {
        setEditingDriver(null)
        setFormData({ name: '', phone_number: '', license_number: '', status: 'OFF_DUTY' })
        setModalOpen(true)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manajemen Supir</h1>
                    <p className="text-gray-400 mt-1">Kelola data supir perusahaan</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg
            hover:bg-primary-500 transition-colors"
                >
                    <Plus size={18} /> Tambah Supir
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Cari nama, nomor HP, SIM..."
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
                    <option value="">Semua Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="OFF_DUTY">Off Duty</option>
                </select>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="animate-spin text-primary-500" />
                </div>
            ) : drivers.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                    <Users size={48} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-white mb-2">Belum ada data supir</h3>
                    <p className="text-gray-400">Klik tombol "Tambah Supir" untuk menambahkan</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drivers.map(driver => (
                        <div key={driver.id} className="glass rounded-xl p-6 card-hover">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center">
                                        <Users size={24} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{driver.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[driver.status]}`}>
                                            {driver.status === 'ACTIVE' ? 'Aktif' : 'Off Duty'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(driver)} className="p-2 text-gray-400 hover:text-primary-400">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(driver.id)} className="p-2 text-gray-400 hover:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Phone size={14} />
                                    <span>{driver.phone_number || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <CreditCard size={14} />
                                    <span>SIM: {driver.license_number || '-'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingDriver ? 'Edit Supir' : 'Tambah Supir'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            placeholder="Nama supir"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Nomor HP</label>
                        <input
                            type="text"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            placeholder="08xxx"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Nomor SIM</label>
                        <input
                            type="text"
                            value={formData.license_number}
                            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white
                focus:outline-none focus:border-primary-500"
                            placeholder="Nomor SIM"
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
                            <option value="OFF_DUTY">Off Duty</option>
                            <option value="ACTIVE">Active</option>
                        </select>
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
