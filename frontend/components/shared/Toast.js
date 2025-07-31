import React from 'react';
import Icon from './Icon';

const Toast = ({ message, type }) => {
    const styles = {
        success: {
            bg: 'bg-green-500/90',
            icon: 'check-circle',
            iconColor: 'text-white'
        },
        error: {
            bg: 'bg-red-500/90',
            icon: 'x-circle',
            iconColor: 'text-white'
        },
        info: {
            bg: 'bg-blue-500/90',
            icon: 'info',
            iconColor: 'text-white'
        }
    };

    const style = styles[type] || styles.info;

    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg text-white ${style.bg} toast-enter`}>
            <Icon name={style.icon} className={`w-6 h-6 ${style.iconColor}`} />
            <p className="font-semibold">{message}</p>
        </div>
    );
};

export default Toast;