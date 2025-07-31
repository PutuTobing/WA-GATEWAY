import React, { useState, useEffect } from 'react';
import Icon from './shared/Icon';

const SendMessagePage = ({ devices }) => {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [recipientNumber, setRecipientNumber] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState({ status: 'idle', message: '' }); // idle, success, error

    const connectedDevices = devices.filter(d => d.status === 'Terhubung');

    useEffect(() => {
        if (connectedDevices.length > 0 && !selectedDevice) {
            setSelectedDevice(connectedDevices[0].id);
        }
    }, [connectedDevices, selectedDevice]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDevice || !recipientNumber || !message) {
            setSendStatus({ status: 'error', message: 'Harap lengkapi semua kolom.' });
            return;
        }
        setIsSending(true);
        setSendStatus({ status: 'idle', message: '' });

        console.log('Mengirim data ke backend:', {
            deviceId: selectedDevice,
            recipient: recipientNumber,
            message: message,
        });

        setTimeout(() => {
            setIsSending(false);
            const isSuccess = Math.random() > 0.1; 
            if (isSuccess) {
                setSendStatus({ status: 'success', message: 'Pesan berhasil dikirim!' });
                setRecipientNumber('');
                setMessage('');
            } else {
                setSendStatus({ status: 'error', message: 'Gagal mengirim pesan. Silakan coba lagi.' });
            }
            setTimeout(() => setSendStatus({ status: 'idle', message: '' }), 4000);
        }, 2000);
    };

    return (
        <div className="p-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Kirim Pesan Uji Coba</h2>
                <p className="text-gray-400 mt-1">Gunakan form ini untuk mengirim pesan melalui perangkat yang terhubung.</p>
            </header>

            <div className="bg-gray-800/60 rounded-xl p-8 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="device-selector" className="block text-sm font-medium text-gray-300 mb-2">Gunakan Perangkat</label>
                        <select id="device-selector" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                            disabled={connectedDevices.length === 0}>
                            {connectedDevices.length > 0 ? (
                                connectedDevices.map(device => (
                                    <option key={device.id} value={device.id}>{device.name} ({device.number})</option>
                                ))
                            ) : (
                                <option>Tidak ada perangkat terhubung</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="recipient-number" className="block text-sm font-medium text-gray-300 mb-2">Nomor Tujuan</label>
                        <input type="text" id="recipient-number" value={recipientNumber} onChange={(e) => setRecipientNumber(e.target.value)}
                            placeholder="Contoh: 6281234567890"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                    <div>
                        <label htmlFor="message-content" className="block text-sm font-medium text-gray-300 mb-2">Isi Pesan</label>
                        <textarea id="message-content" rows="5" value={message} onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tulis pesan Anda di sini..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"></textarea>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="h-5">
                            {sendStatus.status === 'success' && <p className="text-sm text-green-400">{sendStatus.message}</p>}
                            {sendStatus.status === 'error' && <p className="text-sm text-red-400">{sendStatus.message}</p>}
                        </div>
                        <button type="submit" disabled={isSending || connectedDevices.length === 0}
                            className="btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg flex items-center transition-all duration-200 shadow-lg shadow-green-500/20 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed">
                            {isSending ? (
                                <><Icon name="loader" className="w-5 h-5 mr-2 animate-spin" /> Mengirim...</>
                            ) : (
                                <><Icon name="send" className="w-5 h-5 mr-2" /> Kirim Pesan</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default SendMessagePage;
