import { useState } from 'react';
import { createComment, toggleReaction, voteComment } from '@/lib/api';
import CommentForm from './CommentForm';
import ReactionPicker from '@/components/common/ReactionPicker';

import { deleteComment } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CommentItemProps {
    comment: any;
    postId: number;
    depth?: number;
    currentUserId?: number | null;
    onReplySuccess: () => void;
}

export default function CommentItem({ comment, postId, depth = 0, currentUserId, onReplySuccess }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [reactions, setReactions] = useState(comment.reactions || []);
    const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
    const [downvotes, setDownvotes] = useState(comment.downvotes || 0);
    const [userVote, setUserVote] = useState<1 | -1 | null>(comment.user_vote || null);

    const handleReply = async (content: string, isAnonymous: boolean) => {
        await createComment(postId, content, comment.id, isAnonymous);
        setIsReplying(false);
        onReplySuccess();
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await deleteComment(postId, comment.id);
            onReplySuccess(); // Refresh
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const handleReaction = async (emoji: string) => {
        try {
            // Optimistic update
            const currentReactionObj = reactions.find((r: any) => r.emoji === emoji);
            const userReacted = currentReactionObj?.user_reacted;

            let newReactions = [...reactions];

            if (userReacted) {
                // Remove
                newReactions = newReactions.map((r: any) =>
                    r.emoji === emoji ? { ...r, count: r.count - 1, user_reacted: false } : r
                ).filter(r => r.count > 0);
            } else {
                // Add
                if (currentReactionObj) {
                    newReactions = newReactions.map((r: any) =>
                        r.emoji === emoji ? { ...r, count: r.count + 1, user_reacted: true } : r
                    );
                } else {
                    newReactions.push({ emoji, count: 1, user_reacted: true });
                }
            }
            setReactions(newReactions);

            await toggleReaction('comment', comment.id, emoji);
        } catch (error) {
            console.error("Failed to toggle reaction", error);
            setReactions(comment.reactions || []); // Revert
        }
    };

    const handleVote = async (voteType: 1 | -1) => {
        try {
            // Optimistic update
            const previousVote = userVote;

            if (userVote === voteType) {
                // Toggling off
                setUserVote(null);
                if (voteType === 1) setUpvotes((prev: number) => prev - 1);
                else setDownvotes((prev: number) => prev - 1);
            } else {
                // Changing vote or new vote
                if (previousVote === 1) setUpvotes((prev: number) => prev - 1);
                if (previousVote === -1) setDownvotes((prev: number) => prev - 1);

                setUserVote(voteType);
                if (voteType === 1) setUpvotes((prev: number) => prev + 1);
                else setDownvotes((prev: number) => prev + 1);
            }

            await voteComment(comment.id, voteType);
        } catch (error) {
            console.error("Failed to vote on comment", error);
            // Revert on error
            setUpvotes(comment.upvotes || 0);
            setDownvotes(comment.downvotes || 0);
            setUserVote(comment.user_vote || null);
        }
    };
    const isAuthor = currentUserId && comment.author_id === currentUserId;
    const isAnonymous = comment.is_anonymous;
    const authorName = isAnonymous ? 'Anonymous' : (comment.author?.full_name || 'Unknown User');
    const authorRole = isAnonymous ? '' : (comment.author?.role || 'student');

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-8 sm:ml-12 border-l-2 border-slate-100 dark:border-slate-800 pl-4' : ''}`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-blue-600 border border-white dark:border-slate-700 shadow-sm flex-shrink-0 overflow-hidden">
                    {comment.author?.profile_photo_url ? (
                        <img src={comment.author.profile_photo_url} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                        authorName[0]
                    )}
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800 shadow-sm relative group hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{authorName}</span>
                        {authorRole !== 'student' && (
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1 rounded uppercase font-bold">{authorRole}</span>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">• {new Date(comment.created_at).toLocaleDateString()}</span>

                        {isAuthor && (
                            <button onClick={handleDelete} className="ml-auto text-xs text-red-400 hover:text-red-600 font-medium">
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-4 mt-2">
                        {/* Vote Buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleVote(1)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${userVote === 1
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                        : 'text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                {upvotes > 0 && <span>{upvotes}</span>}
                            </button>
                            <button
                                onClick={() => handleVote(-1)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${userVote === -1
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        : 'text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                {downvotes > 0 && <span>{downvotes}</span>}
                            </button>
                        </div>

                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            Reply
                        </button>

                        <ReactionPicker
                            currentReactions={reactions}
                            onSelect={handleReaction}
                            onToggle={handleReaction}
                        />
                    </div>
                </div>
            </div>

            {/* Reply Form */}
            {isReplying && (
                <div className="mt-3 ml-11">
                    <CommentForm
                        onSubmit={handleReply}
                        placeholder="Write a reply..."
                        autoFocus
                        onCancel={() => setIsReplying(false)}
                    />
                </div>
            )}

            {/* Recursive Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div>
                    {comment.replies.map((reply: any) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            depth={depth + 1}
                            currentUserId={currentUserId}
                            onReplySuccess={onReplySuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
