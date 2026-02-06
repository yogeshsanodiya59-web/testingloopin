'use client';

import { useState, useEffect } from 'react';
import { getPosts } from '@/lib/api';
import { Post } from '@/types';
import PostLoader from '@/components/feed/PostSkeleton';
import PostCard from '@/components/feed/PostCard';
import { useAuth } from '@/context/AuthContext';

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch posts tagged as "Event"
                const data = await getPosts(0, 50, 'ALL', 'Event');
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📢 Campus Events & News</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Official updates, workshops, and campus life.
                </p>
            </header>

            {loading ? (
                <div className="space-y-6">
                    <PostLoader />
                    <PostLoader />
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                    <div className="text-4xl mb-4">📢</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No announcements yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later for official campus updates.</p>
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
