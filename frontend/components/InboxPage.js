import React, { useState, useEffect } from 'react';
import Icon from './shared/Icon';

const InboxPage = ({ incomingMessages, devices, onUpdateMessage }) => {
    const [selectedDevice, setSelectedDevice] = useState('all');
    const [filteredMessages, setFilteredMessages] = useState([]);

    useEffect(() => {
        let messages = [...incomingMessages];
        if (selectedDevice !== 'all') {
            const selectedDeviceName = devices.find(d => d.id === parseInt(selectedDevice))?.name;
            messages = messages.filter(msg => msg.device === selectedDeviceName);
        }
        setFilteredMessages(messages);
    }, [selectedDevice, incomingMessages, devices]);

    const handleTranscription = (messageId) => {
        // Simulasi proses transkripsi
        onUpdateMessage(messageId, {
            ...filteredMessages.find(m => m.id === messageId).content,
            transcriptionStatus: 'TRANSCRIBING',
        });

        setTimeout(() => {
            onUpdateMessage(messageId, {
                ...filteredMessages.find(m => m.id === messageId).content,
                transcriptionStatus: 'DONE',
                transcription: 'Ini adalah hasil transkripsi dari pesan suara. Nantinya ini akan diisi oleh hasil dari API speech-to-text.',
            });
        }, 2500);
    };

    const MessageContent = ({ msg }) => {
        switch (msg.type) {
            case 'TEXT':
                return <p className="text-gray-300 text-sm">{msg.content}</p>;
            case 'IMAGE':
                return (
                    <div className="mt-2">
                        <img src={msg.content} alt={msg.caption || 'Gambar masuk'} className="rounded-lg max-w-xs" />
                        {msg.caption && <p className="text-gray-400 text-sm mt-2">{msg.caption}</p>}
                    </div>
                );
            case 'VOICE':
                const { transcriptionStatus, transcription, duration } = msg.content;
                return (
                    <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
                        <Icon name="mic" className="w-6 h-6 text-green-400 flex-shrink-0" />
                        <div className="flex-grow">
                            {transcriptionStatus === 'DONE' ? (
                                <p className="text-gray-300 text-sm italic">"{transcription}"</p>
                            ) : (
                                <p className="text-gray-400 text-sm">Pesan suara ({duration})</p>
                            )}
                        </div>
                        {transcriptionStatus === 'PENDING' && (
                            <button onClick={() => handleTranscription(msg.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                Transkripsikan
                            </button>
                        )}
                        {transcriptionStatus === 'TRANSCRIBING' && (
                            <Icon name="loader" className="w-5 h-5 text-yellow-400 animate-spin" />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="mb-8 flex-shrink-0">
                <h2 className="text-3xl font-bold text-white">Pesan Masuk</h2>
                <p className="text-gray-400 mt-1">Lihat semua pesan yang diterima oleh perangkat Anda.</p>
            </header>

            <div className="bg-gray-800/60 rounded-xl p-6 flex-grow flex flex-col">
                <div className="mb-4 flex-shrink-0">
                    <label htmlFor="device-filter" className="text-sm text-gray-400 mr-3">Tampilkan pesan dari:</label>
                    <select
                        id="device-filter"
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        <option value="all">Semua Perangkat</option>
                        {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <div className="overflow-y-auto flex-grow pr-2">
                    {filteredMessages.length > 0 ? filteredMessages.map(msg => (
                        <div key={msg.id} className="flex gap-4 mb-6">
                            <img src={msg.profilePic} alt={msg.fromName} className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className="flex-grow">
                                <div className="flex items-baseline gap-3">
                                    <span className="font-bold text-white">{msg.fromName}</span>
                                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                                </div>
                                <div className="text-xs text-green-400 mb-2">via {msg.device}</div>
                                <div className="bg-gray-700 p-4 rounded-lg rounded-tl-none">
                                    <MessageContent msg={msg} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-20">Tidak ada pesan masuk.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InboxPage;