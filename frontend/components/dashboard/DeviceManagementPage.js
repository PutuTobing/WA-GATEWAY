import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'react-qr-code';

const BACKEND_URL = 'http://172.16.31.14:3001';

const StatCard = ({ title, value, icon, color }) => (
    <div className={`glass-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-${color}-500`}>
        <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-400`}>{icon}</div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

function DeviceManagementPage({ user, setActiveMenu }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrSessionId, setQrSessionId] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [qrError, setQrError] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [notif, setNotif] = useState(null);
    const [webhookEdits, setWebhookEdits] = useState({});
    const qrPollRef = useRef();

    // Fetch devices for current user (admin: all, user: only their own)
    const fetchDevices = useCallback(async () => {
        try {
            console.log('Fetching devices...'); // Log 1: Before fetching
            console.log('Fetching devices...'); // Log 1: Before fetching
            const res = await fetch(`${BACKEND_URL}/api/devices`, {
                headers: { 'x-user-role': user?.role || '' }
            });
            const data = await res.json();
            console.log('Data received:', data); // Log 2: After receiving data
            if (res.ok) {
                setDevices(user?.role === 'admin' ? data : data.filter(d => d.userId === user.id));
                // Log 3: After updating state - Note: state update is async, this might log the previous state immediately after setDevices call
            }
        } catch (err) {
            console.error('Error fetching devices:', err); // Add this line
            setNotif({ type: 'error', text: 'Gagal memuat perangkat.' });
        } finally {
            setLoading(false);
            console.log('Setting loading to false.'); // Log 4: In finally block

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
            console.log('Deleting session for userId:', device.userId);
            const res = await fetch(`${BACKEND_URL}/api/sessions/${device.userId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            setNotif({ type: res.ok ? 'success' : 'error', text: data.message });
            fetchDevices();
        } catch (e) {
            console.error('Error deleting session:', e);
            setNotif({ type: 'error', text: 'Gagal menghapus perangkat.' });
        }
        setTimeout(() => setNotif(null), 2000);
    };

    // Handler untuk scan QR/tambah perangkat (admin & user sama, langsung pakai user.id)
    const handleAddDeviceQr = async () => {
        const sessionId = user.id;
        setQrSessionId(sessionId);
        setShowQrModal(true);
        setQrCode(null);
        setQrError(null);
        setQrLoading(false);
        try {
            await fetch(`${BACKEND_URL}/api/sessions/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
        } catch (e) {
            setQrError('Gagal memulai sesi baru.');
        }
        let tries = 0;
        let lastQr = null;
        const poll = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/sessions/status/${sessionId}`);
                const data = await res.json();
                // Update QR code hanya jika berubah
                if (data.qr && data.qr !== lastQr) {
                    setQrCode(data.qr);
                    setQrError(null);
                    lastQr = data.qr;
                } else if (!data.qr) {
                    setQrCode(null);
                }
                // Jika sedang login (QR sudah tidak ada, tapi belum ready), tampilkan loading
                if (!data.qr && !data.isReady) {
                    setQrLoading(true);
                } else {
                    setQrLoading(false);
                }
                // Jika perangkat sudah ready, tutup modal otomatis
                if (data.isReady) {
                    setShowQrModal(false);
                    setQrLoading(false);
                    fetchDevices(); // Refresh list immediately after device is ready
                    return;
                }
                tries++;
                if (tries > 30) {
                    setQrError('Gagal memuat QR. Silakan coba lagi nanti.');
                    setQrLoading(false);
                    return;
                }
            } catch (err) {
                setQrCode(null);
                setQrError('Gagal memuat QR. Cek koneksi atau server.');
                setQrLoading(false);
                return;
            }
            if (qrPollRef.current) {
                qrPollRef.current = setTimeout(poll, 2000);
            }
        };
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
                        onClick={handleAddDeviceQr}
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
                                    <tr key={dev.sessionId} className="border-b border-gray-700">
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
                                        </td> {/* TODO: Change webhookEdits key to dev.sessionId */}
                                        <td className="px-3 py-2 flex gap-2">
                                            <button title={dev.isReady ? 'Scan Ulang QR' : 'Scan QR'} className={dev.isReady ? 'bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded flex items-center' : 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded flex items-center'} onClick={() => handleAddDeviceQr()}>
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
                            {qrError ? (
                                <span className="text-red-400">{qrError}</span>
                            ) : qrLoading ? (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <span className="text-blue-300">Login WhatsApp, mohon tunggu...</span>
                                </div>
                            ) : qrCode ? (
                                <div style={{background:'#fff',padding:24,borderRadius:8,display:'inline-block'}}>
                                    <QRCode value={qrCode} size={220} bgColor="#fff" fgColor="#000" />
                                </div>
                            ) : (
                                <span className="text-gray-400">Memuat QR...</span>
                            )}
                        </div>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:scale-105 transition-transform mt-4" onClick={() => setShowQrModal(false)}>Tutup</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeviceManagementPage;
