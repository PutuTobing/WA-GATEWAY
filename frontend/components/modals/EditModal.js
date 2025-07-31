import React, { useState, useEffect } from 'react';

const EditModal = ({ device, isOpen, onClose, onSave }) => {
    const [webhook, setWebhook] = useState('');

    useEffect(() => {
        if (device) {
            setWebhook(device.webhookUrl || '');
        }
    }, [device]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ ...device, webhookUrl: webhook });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md m-4 fade-in">
                <h3 className="text-xl font-bold text-white mb-6">Edit Perangkat: {device.username}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">URL Webhook</label>
                        <input type="text" value={webhook} onChange={(e) => setWebhook(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                </div>
                <div className="flex justify-end mt-8 space-x-3">
                    <button onClick={onClose} className="btn-press bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Batal</button>
                    <button onClick={handleSave} className="btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
