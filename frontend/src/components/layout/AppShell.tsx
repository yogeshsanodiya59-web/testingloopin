'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import NotificationDropdown from '@/components/layout/NotificationDropdown';
import ProfileDropdown from '@/components/layout/ProfileDropdown';
import CommandPalette from '@/components/search/CommandPalette';
import FloatingRobot from '@/components/common/FloatingRobot';
import EnrollmentModal from '@/components/auth/EnrollmentModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Auth & Enrollment State
    const { user, loading: authLoading } = useAuth();

    // Close on ESC keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Toggle Search with Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }

            // Close on ESC
            if (e.key === 'Escape') {
                if (isSearchOpen) setIsSearchOpen(false);
                if (isSidebarOpen) setIsSidebarOpen(false);
                if (isProfileOpen) setIsProfileOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen, isProfileOpen, isSearchOpen]);

    // Prevent body scroll when sidebar is open or search modal is active
    useEffect(() => {
        if (isSidebarOpen || isSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSidebarOpen, isSearchOpen]);

    return (
        <div className="flex h-screen bg-[#FAFAF7] dark:bg-[#09090b] text-slate-900 dark:text-[#FAFAF7] overflow-hidden">
            <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            {/* <EnrollmentModal isOpen={showEnrollmentModal} onSuccess={() => {
        setShowEnrollmentModal(false);
        window.location.reload(); // Refresh to update state
        }} /> */}

            {/* Overlay for Mobile Sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-200 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Top Header (Hamburger + Branding) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-30 flex items-center px-4 justify-between">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="font-bold text-lg text-slate-800 dark:text-white">Loop.in</span>
                {/* Placeholder for spacing, profile is handled in fixed top-right or different logic if needed */}
                <div className="w-8"></div>
            </div>


            {/* Sidebar (Desktop & Mobile Drawer) */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                setIsSearchOpen={setIsSearchOpen}
            />

            {/* Header / Top Right Actions (Desktop) */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                <NotificationDropdown />

                {user ? (
                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-md hover:bg-blue-700 transition-colors duration-150 ring-2 ring-white"
                            aria-label="Open profile menu"
                        >
                            {(user.full_name || user.email || 'U')[0].toUpperCase()}
                        </button>

                        <ProfileDropdown
                            isOpen={isProfileOpen}
                            onClose={() => setIsProfileOpen(false)}
                            userInitials={(user.full_name || user.email || 'U')[0].toUpperCase()}
                            userName={user.full_name || user.username || 'User'}
                            userEmail={user.email}
                        />
                    </div>
                ) : (
                    !authLoading && (
                        <Link
                            href="/login"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Login
                        </Link>
                    )
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full w-full pt-16 md:pt-0 pb-24 md:pb-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Floating 3D Robot Animation (Bottom Right) */}
            <FloatingRobot />

            {/* Mobile Bottom Navigation */}
            <BottomNav />

        </div>
    );
}
