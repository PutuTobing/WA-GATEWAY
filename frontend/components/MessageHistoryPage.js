import React from 'react';
import Icon from './shared/Icon';

const MessageHistoryPage = ({ history, devices }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'SENT': return 'bg-green-500/20 text-green-300';
            case 'FAILED': return 'bg-red-500/20 text-red-300';
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="p-8">
            <header className="mb-8 fade-in">
                <h2 className="text-3xl font-bold text-white">History Pesan</h2>
                <p className="text-gray-400 mt-1">Lacak semua pesan yang telah dikirim melalui gateway.</p>
            </header>

            <div className="bg-gray-800/60 rounded-xl p-6 fade-in" style={{animationDelay: '100ms'}}>
                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Cari pesan / tujuan..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                        <option value="">Semua Device</option>
                        {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                        <option value="">Semua Status</option>
                        <option value="SENT">Sent</option>
                        <option value="FAILED">Failed</option>
                        <option value="PENDING">Pending</option>
                    </select>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Waktu Dibuat</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Device</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Tujuan</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Isi Pesan</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200 fade-in" style={{ animationDelay: `${index * 50 + 200}ms` }}>
                                    <td className="p-4 text-gray-300 align-top">
                                        <div>{item.createdAt.date}</div>
                                        <div className="text-xs text-gray-500">{item.createdAt.time}</div>
                                    </td>
                                    <td className="p-4 text-gray-300 align-top">{item.device}</td>
                                    <td className="p-4 text-gray-300 align-top">{item.recipient}</td>
                                    <td className="p-4 text-gray-300 align-top max-w-sm">
                                        <span className={`text-xs font-bold ${item.type === 'TEXT' ? 'text-blue-400' : 'text-purple-400'}`}>{item.type}</span>
                                        <p className="whitespace-pre-wrap">{item.content}</p>
                                    </td>
                                    <td className="p-4 align-top">
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>{item.status}</span>
                                    </td>
                                    <td className="p-4 text-center align-top">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button className="p-2 rounded-full hover:bg-gray-600 transition-colors" title="Kirim Ulang">
                                                <Icon name="refresh-cw" className="w-5 h-5 text-yellow-400" />
                                            </button>
                                            <button className="p-2 rounded-full hover:bg-gray-600 transition-colors" title="Hapus">
                                                <Icon name="trash-2" className="w-5 h-5 text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center p-8 text-gray-500">Tidak ada riwayat pesan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MessageHistoryPage;