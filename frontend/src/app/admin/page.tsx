'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import PostCard from '@/components/feed/PostCard'; // Re-use for preview if needed

export default function AdminDashboard() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                router.push('/admin/login');
                return;
            }

            try {
                const user = await getCurrentUser();
                if (user && user.role === 'admin') {
                    setAdminUser(user);
                    setIsLoading(false);
                } else {
                    throw new Error("Unauthorized");
                }
            } catch (error) {
                console.error("Admin Auth Failed", error);
                localStorage.removeItem('admin_token');
                setIsLoading(false); // Stop loading before redirect
                router.push('/admin/login');
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
            {/* Background Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500"
                        >
                            ANTIGRAVITY CONTROL DECK
                        </motion.h1>
                        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mt-2">
                            System Status: <span className="text-emerald-400">OPERATIONAL</span> | Commander: {adminUser.full_name}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm font-bold text-slate-300">
                            Return to Campus
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem('admin_token');
                                router.push('/admin/login');
                            }}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-bold"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stat Cards */}
                    <StatCard title="Total Posts" value="Active" delay={0.1} />
                    <StatCard title="System Integrity" value="98.4%" delay={0.2} />
                    <StatCard title="Security Level" value="DEFCON 4" delay={0.3} color="text-yellow-400" />
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Quick Actions */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full" />
                            Directives
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors cursor-pointer group">
                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Global Broadcast</h3>
                                <p className="text-slate-400 text-sm">Pin a message to the entire campus feed.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/50 transition-colors cursor-pointer group">
                                <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">Emergency Protocol</h3>
                                <p className="text-slate-400 text-sm">Suspend all anonymous posting (Not Implemented).</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Logs (Placeholder) */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-purple-500 rounded-full" />
                            Audit Stream
                        </h2>
                        <div className="space-y-2 font-mono text-xs">
                            <LogEntry time="Just now" action="SYSTEM_INIT" user="System" details="Dashboard Loaded" />
                            <LogEntry time="2m ago" action="AUTH_SUCCESS" user={adminUser.email} details="Admin Login Verified" />
                            <LogEntry time="1h ago" action="DB_MIGRATION" user="Root" details="Added is_pinned column" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, delay, color = "text-white" }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm"
        >
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2">{title}</h3>
            <div className={`text-4xl font-black ${color}`}>{value}</div>
        </motion.div>
    );
}

function LogEntry({ time, action, user, details }: any) {
    return (
        <div className="flex items-center gap-4 p-3 bg-black/20 rounded border border-white/5">
            <span className="text-slate-500 w-16">{time}</span>
            <span className="text-blue-400 font-bold w-32">{action}</span>
            <span className="text-slate-300 w-32 truncate">{user}</span>
            <span className="text-slate-500 flex-1 truncate">{details}</span>
        </div>
    );
}
