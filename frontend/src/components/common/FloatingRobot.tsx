'use client';

import { memo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Direct lazy import for better performance
const Spline = lazy(() => import('@splinetool/react-spline'));

// Pages where robot should appear
const ALLOWED_PATHS = ['/', '/login', '/popular'];

function FloatingRobotComponent() {
    const pathname = usePathname();

    // Only render on allowed pages
    if (!ALLOWED_PATHS.includes(pathname)) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="fixed bottom-0 right-0 z-40 w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96"
            style={{ willChange: 'opacity' }}
        >
            {/* Subtle Glow */}
            <div className="absolute bottom-8 right-8 w-20 h-20 bg-cyan-400/20 blur-2xl rounded-full pointer-events-none" />

            {/* 3D Robot - Direct Spline for better cursor tracking */}
            <Suspense fallback={<div className="w-full h-full" />}>
                <Spline
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    style={{ width: '100%', height: '100%' }}
                />
            </Suspense>
        </motion.div>
    );
}

// Memoize to prevent unnecessary re-renders
const FloatingRobot = memo(FloatingRobotComponent);
export default FloatingRobot;

