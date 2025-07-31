import React from 'react';

const Icon = ({ name, className }) => {
    const icons = {
        trashElegant: (
            <>
                <circle cx="12" cy="12" r="12" fill="#F44336" />
                <rect x="7" y="10" width="10" height="8" rx="2" fill="white" />
                <rect x="9" y="12" width="1.5" height="5" rx="0.75" fill="#F44336" />
                <rect x="12" y="12" width="1.5" height="5" rx="0.75" fill="#F44336" />
                <rect x="15" y="12" width="1.5" height="5" rx="0.75" fill="#F44336" />
                <rect x="8" y="7" width="8" height="2" rx="1" fill="white" />
                <rect x="11" y="5" width="2" height="2" rx="1" fill="white" />
            </>
        ),
        restore: (
            <>
                <circle cx="12" cy="12" r="12" fill="#2196F3" />
                <path d="M8 12v-2a4 4 0 1 1 4 4h-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <polyline points="8 16 4 12 8 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </>
        ),
        home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>,
        grid: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"></path>,
        send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>,
        user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>,
        'log-out': <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>,
        'hard-drive': <path d="M22 12H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01"></path>,
        'check-circle': <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"></path>,
        list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>,
        'refresh-cw': <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L20.49 9M3.51 15l-2.51 2.64A9 9 0 0 0 18.49 21"></path>,
        inbox: <path d="M22 12h-6l-2 3h-4l-2-3H2M7 12v9h10v-9M5 7.5l.7-2.8A2 2 0 0 1 7.6 3h8.8a2 2 0 0 1 1.9 1.7l.7 2.8"></path>,
        'message-square': <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>,
        key: <path d="M21 2l-2.68 2.68A7.5 7.5 0 0 0 12 4a7.5 7.5 0 0 0-6.32 12.93L2 21l4.34-4.34A7.5 7.5 0 0 0 20 12a7.5 7.5 0 0 0-2.68-5.32L21 2z"></path>,
        activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>,
        edit: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>,
        'trash-2': <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
        'user-check': <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 3.5a4 4 0 1 0 0 7 4 4 0 0 0 0-7zM20 8L15 13l-2.5-2.5"></path>,
        image: <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM8.5 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"></path>,
        mic: <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2"></path>,
        smile: <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>,
        paperclip: <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>,
    };
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{icons[name]}</svg>;
};
export default Icon;