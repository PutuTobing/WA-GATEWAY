import React, { createContext, useState, useCallback, useContext } from 'react';
import Toast from '../components/shared/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 5000); // Notifikasi hilang setelah 5 detik
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed top-5 right-5 z-[100] space-y-3">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
