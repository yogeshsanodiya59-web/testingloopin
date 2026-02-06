'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Custom firebase instance
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { getCurrentUser } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
    user: User | null; // Our backend user shape
    firebaseUser: FirebaseUser | null; // Raw firebase user
    loading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Firebase Auth Listener
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            console.log("AuthContext: onAuthStateChanged triggered", fbUser ? "User found" : "No user");
            setLoading(true);
            setFirebaseUser(fbUser);

            if (fbUser) {
                // User is signed in with Firebase. 
                // Now verify/fetch profile from our Backend.
                try {
                    console.log("AuthContext: Fetching ID token and backend profile...");
                    // Get token to force interceptor to work immediately (optional check)
                    await fbUser.getIdToken();

                    // Fetch profile from backend (which lazily creates user if needed)
                    const dbUser = await getCurrentUser();
                    console.log("AuthContext: Backend response:", dbUser);
                    if (dbUser) {
                        setUser(dbUser);
                    } else {
                        console.warn("Backend failed to return user profile despite valid firebase session.");
                    }
                } catch (err) {
                    console.error("Failed to sync with backend", err);
                }
            } else {
                // Logged out
                console.log("AuthContext: User logged out");
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setFirebaseUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const refreshUser = async () => {
        if (!auth.currentUser) return;
        const userData = await getCurrentUser();
        if (userData) setUser(userData);
    };

    // Route Protection (Client-side)
    const protectedRoutes = ['/profile', '/settings'];
    const isProtected = protectedRoutes.some(route => pathname?.startsWith(route));

    useEffect(() => {
        if (!loading && !firebaseUser && isProtected) {
            router.push('/login');
        }
    }, [loading, firebaseUser, isProtected, router]);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
