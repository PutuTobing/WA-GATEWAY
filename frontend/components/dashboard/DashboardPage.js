import React, { useState, useEffect } from 'react';
import Icon from '../shared/Icon';

const StatCard = ({ icon, title, value, color, delay }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const animateValue = () => {
            let startTimestamp = null;
            const duration = 1500;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                setDisplayValue(Math.floor(progress * value));
                if (progress < 1) { window.requestAnimationFrame(step); } else { setDisplayValue(value); }
            };
            animateValue();
        }; // <-- The error screenshot points here. It says "const declarations must be initialized". This is bizarre. The code looks fine.
    }, [value]);
    return (
        <div className="stat-card fade-in" style={{ animationDelay: `${delay}ms` }}>
            <Icon name={icon} className={`w-8 h-8 mb-4 ${color}`} />
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-4xl font-bold text-gray-50 mt-1">{displayValue.toLocaleString('id-ID')}</p>
        </div>
    );
};

const DashboardPage = ({ devices = [], stats = { sentCount: 0, failedCount: 0, receivedCount: 0, pendingCount: 0, contactCount: 0 }, onAddDeviceClick, onEditDevice, onDeleteDevice }) => {
    const getStatusBadge = (isReady) => {
        return isReady 
            ? 'bg-green-500/20 text-green-300' 
            : 'bg-red-500/20 text-red-300';
    };
    
    const statCards = [
        { icon: 'hard-drive', title: 'Total Perangkat', value: devices.length, color: 'text-blue-400' },
        { icon: 'arrow-up-circle', title: 'Pesan Terkirim', value: stats.sentCount, color: 'text-green-400' },
        { icon: 'x-circle', title: 'Pesan Gagal', value: stats.failedCount, color: 'text-red-400' },
        { icon: 'arrow-down-circle', title: 'Pesan Diterima', value: stats.receivedCount, color: 'text-purple-400' },
        { icon: 'loader', title: 'Pesan Pending', value: stats.pendingCount, color: 'text-yellow-400' },
        { icon: 'users', title: 'Total Kontak', value: stats.contactCount, color: 'text-indigo-400' },
    ];

    return (
        <div className="p-8">
            <header className="mb-8 fade-in">
                <h2 className="text-3xl font-bold text-white">Dasbor Monitoring</h2>
                <p className="text-gray-400 mt-1">Selamat datang kembali! Berikut ringkasan aktivitas gateway Anda.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                {statCards.map((stat, index) => <StatCard key={index} {...stat} delay={index * 100} />)}
            </div>
            <div className="bg-gray-800/60 rounded-xl p-6 fade-in" style={{animationDelay: '600ms'}}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Daftar Perangkat Terhubung</h3>
                    <button onClick={onAddDeviceClick} className="btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200 shadow-lg shadow-green-500/20">
                        <Icon name="plus" className="w-5 h-5 mr-2" /> Tambah Perangkat
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Profil</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Nomor</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Webhook</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.length > 0 ? devices.map((device, index) => (
                                <tr key={device.userId} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200 fade-in" style={{ animationDelay: `${index * 50 + 700}ms` }}>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <img className="w-10 h-10 rounded-full mr-4 bg-gray-700" src={device.profilePicUrl || 'https://placehold.co/40x40/4A5568/FFFFFF?text=?'} alt="Profile" />
                                            <div className="font-bold text-white">{device.username}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{device.number || 'N/A'}</td>
                                    <td className="p-4 text-gray-400 truncate max-w-xs">{device.webhookUrl || '-'}</td>
                                    <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusBadge(device.isReady)}`}>{device.isReady ? 'Terhubung' : 'Terputus'}</span></td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => onEditDevice(device)} className="p-2 rounded-full hover:bg-gray-600" title="Edit Webhook"><Icon name="edit" className="w-5 h-5 text-blue-400" /></button>
                                            <button onClick={() => onDeleteDevice(device)} className="p-2 rounded-full hover:bg-gray-600" title="Putuskan Koneksi"><Icon name="trash-2" className="w-5 h-5 text-red-400" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (<tr><td colSpan="5" className="text-center p-8 text-gray-500">Tidak ada perangkat terhubung.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;