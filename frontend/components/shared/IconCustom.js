import React from 'react';

const IconCustom = ({ name, className }) => {
    const icons = {
        // Hapus (Trash)
        trashElegant: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className}>
                <circle cx="16" cy="16" r="14" fill="#F44336" />
                <rect x="10" y="14" width="12" height="10" rx="2" fill="white" />
                <rect x="12" y="16" width="2" height="6" rx="1" fill="#F44336" />
                <rect x="16" y="16" width="2" height="6" rx="1" fill="#F44336" />
                <rect x="20" y="16" width="2" height="6" rx="1" fill="#F44336" />
                <rect x="12" y="11" width="8" height="2" rx="1" fill="white" />
                <rect x="15" y="8" width="2" height="2" rx="1" fill="white" />
            </svg>
        ),
        // Accept (Check)
        accept: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className}>
                <circle cx="16" cy="16" r="14" fill="#4CAF50" />
                <path d="M10 17l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        // Discard (Cross)
        discard: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className}>
                <circle cx="16" cy="16" r="14" fill="#FFC107" />
                <path d="M12 12l8 8M20 12l-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        ),
        // Restore
        restore: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className}>
                <circle cx="16" cy="16" r="14" fill="#2196F3" />
                <path d="M12 16v-3a4 4 0 1 1 4 4h-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <polyline points="12 22 7 16 12 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
        ),
    };
    return icons[name] || null;
};
export default IconCustom;
