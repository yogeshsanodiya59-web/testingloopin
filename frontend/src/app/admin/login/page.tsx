'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { loginLocal } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await loginLocal(email, password);
            if (data.access_token) {
                localStorage.setItem('admin_token', data.access_token);
                showToast("Welcome back, Commander.", "success");
                router.push('/admin');
            } else {
                throw new Error("No token received");
            }
        } catch (error) {
            console.error("Login failed", error);
            showToast("Access Denied. Antigravity Protocol Violation.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">High Command</h1>
                    <p className="text-blue-400 text-sm font-mono uppercase tracking-widest">Restricted Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="officer@loop.in"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Authenticating...
                            </span>
                        ) : "Initiate Sequence"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
