import React, { useState, useEffect, useRef, useCallback } from 'react';
import IconCustom from '../components/shared/IconCustom';
import Head from 'next/head';
import { useRouter } from 'next/router';
import QRCode from "react-qr-code";

// --- Variabel Lingkungan untuk URL Backend ---
// Gunakan alamat IP server aplikasi Anda di sini
const BACKEND_URL = 'http://172.16.31.14:3001';

// --- Custom Hook untuk Idle Timeout ---
const useIdleTimeout = ({ onIdle, idleTime = 5 }) => {
  const router = useRouter();
  const timeoutId = useRef(null);
  const idleTimeInMilliseconds = idleTime * 60 * 1000;
  const startTimer = useCallback(() => { timeoutId.current = setTimeout(onIdle, idleTimeInMilliseconds); }, [onIdle, idleTimeInMilliseconds]);
  const resetTimer = useCallback(() => { clearTimeout(timeoutId.current); startTimer(); }, [startTimer]);
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    startTimer();
    return () => { clearTimeout(timeoutId.current); events.forEach(event => window.removeEventListener(event, resetTimer)); };
  }, [resetTimer, startTimer, router]);
};

// --- Komponen Ikon ---
const LogoIcon = () => <svg className="w-8 h-8 text-orange-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
const menuIcons = { 'Koneksi & QR': <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>, 'Kirim Pesan': <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>, 'History Pesan': <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>, 'Manajemen Perangkat': <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> };
const LogoutIcon = () => <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;

