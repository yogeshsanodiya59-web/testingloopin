'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PinDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (duration: string) => void;
    onUnpin?: () => void;
    isPinned?: boolean;
    isLoading: boolean;
}

export default function PinDialog({ isOpen, onClose, onConfirm, onUnpin, isPinned, isLoading }: PinDialogProps) {
    const [duration, setDuration] = useState('24h');

    const options = [
        { value: '24h', label: '24 Hours' },
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: 'infinite', label: 'Forever (God Mode)' },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        TEMPORAL PIN
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">
                        Select how long this post should remain elevated in the Antigravity Field.
                    </p>

                    <div className="space-y-3 mb-8">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setDuration(opt.value)}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg border transition-all duration-200 ${duration === opt.value
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                                    }`}
                            >
                                <span className="font-bold text-sm uppercase tracking-wide">{opt.label}</span>
                                {duration === opt.value && (
                                    <motion.div layoutId="check" className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_currentColor]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3">
                        {isPinned && onUnpin && (
                            <button
                                onClick={onUnpin}
                                disabled={isLoading}
                                className="mr-auto px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold rounded-lg border border-red-500/20 transition-colors"
                            >
                                Unpin
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 text-sm font-bold hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(duration)}
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? 'Processing...' : (isPinned ? 'Update Pin' : 'Initiate Pin')}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
