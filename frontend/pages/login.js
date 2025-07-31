import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Ikon...
const UserIcon = () => <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const LockIcon = () => <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>;
const EyeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
const EyeOffIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>;
const HeartIcon = () => <svg className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>;

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (localStorage.getItem('token')) { router.push('/'); }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`http://172.16.31.14:3001/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push('/');
            } else {
                setError(data.message || "Login gagal!");
            }
        } catch (err) {
            setError("Tidak dapat terhubung ke server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head><title>Login - BTD WA Gateway</title></Head>
            <div className="min-h-screen bg-slate-900 text-gray-200 flex items-center justify-center p-4 overflow-hidden">
                <div className="aurora-background"></div>
                <div className={`w-full max-w-6xl flex transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="w-full lg:w-1/2 p-8 md:p-12 flex items-center justify-center">
                        <div className="w-full max-w-md space-y-8">
                            <div><h1 className="text-4xl font-bold text-white mb-2">Selamat Datang</h1><p className="text-gray-400">Masuk untuk melanjutkan ke BTD WA Gateway.</p></div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative"><UserIcon /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username atau Email" className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500" required /></div>
                                <div className="relative"><LockIcon /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button></div>
                                {error && (<div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 text-center">{error}</div>)}
                                <button type="submit" disabled={isLoading} className={`w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:opacity-50`}>{isLoading ? 'Mencoba Masuk...' : 'Sign In'}</button>
                                <div className="text-center text-sm">
                                    <span className="text-gray-400">Belum punya akun? </span>
                                    <Link href="/register" className="font-medium text-orange-400 hover:underline">
                                        Daftar di sini
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="hidden lg:flex w-1/2 glass-card rounded-2xl items-center justify-center p-12 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full animate-pulse"></div>
                        <div className="absolute -bottom-16 -left-16 w-56 h-56 border-8 border-blue-500/10 rounded-full"></div>
                        <div className="relative z-10 text-center text-white">
                            <div className="relative w-56 h-56 mx-auto mb-8 animate-float"><img src="/logo btd.png" alt="Logo BTD" className="relative w-full h-full object-contain drop-shadow-2xl" /></div>
                            <h2 className="text-3xl font-bold mb-3">Base Technology Digital</h2>
                            <p className="text-gray-300 max-w-sm mx-auto">Gateway Terintegrasi untuk otomatisasi alur kerja Anda melalui WhatsApp.</p>
                            <div className="mt-12 text-sm text-gray-500 flex items-center justify-center space-x-1.5"><span>Develop Made</span><HeartIcon /><span>by SR16-Project</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
