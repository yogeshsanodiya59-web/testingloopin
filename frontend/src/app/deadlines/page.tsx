'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { Post } from '@/types';
import PostLoader from '@/components/feed/PostSkeleton';
import PostCard from '@/components/feed/PostCard';
import { useAuth } from '@/context/AuthContext';

export default function DeadlinesPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeadlines = async () => {
            try {
                // Fetch posts tagged as "Academic"
                const data = await getPosts(0, 50, 'ALL', 'Academic');
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch deadlines", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeadlines();
    }, []);

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📅 Academic Deadlines</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Assignments, exams, and academic updates.
                </p>
            </header>

            {loading ? (
                <div className="space-y-6">
                    <PostLoader />
                    <PostLoader />
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">You're all caught up!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">No upcoming academic deadlines found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user?.id || null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
