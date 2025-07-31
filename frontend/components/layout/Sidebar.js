import React from 'react';
import Icon from '../shared/Icon';

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
    const NavLink = ({ page, icon, children }) => (
        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage(page); }}
           className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activePage === page ? 'bg-green-500/20 text-green-300 font-semibold' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
            <Icon name={icon} className="w-5 h-5 mr-3" /> {children}
        </a>
    );
    return (
        <aside className="w-64 bg-gray-800/50 backdrop-blur-sm flex-shrink-0 flex flex-col border-r border-gray-700">
            <div className="h-20 flex items-center justify-center border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white tracking-wider">BTD <span className="text-green-400">GATEWAY</span></h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink page="dashboard" icon="home">Dasbor</NavLink>
                <NavLink page="customer-service" icon="message-square">Customer Service</NavLink>
                <NavLink page="qr-connection" icon="grid">Koneksi & QR</NavLink>
                <NavLink page="send-message" icon="send">Kirim Pesan</NavLink>
                <NavLink page="message-history" icon="list">History Pesan</NavLink>
                <NavLink page="inbox" icon="inbox">Pesan Masuk</NavLink>
            </nav>
            <div className="px-4 py-6 border-t border-gray-700 space-y-2">
                <NavLink page="account-management" icon="user">Manajemen Akun</NavLink>
                <a href="#" onClick={onLogout} className="flex items-center px-4 py-3 rounded-lg font-medium text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                    <Icon name="log-out" className="w-5 h-5 mr-3" /> Logout
                </a>
            </div>
        </aside>
    );
};
export default Sidebar;