export default function DashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [activeMenu, setActiveMenu] = useState('Koneksi & QR');
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    // Manajemen Perangkat selalu muncul untuk semua user
    const baseMenuItems = ['Manajemen Perangkat', 'Koneksi & QR', 'Kirim Pesan', 'History Pesan'];
    const adminMenuItems = baseMenuItems;

    useEffect(() => {
        setIsLoadingMenu(true);
        const timer = setTimeout(() => setIsLoadingMenu(false), 500);
        return () => clearTimeout(timer);
    }, [activeMenu]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }, [router]);

    useIdleTimeout({ onIdle: handleLogout, idleTime: 5 });

    useEffect(() => {
        const token = localStorage.getItem('token');
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!token || !userData) {
                router.push('/login');
            } else {
                setUser(userData);
                if (userData.role === 'admin') {
                    setActiveMenu('Manajemen Perangkat');
                } else {
                    setActiveMenu('Koneksi & QR');
                }
                setIsLoading(false);
            }
        } catch (error) {
            handleLogout();
        }
    }, [router, handleLogout]);

    const menuItems = baseMenuItems;

    // (Sudah dideklarasikan di atas, hapus duplikat ini)

    if (isLoading) {
        return (<div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div><p className="mt-4">Memverifikasi sesi...</p></div>);
    }
    
    return (
        <>
            <Head><title>Dashboard - BTD Gateway</title></Head>
            <div className="bg-slate-900 text-gray-200 min-h-screen">
                <div className="aurora-background"></div>
                <div className="relative min-h-screen lg:flex">
                    <div className="lg:hidden flex justify-between items-center p-4 text-white bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
                        <div className="flex items-center"><LogoIcon /><h1 className="text-lg font-bold">BTD Gateway</h1></div>
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="z-50"><MenuIcon /></button>
                    </div>
                    <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-sidebar flex-shrink-0 flex flex-col p-4 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="hidden lg:flex items-center mb-10 px-2"><LogoIcon /><h1 className="text-xl font-bold text-white">BTD Gateway</h1></div>
                        <nav className="flex-grow mt-10 lg:mt-0">
                            <ul className="space-y-2">
                                {menuItems.map((item) => (
                                    <li key={item}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveMenu(item); setSidebarOpen(false); }} className={`nav-item flex items-center py-2.5 px-4 rounded-lg transition-all duration-200 ${activeMenu === item ? 'bg-orange-500/30 text-white font-semibold' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                                            {menuIcons[item]} {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        {/* Menu Manajemen Akun di bawah, di atas tombol logout */}
                        <div className="mb-2">
                            <a href="#" onClick={(e) => { e.preventDefault(); setActiveMenu('Manajemen Akun'); setSidebarOpen(false); }} className={`nav-item flex items-center py-2.5 px-4 rounded-lg transition-all duration-200 ${activeMenu === 'Manajemen Akun' ? 'bg-orange-500/30 text-white font-semibold' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                                {/* Icon akun */}
                                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.8 5.879 2.138M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Manajemen Akun
                            </a>
                        </div>
                        <div><a href="#" onClick={handleLogout} className="flex items-center w-full py-2.5 px-4 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"><LogoutIcon />Logout</a></div>
                    </aside>
                    <main className="flex-1 p-6 md:p-10">
                        {/* Animasi loading saat menu berganti */}
                        {isLoadingMenu && (
                            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        {activeMenu === 'Manajemen Perangkat' && <DeviceManagementPage user={user} setActiveMenu={setActiveMenu} />}
                        {user?.role === 'admin' && activeMenu === 'Manajemen Akun' && <AccountManagementAdmin user={user} />}
                        {user?.role === 'customer' && activeMenu === 'Manajemen Akun' && <AccountManagementUser user={user} setUser={setUser} />}
                        {user?.role === 'customer' && activeMenu === 'Koneksi & QR' && <ConnectionPage user={user} />}
                        {user?.role === 'customer' && activeMenu === 'Kirim Pesan' && <SendMessagePage user={user} />}
                        {user?.role === 'customer' && activeMenu === 'History Pesan' && <HistoryPage user={user} />}
                    </main>
                </div>
            </div>
        </>
    );
}

// --- KOMPONEN-KOMPONEN HALAMAN ---
// Komponen Manajemen Akun untuk Admin
function AccountManagementAdmin({ user }) {
    const [accounts, setAccounts] = useState([]);
    // Ambil data akun dari backend
    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://172.16.31.14:3001/api/users', {
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
    const [confirmAction, setConfirmAction] = useState(null); // { type, user }
    // Modal konfirmasi universal
    const handleConfirm = async () => {
        if (!confirmAction) return;
        setLoading(true);
        try {
            if (confirmAction.type === 'delete') {
                const res = await fetch(`http://172.16.31.14:3001/api/users/${confirmAction.user.id}`, {
                    method: 'DELETE',
                    headers: { 'x-user-role': 'admin' }
                });
                const data = await res.json();
                setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
                await fetchAccounts();
            } else if (confirmAction.type === 'restore') {
                // Pulihkan akun ke pending
                const res = await fetch(`http://172.16.31.14:3001/api/users/restore`, {
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

    // Animasi loading saat aksi
    const handleAction = async (id, action) => {
        setLoading(true);
        try {
            let endpoint = '';
            if (action === 'accept') endpoint = '/api/users/approve';
            else if (action === 'discard') endpoint = '/api/users/discard';
            else if (action === 'restore') endpoint = '/api/users/restore';
            if (!endpoint) throw new Error('Aksi tidak valid');
            const res = await fetch(`http://172.16.31.14:3001${endpoint}`, {
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

    // Fungsi hentikan akun (stop session)
    const handleStopAccount = async (id) => {
        setLoading(true);
        try {
            const res = await fetch('http://172.16.31.14:3001/api/sessions/disconnect', {
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
                                    const res = await fetch('http://172.16.31.14:3001/api/users/reset-password', {
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

// Komponen Manajemen Akun untuk User
function AccountManagementUser({ user, setUser }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notif, setNotif] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://172.16.31.14:3001/api/users', {
                    headers: { 'x-user-role': 'admin' }
                });
                if (res.ok) {
                    const data = await res.json();
                    const found = data.find(u => u.id === user.id);
                    if (found) {
                        setUser && setUser(found);
                    }
                }
            } catch (e) {}
        };
        fetchUser();
    }, []);
    const isActive = user?.status === 'approved';
    const handleChangePassword = async () => {
        if (!isActive) return;
        if (!oldPassword || !newPassword || !confirmPassword) {
            setNotif({ type: 'error', text: 'Semua kolom wajib diisi.' });
            setTimeout(() => setNotif(null), 2000);
            return;
        }
        if (newPassword !== confirmPassword) {
            setNotif({ type: 'error', text: 'Password baru dan verifikasi tidak sama.' });
            setTimeout(() => setNotif(null), 2000);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://172.16.31.14:3001/api/users/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-role': 'customer' },
                body: JSON.stringify({ userId: user.id, oldPassword, newPassword })
            });
            const data = await res.json();
            setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
        } catch (e) {
            setNotif({ type: 'error', text: 'Gagal ganti password.' });
        }
        setLoading(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setNotif(null), 2000);
    };
    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">Ganti Password Akun</h2>
            {loading && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"><div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div></div>}
            {notif && (
                <div className={`mb-4 px-4 py-2 rounded text-white ${notif.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{notif.text}</div>
            )}
            <div className="glass-card p-6 rounded-2xl">
                <input type="password" className="border px-3 py-2 w-full mb-4 rounded" placeholder="Password lama" value={oldPassword} onChange={e => setOldPassword(e.target.value)} disabled={!isActive} />
                <input type="password" className="border px-3 py-2 w-full mb-4 rounded" placeholder="Password baru" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={!isActive} />
                <input type="password" className="border px-3 py-2 w-full mb-4 rounded" placeholder="Verifikasi password baru" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={!isActive} />
                <button className={`bg-blue-500 text-white px-4 py-2 rounded hover:scale-105 transition-transform w-full ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleChangePassword} disabled={!isActive}>Simpan Password Baru</button>
                {!isActive && <p className="text-sm text-yellow-400 mt-2">Akun Anda belum aktif. Ganti password hanya tersedia untuk akun aktif.</p>}
            </div>
        </div>
    );
}

function ConnectionPage({ user }) {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');
    const sessionId = user?.id;

    const initializeSession = async () => {
        if (!sessionId) return;
        setStatus(null);
        try {
            await fetch(`${BACKEND_URL}/api/sessions/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
        } catch (err) {
            setError('Gagal memulai sesi baru.');
        }
    };

    useEffect(() => {
        if (!sessionId) return;
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/sessions/status/${sessionId}`);
                const data = await res.json();
                setStatus(data);
                if (res.ok) setError('');
            } catch (err) {
                setError('Tidak dapat terhubung ke server backend.');
                setStatus(null);
            }
        };
        const intervalId = setInterval(fetchStatus, 3000);
        return () => clearInterval(intervalId);
    }, [sessionId]);

    const renderContent = () => {
        if (error) return { icon: <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, title: "Koneksi Gagal", message: error, color: 'red' };
        if (!status) return { icon: <svg className="w-12 h-12 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24"><path d="M12 4.75V6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17.1266 6.87347L16.0659 7.93413" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19.25 12L17.75 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17.1266 17.1265L16.0659 16.0659" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 19.25V17.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M6.87347 17.1265L7.93413 16.0659" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M4.75 12L6.25 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M6.87347 6.87347L7.93413 7.93413" stroke="currentColor" strokeWidth="2" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>, title: "Memuat Status...", message: "Menghubungi server...", color: 'gray' };
        if (status.isReady) return { icon: <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, title: "Bot Siap Digunakan!", message: status.message, color: 'green' };
        if (status.qr) return { icon: <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M4 12H3m1.636-6.364l.707.707M12 20v-1m6.364-6.364l-.707-.707M6.343 6.343l-.707-.707"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>, title: "Pindai untuk Menghubungkan", message: status.message, color: 'blue' };
        return { icon: <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364"></path></svg>, title: "Sesi Tidak Aktif", message: status.message, color: 'yellow' };
    };

    const { title, message, color, icon } = renderContent();

    return (
        <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl shadow-black/20 p-8 text-center">
            <div className={`mx-auto w-24 h-24 flex items-center justify-center bg-${color}-500/10 rounded-full mb-4`}>{icon}</div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className={`text-gray-400 mt-2 text-${color}-400`}>{message}</p>
            <div className="my-8 border-b border-slate-700/50"></div>
            <div className="h-56 flex items-center justify-center">
                {status?.qr ? (
                    <div className="bg-white p-4 rounded-lg inline-block shadow-lg"><QRCode value={status.qr} size={200} /></div>
                ) : (
                    <button onClick={initializeSession} className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
                        Hubungkan Perangkat
                    </button>
                )}
            </div>
        </div>
    );
}

function SendMessagePage({ user }) {
    const [number, setNumber] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', text: '' });
    const sessionId = user?.id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ type: '', text: '' });

        try {
            const res = await fetch(`${BACKEND_URL}/api/sessions/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, number, message })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal mengirim pesan.');
            
            setFeedback({ type: 'success', text: data.message });
            setNumber('');
            setMessage('');
        } catch (err) {
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
            setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
        }
    };

    return (
        <div className="w-full max-w-2xl glass-card rounded-2xl shadow-2xl shadow-black/20 p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Kirim Pesan Manual</h2>
                <p className="text-gray-400 mt-2">Kirim pesan WhatsApp ke nomor tujuan melalui sesi Anda yang terhubung.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-300 mb-2">Nomor Tujuan</label>
                    <input type="text" id="number" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-orange-500" placeholder="Contoh: 6281234567890" required />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Isi Pesan</label>
                    <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows="5" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-orange-500" placeholder="Ketik pesan Anda di sini..." required></textarea>
                </div>

                {feedback.text && (
                    <div className={`text-sm text-center p-3 rounded-lg ${feedback.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {feedback.text}
                    </div>
                )}

                <div className="text-right">
                    <button type="submit" disabled={isLoading} className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500 transform hover:-translate-y-0.5 transition-all disabled:opacity-50">
                        {isLoading ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>) : (<svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>)}
                        {isLoading ? 'Mengirim...' : 'Kirim Pesan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function HistoryPage({ user }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const sessionId = user?.id;

    useEffect(() => {
        if (!sessionId) return;
        const fetchLogs = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/sessions/logs/${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Gagal mengambil log:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [sessionId]);

    return (
        <div className="w-full max-w-4xl glass-card rounded-2xl shadow-2xl shadow-black/20 p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Riwayat Pesan Masuk</h2>
            <div className="overflow-y-auto h-[60vh]">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-800/80 backdrop-blur-sm">
                        <tr className="border-b border-slate-700">
                            <th className="p-4 w-1/4">Waktu</th>
                            <th className="p-4 w-1/4">Pengirim</th>
                            <th className="p-4 w-1/2">Pesan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="text-center p-8 text-gray-400">Memuat riwayat pesan...</td></tr>
                        ) : logs.length > 0 ? (
                            logs.map(log => (
                                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="p-4 text-sm text-gray-400">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                                    <td className="p-4 font-medium">{log.sender.replace('@c.us', '')}</td>
                                    <td className="p-4 whitespace-pre-wrap break-words">{log.message}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center p-8 text-gray-400">Belum ada pesan yang diterima.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DeviceManagementPage({ user, setActiveMenu }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrSessionId, setQrSessionId] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [notif, setNotif] = useState(null);
    const [webhookEdits, setWebhookEdits] = useState({});

    // Fetch devices for current user (admin: all, user: only their own)
    const fetchDevices = useCallback(async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/devices`, {
                headers: { 'x-user-role': user?.role || '' }
            });
            const data = await res.json();
            if (res.ok) {
                setDevices(user?.role === 'admin' ? data : data.filter(d => d.userId === user.id));
            }
        } catch (err) {
            setNotif({ type: 'error', text: 'Gagal memuat perangkat.' });
        } finally {
            setLoading(false);
        }
    }, [user]);
    // Handler Simpan Webhook
    const handleSaveWebhook = async (device) => {
        const url = webhookEdits[device.userId] ?? device.webhookUrl;
        try {
            const res = await fetch(`${BACKEND_URL}/api/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: device.userId, url })
            });
            const data = await res.json();
            setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
            fetchDevices();
        } catch (e) {
            setNotif({ type: 'error', text: 'Gagal menyimpan webhook.' });
        }
        setTimeout(() => setNotif(null), 2000);
    };

    // Handler Hapus Perangkat
    const handleDeleteDevice = async (device) => {
        if (!window.confirm('Yakin ingin menghapus perangkat ini?')) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/${device.userId}`, {
                method: 'DELETE',
                headers: { 'x-user-role': user?.role || '' }
            });
            const data = await res.json();
            setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
            fetchDevices();
        } catch (e) {
            setNotif({ type: 'error', text: 'Gagal menghapus perangkat.' });
        }
        setTimeout(() => setNotif(null), 2000);
    };

    // Handler Scan QR/Scan Ulang QR
    // Ref polling QR agar bisa dibersihkan
    const qrPollRef = useRef();
    const handleShowQr = async (device) => {
        console.log('handleShowQr dipanggil dengan device:', device);
        if (!device || !device.userId) {
            console.warn('Device tidak valid:', device);
            return;
        }
        setQrSessionId(device.userId);
        setShowQrModal(true);
        setQrCode(null);
        // Mulai sesi baru (atau ulangi)
        try {
            const res = await fetch(`${BACKEND_URL}/api/sessions/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: device.userId })
            });
            console.log('Request /api/sessions/init response:', res.status);
        } catch (e) {
            console.error('Error fetch /api/sessions/init:', e);
        }
        // Polling QR selama modal terbuka
        let tries = 0;
        const poll = async () => {
            if (!device.userId) return;
            try {
                const res = await fetch(`${BACKEND_URL}/api/sessions/status/${device.userId}`);
                const data = await res.json();
                console.log('Polling /api/sessions/status:', data);
                if (data.qr) setQrCode(data.qr);
                // Jika perangkat sudah ready, tutup modal otomatis
                if (data.isReady) {
                    setShowQrModal(false);
                    return;
                }
            } catch (err) {
                setQrCode(null);
                console.error('Error polling /api/sessions/status:', err);
            }
            tries++;
            // Lanjut polling jika modal masih terbuka dan belum lebih dari 30x
            if (tries <= 30 && qrPollRef.current) {
                qrPollRef.current = setTimeout(poll, 2000);
            }
        };
        // Mulai polling dan simpan ref timeout
        qrPollRef.current = setTimeout(poll, 0);
    };

    // Cleanup polling jika modal ditutup
    useEffect(() => {
        if (!showQrModal && qrPollRef.current) {
            clearTimeout(qrPollRef.current);
            qrPollRef.current = null;
        }
        // Cleanup on unmount
        return () => {
            if (qrPollRef.current) {
                clearTimeout(qrPollRef.current);
                qrPollRef.current = null;
            }
        };
    }, [showQrModal]);

    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, [fetchDevices]);

    // Statistik dinamis
    const totalSent = devices.reduce((sum, dev) => sum + (dev.sentCount || 0), 0);
    const totalReceived = devices.reduce((sum, dev) => sum + (dev.receivedCount || 0), 0);
    const totalConnected = devices.filter(dev => dev.isReady).length;

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Perangkat" value={devices.length} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>} color="blue" />
                <StatCard title="Perangkat Terhubung" value={totalConnected} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>} color="green" />
                <StatCard title="Pesan Terkirim" value={totalSent} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>} color="green" />
                <StatCard title="Pesan Diterima" value={totalReceived} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>} color="yellow" />
                <StatCard title="Status Server" value="Online" icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>} color="indigo" />
            </div>

            <div className="glass-card rounded-2xl shadow-2xl shadow-black/20 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">Daftar Perangkat Terhubung</h2>
                    <button
                        onClick={() => { setQrSessionId(user.id); setShowQrModal(true); setQrCode(null); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Tambah Perangkat
                    </button>
                </div>
                {notif && <div className={`mb-4 px-4 py-2 rounded text-white ${notif.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{notif.text}</div>}
                {loading ? <p className="text-gray-400">Memuat perangkat...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-none min-w-[700px] text-sm md:text-base">
                            <thead>
                                <tr className="bg-gray-800 text-gray-300 border-b border-gray-600">
                                    <th className="px-3 py-2">No</th>
                                    <th className="px-3 py-2">Profil</th>
                                    <th className="px-3 py-2">Nomor WA</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Webhook</th>
                                    <th className="px-3 py-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center p-8 text-gray-400">Belum ada perangkat terhubung.</td></tr>
                                ) : devices.map((dev, idx) => (
                                    <tr key={dev.userId} className="border-b border-gray-700">
                                        <td className="px-3 py-2">{idx + 1}</td>
                                        <td className="px-3 py-2">
                                            {dev.profilePicUrl ? <img src={dev.profilePicUrl} alt="Profil" className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">?</div>}
                                        </td>
                                        <td className="px-3 py-2">{dev.number || '-'}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${dev.isReady ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{dev.isReady ? 'Terhubung' : 'Terputus'}</span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input type="text" className="border px-2 py-1 rounded w-44 bg-slate-800 text-white" value={(webhookEdits[dev.userId] ?? dev.webhookUrl) || ''} onChange={e => setWebhookEdits(edits => ({ ...edits, [dev.userId]: e.target.value }))} />
                                        </td>
                                        <td className="px-3 py-2 flex gap-2">
                                            <button title={dev.isReady ? 'Scan Ulang QR' : 'Scan QR'} className={dev.isReady ? 'bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded flex items-center' : 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded flex items-center'} onClick={() => handleShowQr(dev)}>
                                                {dev.isReady ? (
                                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-4.553a1.5 1.5 0 00-2.121-2.121L13 7.879M9 14l-4.553 4.553a1.5 1.5 0 002.121 2.121L11 16.121" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7V5a2 2 0 012-2h2M7 3h10a2 2 0 012 2v2M21 7v10a2 2 0 01-2 2h-2m2 0v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m0 0H5a2 2 0 01-2-2V7" /></svg>
                                                )}
                                                {dev.isReady ? 'Scan Ulang' : 'Scan QR'}
                                            </button>
                                            <button title="Hapus Perangkat" className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center" onClick={() => handleDeleteDevice(dev)}>
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>Hapus
                                            </button>
                                            <button title="Simpan Webhook" className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded flex items-center" onClick={() => handleSaveWebhook(dev)}>
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Simpan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Modal QR Scan Tambah/Scan Ulang Perangkat */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
                        <h3 className="text-lg font-bold mb-4 text-white">Scan QR untuk Menautkan Perangkat</h3>
                        <div className="my-4 flex justify-center items-center min-h-[220px]">
                            {qrCode ? <QRCode value={qrCode} size={200} /> : <span className="text-gray-400">Memuat QR...</span>}
                        </div>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:scale-105 transition-transform mt-4" onClick={() => setShowQrModal(false)}>Tutup</button>
                    </div>
                </div>
            )}
        </div>
    );
}


const StatCard = ({ title, value, icon, color }) => (
    <div className={`glass-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-${color}-500`}>
        <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-400`}>{icon}</div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const DeviceCard = ({ device }) => {
    // ... (kode lengkap DeviceCard dari respons sebelumnya) ...
}
