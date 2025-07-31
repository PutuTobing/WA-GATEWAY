import React from 'react';
import Icon from '../shared/Icon';

const DeleteModal = ({ device, isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md m-4 fade-in">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                        <Icon name="trash-2" className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Hapus Perangkat?</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        Apakah Anda yakin ingin menghapus perangkat milik <strong className="text-white">{device?.username}</strong>?
                    </p>
                </div>
                <div className="flex justify-center mt-8 space-x-3">
                    <button onClick={onClose} className="btn-press bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Batal</button>
                    <button onClick={() => onConfirm(device.userId)} className="btn-press bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Hapus</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;