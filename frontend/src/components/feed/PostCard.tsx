import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import UserAvatar from '@/components/common/UserAvatar';
import VoteControl from '@/components/common/VoteControl';
import SmartShareButton from '@/components/common/SmartShareButton';
import DepartmentBadge from '@/components/feed/DepartmentBadge';
import CommentSection from '@/components/comments/CommentSection';
import ReactionPicker from '@/components/common/ReactionPicker';
import TruncatedText from '@/components/common/TruncatedText';
import PinDialog from '@/components/admin/PinDialog';
import { pinPost, unpinPost } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

interface PostCardProps {
    post: Post;
    currentUserId: number | null;
    currentUser?: any; // Full user object for admin checks
    onDelete?: (postId: number) => void;
}

export default function PostCard({ post, currentUserId, currentUser, onDelete }: PostCardProps) {
    const { showToast } = useToast();
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
    const [isPinning, setIsPinning] = useState(false);

    const handlePinConfirm = async (duration: string) => {
        setIsPinning(true);
        try {
            await pinPost(post.id, duration);
            showToast(`Post pinned for ${duration === 'infinite' ? 'Eternity' : duration}`, "success");
            setIsPinDialogOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            showToast("Failed to pin post", "error");
        } finally {
            setIsPinning(false);
        }
    };

    const handleUnpin = async () => {
        setIsPinning(true);
        try {
            await unpinPost(post.id);
            showToast("Post unpinned", "success");
            setIsPinDialogOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            showToast("Failed to unpin post", "error");
        } finally {
            setIsPinning(false);
        }
    };





    // Department Color Map
    const deptColors: Record<string, string> = {
        'CS': '0, 255, 255', // Cyan
        'EE': '255, 165, 0', // Orange
        'ME': '59, 130, 246', // Blue
        'CE': '225, 29, 72', // Rose
        'IT': '147, 51, 234', // Purple
        'GENERAL': '148, 163, 184' // Slate
    };
    const deptColor = deptColors[post.department || 'GENERAL'] || deptColors['GENERAL'];

    const isAdmin = currentUser?.role === 'admin';
    // Admin Override: If admin, they can clean up anything
    const canDelete = (currentUserId && post.author_id === currentUserId) || isAdmin;

    const isAnonymous = post.is_anonymous;

    // Antigravity Unmasking Logic
    // If Admin, and author data is present (backend sent it), show it with indicator.
    const isUnmasked = isAnonymous && isAdmin && post.author;

    let authorName = isAnonymous ? 'Anonymous Student' : (post.author?.full_name || post.author?.email?.split('@')[0] || 'Student');
    let authorUsername = isAnonymous ? '' : (post.author?.username || '');
    let authorRole = isAnonymous ? 'Ghost' : (post.author?.role || 'Student');

    if (isUnmasked) {
        authorName = `${post.author?.full_name} (Ghost)`;
        authorUsername = post.author?.username || '';
        authorRole = "Unmasked";
    }

    const timeAgo = new Date(post.created_at).toLocaleDateString();

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className={`relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border transition-all duration-300 group ${isUnmasked ? 'border-red-500/30' : 'border-white/40 dark:border-white/5'}`}
            style={{
                boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 8px 30px -6px rgba(0,0,0,0.1)`
            }}
        >
            {/* Dynamic Glow Element - visible on hover */}
            <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    boxShadow: `0 20px 40px -10px rgba(${deptColor}, 0.15), 0 0 20px -5px rgba(${deptColor}, 0.1)`
                }}
            />

            {/* Pinned Indicator (Spectral Border) */}
            {post.is_pinned && (
                <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] pointer-events-none z-0" />
            )}

            <div className="relative z-10 flex justify-between items-start mb-5">
                {/* Pinned Timer (Admin Only) */}
                {post.is_pinned && isAdmin && (
                    <div className="absolute -top-3 right-0 bg-blue-900/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1 backdrop-blur-md z-20">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {post.pinned_until ? `Expires: ${new Date(post.pinned_until).toLocaleDateString()}` : 'ETERNAL'}
                    </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-3">
                    {/* Avatar with Ghost Mode blur effect */}
                    <div className={`relative ${isAnonymous ? 'filter blur-[1px] opacity-60' : ''}`}>
                        {isAnonymous ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center border border-slate-300 dark:border-slate-600 backdrop-blur-sm shadow-inner">
                                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        ) : (
                            <UserAvatar user={post.author} size="md" />
                        )}
                        {/* Spectral glow for ghost mode */}
                        {isAnonymous && (
                            <div className="absolute inset-0 rounded-full bg-slate-400/20 dark:bg-slate-600/20 animate-pulse pointer-events-none" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                            <span>{authorName}</span>
                            {authorUsername && (
                                <span className="text-slate-500 dark:text-slate-400 font-medium opacity-80">@{authorUsername}</span>
                            )}
                            <DepartmentBadge deptCode={post.department || 'GENERAL'} />
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {authorRole}
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mt-0.5 ml-0.5">
                            {post.author?.enrollment_number || 'Student'} • {timeAgo}
                        </div>
                    </div>
                </div>

                {/* Action Buttons: Pin & Delete */}
                <div className="flex items-center gap-2">
                    {/* Pin Button (Admin Only) */}
                    {isAdmin && (
                        <button
                            onClick={() => setIsPinDialogOpen(true)}
                            className={`p-2 rounded-full transition-all ${post.is_pinned ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'} opacity-0 group-hover:opacity-100`}
                            title="Temporal Pin"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </button>
                    )}

                    {/* Delete Option (Author or Admin) */}
                    {canDelete && onDelete && (
                        <div className="relative">
                            <button
                                onClick={() => onDelete(post.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                title={isAdmin ? "Antigravity Dissolve (Admin)" : "Delete Post"}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <PinDialog
                isOpen={isPinDialogOpen}
                onClose={() => setIsPinDialogOpen(false)}
                onConfirm={handlePinConfirm}
                onUnpin={handleUnpin}
                isPinned={post.is_pinned}
                isLoading={isPinning}
            />

            {/* Post Content */}
            <div className="mb-6 relative z-10">
                <Link href={`/posts/${post.id}`} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <h2 className="text-2xl font-serif font-black text-slate-900 dark:text-white mb-3 leading-tight tracking-tight drop-shadow-sm">
                        <TruncatedText text={post.title} maxLength={60} />
                    </h2>
                </Link>
                <p className="text-[1.0625rem] text-slate-800 dark:text-slate-100 leading-[1.75] font-light whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Tags */}
            {post.tags && (
                <div className="flex items-center gap-2 mb-6 flex-wrap relative z-10">
                    {post.tags.split(',').filter(t => t.trim()).map((tag: string) => (
                        <span
                            key={tag}
                            className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-slate-200/60 dark:border-slate-700/60 uppercase backdrop-blur-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="pt-6 mt-2 border-t border-slate-100/60 dark:border-white/5 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <VoteControl
                            initialUpvotes={post.upvotes}
                            initialDownvotes={post.downvotes}
                            initialUserVote={post.user_vote}
                            postId={post.id}
                        />
                    </div>

                    {/* Smart Share Button */}
                    <SmartShareButton
                        postId={post.id}
                        postTitle={post.title}
                        initialShareCount={post.share_count || 0}
                    />
                </div>

                <div className="mt-4">
                    <CommentSection postId={post.id} initialCount={post.comments_count || 0} currentUserId={currentUserId} />
                </div>
            </div>
        </motion.article>
    );
}
