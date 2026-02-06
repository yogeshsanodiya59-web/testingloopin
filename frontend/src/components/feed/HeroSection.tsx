'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-700/50 dark:border-slate-800/50 mb-8"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />

            {/* Content */}
            <div className="relative px-8 py-16 md:py-20 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
                >
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span className="text-sm font-semibold text-blue-300">Official Campus Community Portal</span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
                >
                    <span className="text-white">Loop.in Campus</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                        Community Platform
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed"
                >
                    A comprehensive platform for students to connect, discuss academic topics,
                    and collaborate on campus activities.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => {
                            const createButton = document.querySelector('[data-create-post]') as HTMLButtonElement;
                            createButton?.click();
                        }}
                        className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 rounded-full font-bold text-base hover:bg-slate-100 transition-all duration-200 shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-105"
                    >
                        <span>Get Started</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>

                    <button
                        onClick={() => {
                            const feedSection = document.getElementById('feed-section');
                            feedSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800/80 backdrop-blur-sm text-white rounded-full font-semibold text-base border border-slate-700 hover:bg-slate-700/80 hover:border-slate-600 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Browse Posts</span>
                    </button>
                </motion.div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </motion.div>
    );
}
