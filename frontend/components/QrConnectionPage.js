import React, { useState, useEffect } from 'react';
import Icon from './shared/Icon';
import { initSession, getSessionStatus } from '../services/api';

const QrConnectionPage = ({ sessionId, onConnected }) => {
    const [qrCode, setQrCode] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Menginisialisasi sesi...');

    useEffect(() => {
        // 1. Panggil API untuk memulai sesi saat komponen pertama kali dimuat
        initSession(sessionId);

        // 2. Mulai polling untuk memeriksa status setiap 3 detik
        const interval = setInterval(async () => {
            try {
                const data = await getSessionStatus(sessionId);

                if (data.isReady) {
                    setStatusMessage('Terhubung! Anda akan diarahkan kembali...');
                    setQrCode(null);
                    clearInterval(interval); // Hentikan polling
                    setTimeout(onConnected, 2000); // Panggil fungsi untuk kembali ke dasbor
                } else if (data.qr) {
                    // Gunakan API eksternal untuk membuat gambar dari string QR
                    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(data.qr)}`);
                    setStatusMessage('Silakan pindai QR code untuk terhubung.');
                } else {
                    setQrCode(null);
                    setStatusMessage(data.message || 'Menunggu status dari server...');
                }
            } catch (error) {
                setStatusMessage('Gagal terhubung ke server. Coba lagi nanti.');
                clearInterval(interval); // Hentikan polling jika ada error jaringan
            }
        }, 3000);

        // 3. Hentikan polling saat komponen ditutup untuk mencegah memory leak
        return () => clearInterval(interval);
    }, [sessionId, onConnected]);

    return (
        <div className="p-8 flex flex-col items-center justify-center h-full">
            <div className="bg-gray-800/60 rounded-xl p-8 text-center max-w-md w-full fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">Hubungkan Perangkat Baru</h2>
                <div className="bg-white p-4 rounded-lg inline-block my-6 h-72 w-72 flex items-center justify-center">
                    {qrCode ? (
                        <img src={qrCode} alt="QR Code" className="w-full h-full" />
                    ) : (
                        <Icon name="loader" className="w-16 h-16 text-gray-400 animate-spin" />
                    )}
                </div>
                <p className="text-lg font-semibold text-yellow-400">{statusMessage}</p>
            </div>
        </div>
    );
};

export default QrConnectionPage;