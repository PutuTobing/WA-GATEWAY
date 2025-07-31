import React, { useState } from 'react';
import Icon from './shared/Icon';

const AuthPage = ({ onLogin, onRegister, setPage }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    
    // State untuk form
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onLogin({ username, password });
        } catch (err) {
            setError(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onRegister({ username, email, password });
            setPage('pending-approval');
        } catch (err) {
            setError(err.message || 'Registrasi gagal. Coba lagi nanti.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 fade-in">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <img src="/logo btd.png" alt="BTD Logo" className="w-16 h-16 md:w-20 md:h-20 logo-float" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider">
                            BTD <span className="text-green-400">GATEWAY</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 mt-2">Selamat datang! Silakan login untuk melanjutkan.</p>
                </div>

                <div className="bg-gray-800/60 rounded-xl p-8 shadow-2xl shadow-green-500/5 backdrop-blur-sm">
                    {isLoginView ? (
                        <form onSubmit={handleLoginSubmit} className="space-y-6 fade-in">
                            <h2 className="text-2xl font-bold text-center text-white">Login</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Username atau Email</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <button type="submit" className="w-full btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg">Login</button>
                            <p className="text-center text-sm text-gray-400">
                                Belum punya akun? <button type="button" onClick={() => setIsLoginView(false)} className="font-semibold text-green-400 hover:underline">Daftar di sini</button>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="space-y-5 fade-in">
                            <h2 className="text-2xl font-bold text-center text-white">Buat Akun Baru</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <button type="submit" className="w-full btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg">Daftar</button>
                            <p className="text-center text-sm text-gray-400">
                                Sudah punya akun? <button type="button" onClick={() => setIsLoginView(true)} className="font-semibold text-green-400 hover:underline">Login</button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export const PendingApprovalPage = ({ setPage }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
        <div className="w-full max-w-md text-center bg-gray-800/60 rounded-xl p-8 shadow-2xl fade-in">
            <Icon name="check-circle" className="w-16 h-16 mx-auto mb-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Pendaftaran Berhasil!</h2>
            <p className="text-gray-400 mt-4">Akun Anda telah berhasil dibuat dan sedang menunggu persetujuan dari Administrator. Anda akan bisa login setelah akun disetujui.</p>
            <button onClick={() => setPage('auth')} className="mt-8 w-full btn-press bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg">Kembali ke Login</button>
        </div>
    </div>
);

export default AuthPage;