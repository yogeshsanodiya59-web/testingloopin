'use client';

import { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import Image from 'next/image';

// --- Types ---
interface TeamMember {
    id: number;
    name: string;
    role: string;
    imageSrc: string;
    githubUrl: string;
    linkedinUrl: string;
    // For staggered animation
    delay: number;
}

// --- Data (Ordered by Visual Reference) ---
const TEAM_MEMBERS: TeamMember[] = [
    {
        id: 1,
        name: "Yogesh Sanodiya",
        role: "Mentor",
        imageSrc: "/team/member1.jpg",
        githubUrl: "https://github.com/yogeshsanodiya59-web",
        linkedinUrl: "https://www.linkedin.com/in/yogesh-sanodiya-8a2816298/",
        delay: 0
    },
    {
        id: 2,
        name: "Pranshu Samadhiya",
        role: "Developer",
        imageSrc: "/team/member2.jpg",
        githubUrl: "https://github.com/pranshu1899",
        linkedinUrl: "https://www.linkedin.com/in/pranshu-samadhiya-415052380",
        delay: 0.2
    },
    {
        id: 3,
        name: "Suhani Choudhary",
        role: "Developer",
        imageSrc: "/team/member4.jpg",
        githubUrl: "https://github.com/suhaniamitchoudhary26-stack",
        linkedinUrl: "https://www.linkedin.com/in/suhani-choudhary-a66230379/",
        delay: 0.4
    },
    {
        id: 4,
        name: "Meet Bisen",
        role: "Developer",
        imageSrc: "/team/member3.jpg",
        githubUrl: "https://github.com/mebisen06",
        linkedinUrl: "https://www.linkedin.com/in/meetbisen/",
        delay: 0.6
    }
];

// --- Components ---

/**
 * The Orbit Ring Component
 * Tilted atomic orbits that accelerate on hover.
 */
const OrbitRing = ({ isHovered }: { isHovered: boolean }) => {
    return (
        <div className="absolute inset-[-40%] pointer-events-none z-0 overflow-visible">
            {/* Tilted Orbit 1 (Cyan/Indigo Gradient) */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-[120%] h-[120%] rounded-[50%] border-[2px] border-transparent"
                style={{
                    rotateX: 70,
                    rotateY: -10,
                    translateX: '-50%',
                    translateY: '-50%',
                    borderTopColor: 'rgba(99, 102, 241, 0.6)', // Indigo
                    borderRightColor: 'transparent',
                    borderBottomColor: 'rgba(34, 211, 238, 0.6)', // Cyan
                    borderLeftColor: 'transparent',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
                }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: isHovered ? 2 : 8,
                    ease: "linear",
                    repeat: Infinity
                }}
            />

            {/* Tilted Orbit 2 (Opposite Axis - Lavender/Purple) */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-[120%] h-[120%] rounded-[50%] border-[2px] border-transparent"
                style={{
                    rotateX: 70,
                    rotateY: 45,
                    translateX: '-50%',
                    translateY: '-50%',
                    borderTopColor: 'rgba(167, 139, 250, 0.5)', // Lavender
                    borderRightColor: 'transparent',
                    borderBottomColor: 'rgba(192, 132, 252, 0.5)', // Purple
                    borderLeftColor: 'transparent',
                }}
                animate={{ rotate: -360 }}
                transition={{
                    duration: isHovered ? 2.5 : 10,
                    ease: "linear",
                    repeat: Infinity
                }}
            />

            {/* Orbiting Particle */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-[120%] h-[120%]"
                style={{
                    rotateX: 70,
                    rotateY: -10,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: isHovered ? 2 : 8,
                    ease: "linear",
                    repeat: Infinity
                }}
            >
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-400 rounded-full blur-[2px] shadow-[0_0_10px_rgba(34,211,238,1)]" style={{ transform: 'translate(-50%, -50%)' }} />
            </motion.div>
        </div>
    );
};

/**
 * Individual Member Avatar suspended in space.
 * Uses tap/click interactions on mobile and hover on desktop.
 */
const SuspendedAvatar = ({ member }: { member: TeamMember }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    // Magnetic Spring Physics
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Disable magnetic pull on small devices to prevent scrolling issues
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        x.set(distanceX * 0.15);
        y.set(distanceY * 0.15);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className="relative flex flex-col items-center justify-center group z-10 p-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: member.delay, duration: 0.8 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { handleMouseLeave(); setIsHovered(false); }}
            onClick={() => setIsHovered(!isHovered)} // Toggle for mobile
            style={{ x: mouseX, y: mouseY }}
        >
            {/* Suspension Animation Container */}
            <motion.div
                animate={{ y: [-15, 5, -15] }}
                transition={{
                    duration: 5 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: member.delay * 2
                }}
                className="relative z-10"
            >
                {/* Avatar Circle Container */}
                <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center perspective-1000">

                    {/* Dynamic Background Glow */}
                    <div className={`absolute inset-0 bg-indigo-500/20 dark:bg-cyan-500/20 blur-3xl rounded-full transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Image Container */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-[3px] border-slate-100/30 dark:border-slate-700/50 z-20 shadow-xl bg-slate-900">
                        <Image
                            src={member.imageSrc}
                            alt={member.name}
                            fill
                            className={`object-cover object-center transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                            style={{ objectPosition: 'center center' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                    </div>

                    {/* Orbit Rings (Behind Image) */}
                    <OrbitRing isHovered={isHovered} />
                </div>

                {/* Identity Label - Floating Below */}
                <div className="mt-8 md:mt-12 text-center space-y-1 relative z-30">
                    <h3 className={`text-xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors ${isHovered ? 'text-indigo-600 dark:text-cyan-400' : ''}`}>
                        {member.name}
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        {member.role}
                    </p>

                    {/* Minimalist Socials */}
                    <div className={`flex items-center justify-center gap-4 pt-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 '}`}>
                        <a href={member.githubUrl} target="_blank" rel="noopener" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                        </a>
                        <a href={member.linkedinUrl} target="_blank" rel="noopener" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function DevelopersPage() {
    return (
        <div className="min-h-screen bg-[#Fdfdfd] dark:bg-[#0f172a] overflow-x-hidden flex flex-col items-center justify-center relative transition-colors duration-500 py-20 pb-32 md:pb-20">
            {/* --- Background Mesh Architecture --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:6rem_6rem] opacity-40 dark:opacity-0" />
                <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent opacity-60 dark:opacity-0" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 dark:opacity-100" />
                <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#020617] to-transparent opacity-0 dark:opacity-100" />
            </div>

            {/* --- Header Section --- */}
            <header className="relative z-10 text-center mb-16 md:mb-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-slate-800 dark:text-slate-100 mb-4 md:mb-6 font-sans">
                        Meet the Developers
                    </h1>
                </motion.div>
            </header>

            {/* --- Floating Orbit Grid --- */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 
                  Grid Breakpoints:
                  - Mobile (<768px): 1 Column (stacked)
                  - Tablet (>=768px): 2 Columns
                  - Desktop (>=1024px): 4 Columns
                */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 place-items-center">
                    {TEAM_MEMBERS.map((member) => (
                        <SuspendedAvatar key={member.id} member={member} />
                    ))}
                </div>
            </div>

            {/* --- Bottom Gradient --- */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#0f172a] to-transparent pointer-events-none" />
        </div>
    );
}
