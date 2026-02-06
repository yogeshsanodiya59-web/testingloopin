'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface EnrollmentModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export default function EnrollmentModal({ isOpen, onSuccess }: EnrollmentModalProps) {
    const [enrollment, setEnrollment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.put('/auth/me/enrollment', { enrollment_number: enrollment });
            // Animation delay for success feel
            setTimeout(() => {
                onSuccess();
            }, 500);
        } catch (err: any) {
            if (err.response) {
                setError(err.response.data.detail || 'Failed to update enrollment');
            } else {
                setError('Network error. Please try again.');
            }
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
                </div>

                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
                    className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    style={{
                        boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)'
                    }}
                >
                    {/* Header */}
                    <div className="relative p-8 text-center pb-0">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
                        >
                            <span className="text-3xl">🆔</span>
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Final Check</h2>
                        <p className="text-slate-400 text-sm">Please provide your university enrollment number to complete your profile.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
                        <div className="relative group">
                            <motion.div
                                animate={focused ? { scale: 1.02 } : { scale: 1 }}
                                className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition duration-500 ${focused ? 'opacity-100 blur-sm' : ''}`}
                            />
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={enrollment}
                                    onChange={(e) => setEnrollment(e.target.value.toUpperCase())}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    className="block w-full px-4 py-4 bg-slate-900/90 border border-slate-700 text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600 font-mono text-center tracking-widest text-lg uppercase"
                                    placeholder="0827CS..."
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-sm text-center font-medium bg-red-900/20 py-2 rounded-lg border border-red-500/20"
                                >
                                    ⚠️ {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${isLoading
                                    ? 'bg-slate-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-500/25'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </span>
                            ) : (
                                'Complete Verification'
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
