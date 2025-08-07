import React, { useState, useEffect } from 'react';
import IconCustom from '../shared/IconCustom';

const BACKEND_URL = 'http://172.16.31.14:3001';

function AccountManagementAdmin({ user }) {
    const [accounts, setAccounts] = useState([]);
    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/users`, {
                headers: { 'x-user-role': 'admin' }
            });
            const data = await res.json();
            setAccounts(data);
        } catch (e) {
            setNotif({ type: 'error', text: 'Gagal mengambil data akun.' });
        }
        setLoading(false);
    };
    useEffect(() => { fetchAccounts(); }, []);
    const [loading, setLoading] = useState(false);
    const [notif, setNotif] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const handleConfirm = async () => {
        if (!confirmAction) return;
        setLoading(true);
        try {
            if (confirmAction.type === 'delete') {
                const res = await fetch(`${BACKEND_URL}/api/users/${confirmAction.user.id}`, {
                    method: 'DELETE',
                    headers: { 'x-user-role': 'admin' }
                });
                const data = await res.json();
                setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
                await fetchAccounts();
            } else if (confirmAction.type === 'restore') {
                const res = await fetch(`${BACKEND_URL}/api/users/restore`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
                    body: JSON.stringify({ userId: confirmAction.user.id })
                });
                const data = await res.json();
                setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
                await fetchAccounts();
            } else if (confirmAction.type === 'accept') {
                await handleAction(confirmAction.user.id, 'accept');
            } else if (confirmAction.type === 'discard') {
                await handleAction(confirmAction.user.id, 'discard');
            } else if (confirmAction.type === 'stop') {
                await handleStopAccount(confirmAction.user.id);
            } else if (confirmAction.type === 'password') {
                await handleChangePassword();
            }
        } catch (e) {
            setNotif({ type: 'error', text: 'Aksi gagal.' });
        }
        setLoading(false);
        setConfirmAction(null);
        setTimeout(() => setNotif(null), 2000);
    };
    const handleAction = async (id, action) => {
        setLoading(true);
        try {
            let endpoint = '';
            if (action === 'accept') endpoint = '/api/users/approve';
            else if (action === 'discard') endpoint = '/api/users/discard';
            else if (action === 'restore') endpoint = '/api/users/restore';
            if (!endpoint) throw new Error('Aksi tidak valid');
            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
                body: JSON.stringify({ userId: id })
            });
            const data = await res.json();
            setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
            await fetchAccounts();
        } catch (e) {
            setNotif({ type: 'error', text: 'Gagal update status akun.' });
        }
        setLoading(false);
        setTimeout(() => setNotif(null), 2000);
    };
    const handleStopAccount = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/sessions/disconnect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
                body: JSON.stringify({ sessionId: id })
            });
            const data = await res.json();
            setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
            await fetchAccounts();
        } catch (e) {
            setNotif({ type: 'error', text: 'Gagal menghentikan akun.' });
        }
        setLoading(false);
        setTimeout(() => setNotif(null), 2000);
    };
    const handleChangePassword = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSelectedUser(null);
            setNewPassword('');
        }, 700);
    };
    return (
        <div className="w-full max-w-5xl mx-auto p-2 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Manajemen Akun</h2>
            <div className="glass-card p-2 md:p-6 rounded-2xl mb-8 w-full">
                <h3 className="text-lg font-semibold mb-4">Daftar Akun Mendaftar</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-none min-w-[340px] md:min-w-[600px] text-sm md:text-base">
                        <thead>
                            <tr className="bg-gray-800 text-gray-300 border-b border-gray-600">
                                <th className="px-2 md:px-3 py-2 break-words">Email</th>
                                <th className="px-2 md:px-3 py-2 break-words">Status</th>
                                <th className="px-2 md:px-3 py-2 break-words">Password</th>
                                <th className="px-2 md:px-3 py-2 break-words">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(acc => (
                                <tr key={acc.id} className="border-b border-gray-700">
                                    <td className="px-2 md:px-3 py-2 break-words max-w-[120px] md:max-w-none">{acc.email}</td>
                                    <td className="px-2 md:px-3 py-2">
                                        {acc.status === 'pending' ? <span className="text-yellow-400">Menunggu</span>
                                            : acc.status === 'approved' ? <span className="text-green-400">Aktif</span>
                                            : acc.status === 'active' ? <span className="text-green-400">Aktif</span>
                                            : acc.status === 'stopped' ? <span className="text-gray-400">Stopped</span>
                                            : <span className="text-red-400">Ditolak</span>}
                                    </td>
                                    <td className="px-2 md:px-3 py-2">
                                        {(acc.status === 'active' || acc.status === 'approved') && (
                                            <div className="flex flex-col items-stretch space-y-2 mt-2 w-full">
                                                <button title="Ganti Password" className="bg-blue-500 hover:bg-blue-600 text-white px-2 md:px-4 py-2 rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-sm w-full" onClick={() => setSelectedUser(acc)}>
                                                    <svg className="w-5 h-5 md:w-6 md:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-6-7a4 4 0 014 4v3H8V7a4 4 0 014-4z" /></svg>
                                                    <span className="truncate">Ganti Password</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-2 md:px-3 py-2">
                                        <div className="flex flex-col items-stretch space-y-2 mt-2 w-full">
                                            {/* Tombol Accept hanya untuk status pending */}
                                            {acc.status === 'pending' && (
                                                <button title="Terima Akun" className="bg-green-500 text-white px-2 md:px-4 py-2 rounded hover:scale-105 transition-transform flex items-center justify-center w-full mb-1" onClick={() => setConfirmAction({ type: 'accept', user: acc })}>
                                                    <span className="mr-1"><IconCustom name="accept" className="w-5 h-5 md:w-6 md:h-6" /></span> <span className="truncate">Accept</span>
                                                </button>
                                            )}
                                            {/* Tombol Pulihkan hanya untuk status rejected/discarded/ditolak */}
                                            {(acc.status === 'rejected' || acc.status === 'discarded' || acc.status?.toLowerCase() === 'ditolak') && (
                                                <button title="Pulihkan Akun" className="bg-blue-500 text-white px-2 md:px-4 py-2 rounded hover:scale-105 transition-transform flex items-center justify-center w-full mb-1" onClick={() => setConfirmAction({ type: 'restore', user: acc })}>
                                                    <span className="mr-1"><IconCustom name="restore" className="w-5 h-5 md:w-6 md:h-6" /></span> <span className="truncate">Pulihkan</span>
                                                </button>
                                            )}
                                            {(acc.status === 'pending' || acc.status === 'approved' || acc.status === 'active') && (
                                                <button title="Tolak Akun" className="bg-yellow-500 text-white px-2 md:px-4 py-2 rounded hover:scale-105 transition-transform flex items-center justify-center w-full" onClick={() => setConfirmAction({ type: 'discard', user: acc })}>
                                                    <span className="mr-1"><IconCustom name="discard" className="w-5 h-5 md:w-6 md:h-6" /></span> <span className="truncate">Discard</span>
                                                </button>
                                            )}
                                            <button title="Hapus Akun" className="bg-gray-700 text-white px-2 md:px-4 py-2 rounded hover:scale-105 transition-transform flex items-center justify-center w-full" onClick={() => setConfirmAction({ type: 'delete', user: acc })}>
                                                <span className="mr-1"><IconCustom name="trashElegant" className="w-5 h-5 md:w-6 md:h-6" /></span> <span className="truncate">Hapus</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="glass-card p-6 rounded-2xl mb-8 w-full">
                <h3 className="text-lg font-semibold mb-4">Log Aktivitas Akun</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-none min-w-[400px]">
                        <thead>
                            <tr className="bg-gray-800 text-gray-300 border-b border-gray-600">
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Aktivitas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(acc => acc.logs && acc.logs.length > 0 && (
                                <tr key={acc.id} className="border-b border-gray-700">
                                    <td className="px-3 py-2 align-top">{acc.email}</td>
                                    <td className="px-3 py-2">
                                        <ul>
                                            {acc.logs.map((log, idx) => (
                                                <li key={idx} className="mb-1">
                                                    <span className={log.type === 'login' ? 'text-green-400' : 'text-red-400'}>{log.type.toUpperCase()}</span> - <span className="text-gray-300">{log.time}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal ganti password user */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Ganti Password untuk {selectedUser.email}</h3>
                        <input type="password" className="border px-3 py-2 w-full mb-4 rounded" placeholder="Password baru" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        <div className="flex space-x-2">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:scale-105 transition-transform" onClick={async () => {
                                setLoading(true);
                                try {
                                    const res = await fetch(`${BACKEND_URL}/api/users/reset-password`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
                                        body: JSON.stringify({ userId: selectedUser.id, newPassword })
                                    });
                                    const data = await res.json();
                                    setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
                                    await fetchAccounts();
                                } catch (e) {
                                    setNotif({ type: 'error', text: 'Gagal ganti password.' });
                                }
                                setLoading(false);
                                setSelectedUser(null);
                                setNewPassword('');
                                setTimeout(() => setNotif(null), 2000);
                            }}>Simpan</button>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:scale-105 transition-transform" onClick={() => setSelectedUser(null)}>Batal</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal konfirmasi universal */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
                        <div className="mb-4 flex justify-center">
                            {confirmAction.type === 'delete' && <IconCustom name="trashElegant" className="w-10 h-10" />}
                            {confirmAction.type === 'restore' && <IconCustom name="restore" className="w-10 h-10" />}
                            {confirmAction.type === 'accept' && <IconCustom name="accept" className="w-10 h-10" />}
                            {confirmAction.type === 'discard' && <IconCustom name="discard" className="w-10 h-10" />}
                            {confirmAction.type === 'stop' && <span className="text-4xl">⏹️</span>}
                            {confirmAction.type === 'password' && <span className="text-4xl">🔒</span>}
                        </div>
                        <h3 className="text-lg font-bold mb-2">Konfirmasi Aksi</h3>
                        <p className="mb-6">
                            {confirmAction.type === 'delete' && `Apakah Anda yakin ingin menghapus akun ${confirmAction.user.email}?`}
                            {confirmAction.type === 'restore' && `Pulihkan akun ${confirmAction.user.email} agar bisa diaktifkan kembali?`}
                            {confirmAction.type === 'accept' && `Terima akun ${confirmAction.user.email}?`}
                            {confirmAction.type === 'discard' && `Tolak akun ${confirmAction.user.email}?`}
                            {confirmAction.type === 'stop' && `Hentikan sesi akun ${confirmAction.user.email}?`}
                            {confirmAction.type === 'password' && `Simpan password baru untuk ${confirmAction.user.email}?`}
                        </p>
                        <div className="flex space-x-2 justify-center">
                            <button className="bg-green-500 text-white px-4 py-2 rounded hover:scale-105 transition-transform" onClick={handleConfirm}>Ya, Lanjutkan</button>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:scale-105 transition-transform" onClick={() => setConfirmAction(null)}>Batal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountManagementAdmin;
