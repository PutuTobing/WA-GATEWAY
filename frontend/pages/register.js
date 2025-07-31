import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Ikon...
const UserIcon = () => <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const MailIcon = () => <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const LockIcon = () => <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>;

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const res = await fetch('http://172.16.31.14:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessageType('success');
                setMessage(data.message + ' Anda akan diarahkan ke halaman login.');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setMessageType('error');
                setMessage(data.message || 'Pendaftaran gagal.');
            }
        } catch (err) {
            setMessageType('error');
            setMessage('Tidak dapat terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head><title>Registrasi - BTD Gateway</title></Head>
            <div className="min-h-screen bg-slate-900 text-gray-200 flex items-center justify-center p-4 overflow-hidden">
                <div className="aurora-background"></div>
                <div className={`w-full max-w-lg transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="w-full glass-card rounded-2xl shadow-2xl shadow-black/20 p-8 md:p-12">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2">Buat Akun Baru</h1>
                            <p className="text-gray-400">Daftar untuk menggunakan layanan WA Gateway.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative"><UserIcon /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500" required /></div>
                            <div className="relative"><MailIcon /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500" required /></div>
                            <div className="relative"><LockIcon /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500" required /></div>
                            
                            {message && (
                                <div className={`text-sm text-center p-3 rounded-lg ${messageType === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {message}
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className={`w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 disabled:opacity-50`}>
                                {isLoading ? 'Mendaftar...' : 'Daftar'}
                            </button>
                            <div className="text-center text-sm">
                                <span className="text-gray-400">Sudah punya akun? </span>
                                <Link href="/login" className="font-medium text-orange-400 hover:underline">
                                    Masuk di sini
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
