import React, { useState, useEffect, useCallback } from 'react';
import Icon from './shared/Icon';
import { getUsers, approveUser, resetUserPassword, deleteUser, updateUserRole, changeMyPassword, getActivityLogs } from '../services/api';
import { useToast } from '../context/ToastContext';

const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [currentRole, setCurrentRole] = useState('');

    useEffect(() => {
        if (user) {
            setCurrentRole(user.role);
            setNewPassword('');
        }
    }, [user]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(user.id, newPassword, currentRole);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md m-4 fade-in">
                <h3 className="text-xl font-bold text-white mb-2">Edit Pengguna: {user.username}</h3>
                <p className="text-sm text-gray-400 mb-6">{user.email}</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Reset Kata Sandi</label>
                        <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Masukkan sandi baru (opsional)" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Peran Pengguna</label>
                        <select value={currentRole} onChange={e => setCurrentRole(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                            <option value="user">User (Pengguna)</option>
                            <option value="admin">Admin (Administrator)</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end mt-8 space-x-3">
                    <button onClick={onClose} className="btn-press bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Batal</button>
                    <button onClick={handleSave} className="btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Simpan Perubahan</button>
                </div>
            </div>
        </div>
    );
};

const DeleteUserModal = ({ user, isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md m-4 fade-in">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                        <Icon name="trash-2" className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Hapus Pengguna?</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        Apakah Anda yakin ingin menghapus akun <strong className="text-white">{user?.username}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
                <div className="flex justify-center mt-8 space-x-3">
                    <button onClick={onClose} className="btn-press bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Batal</button>
                    <button onClick={() => onConfirm(user.id)} className="btn-press bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Hapus</button>
                </div>
            </div>
        </div>
    );
};

const AdminView = ({ users, logs, onApproveUser, onEditUser, onDeleteUser }) => {
    const [selectedLogUser, setSelectedLogUser] = useState('all');

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-300';
            case 'pending': return 'bg-yellow-500/20 text-yellow-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    const filteredLogs = selectedLogUser === 'all' 
        ? Object.values(logs).flat().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        : (logs[selectedLogUser] || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <>
            <div className="bg-gray-800/60 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Manajemen Pengguna</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Pengguna</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Login Terakhir</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 fade-in" style={{ animationDelay: `${index * 50}ms`}}>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{user.username}</div>
                                        <div className="text-sm text-gray-400">{user.email}</div>
                                    </td>
                                    <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusBadge(user.status)}`}>{user.status}</span></td>
                                    <td className="p-4 text-gray-300">{user.lastLogin || '-'}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            {user.status === 'pending' && <button onClick={() => onApproveUser(user.id)} className="p-2 rounded-full hover:bg-gray-600" title="Setujui"><Icon name="check-circle" className="w-5 h-5 text-green-400" /></button>}
                                            <button onClick={() => onEditUser(user)} className="p-2 rounded-full hover:bg-gray-600" title="Edit Pengguna"><Icon name="edit" className="w-5 h-5 text-blue-400" /></button>
                                            {user.role !== 'admin' && <button onClick={() => onDeleteUser(user)} className="p-2 rounded-full hover:bg-gray-600" title="Hapus Pengguna"><Icon name="trash-2" className="w-5 h-5 text-red-400" /></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Log Aktivitas Pengguna</h3>
                    <select value={selectedLogUser} onChange={(e) => setSelectedLogUser(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                        <option value="all">Semua Pengguna</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-3 text-sm font-semibold text-gray-400 uppercase">Waktu</th>
                                <th className="p-3 text-sm font-semibold text-gray-400 uppercase">Pengguna</th>
                                <th className="p-3 text-sm font-semibold text-gray-400 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr key={index} className="border-b border-gray-700">
                                    <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-white">{log.user}</td>
                                    <td className="p-3 text-gray-300">{log.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const UserView = ({ currentUser, logs }) => {
    const showToast = useToast();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi tidak cocok.');
            return;
        }
        if (!oldPassword || !newPassword) {
            setError('Semua kolom wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await changeMyPassword(currentUser.id, oldPassword, newPassword);
            showToast(response.message, 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Gagal mengubah kata sandi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-gray-800/60 rounded-xl p-8 mb-8 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Ganti Kata Sandi</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kata Sandi Lama</label>
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kata Sandi Baru</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Konfirmasi Kata Sandi Baru</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="w-full btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg disabled:bg-gray-500">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Log Aktivitas Saya</h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-3 text-sm font-semibold text-gray-400 uppercase">Waktu</th>
                                <th className="p-3 text-sm font-semibold text-gray-400 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(logs || []).map((log, index) => (
                                <tr key={index} className="border-b border-gray-700">
                                    <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-gray-300">{log.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const AccountManagementPage = ({ currentUser }) => {
    const showToast = useToast();
    const [userAccounts, setUserAccounts] = useState([]);
    const [activityLogs, setActivityLogs] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = useCallback(async () => {
        if (currentUser.role === 'admin') {
            try {
                setIsLoading(true);
                const [users, logs] = await Promise.all([
                    getUsers(),
                    getActivityLogs()
                ]);
                setUserAccounts(users);
                setActivityLogs(logs);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Untuk user biasa, kita bisa fetch log spesifik mereka
            try {
                const allLogs = await getActivityLogs();
                setActivityLogs({ [currentUser.id]: allLogs[currentUser.id] || [] });
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApproveUser = async (userId) => {
        try {
            const response = await approveUser(userId);
            showToast(response.message, 'success');
            fetchData();
        } catch (error) {
            showToast(`Gagal: ${error.message}`, 'error');
        }
    };

    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleSaveChanges = async (userId, newPassword, newRole) => {
        try {
            if (newPassword) {
                await resetUserPassword(userId, newPassword);
                showToast('Kata sandi berhasil direset.', 'success');
            }
            const userToUpdate = userAccounts.find(u => u.id === userId);
            if (userToUpdate && userToUpdate.role !== newRole) {
                await updateUserRole(userId, newRole);
                showToast('Peran pengguna berhasil diubah.', 'success');
            }
            fetchData();
        } catch (err) {
            showToast(`Gagal menyimpan perubahan: ${err.message}`, 'error');
        }
    };

    const handleConfirmDelete = async (userId) => {
        try {
            await deleteUser(userId);
            showToast('Pengguna berhasil dihapus.', 'success');
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (err) {
            showToast(`Gagal menghapus pengguna: ${err.message}`, 'error');
        }
    };

    return (
        <>
            <div className="p-8">
                <header className="mb-8 fade-in">
                    <h2 className="text-3xl font-bold text-white">Manajemen Akun</h2>
                    <p className="text-gray-400 mt-1">
                        {currentUser.role === 'admin' 
                            ? 'Kelola semua pengguna dan lihat log aktivitas.' 
                            : 'Kelola profil dan lihat aktivitas Anda.'}
                    </p>
                </header>

                {isLoading && <div className="text-center text-gray-400">Memuat data...</div>}
                {error && <div className="text-center text-red-400">Error: {error}</div>}
                
                {!isLoading && !error && (
                    currentUser.role === 'admin' 
                        ? <AdminView users={userAccounts} logs={activityLogs} onApproveUser={handleApproveUser} onEditUser={handleOpenEditModal} onDeleteUser={handleOpenDeleteModal} /> 
                        : <UserView currentUser={currentUser} logs={activityLogs[currentUser.id]} />
                )}
            </div>
            <EditUserModal user={selectedUser} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveChanges} />
            <DeleteUserModal user={selectedUser} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} />
        </>
    );
};

export default AccountManagementPage;