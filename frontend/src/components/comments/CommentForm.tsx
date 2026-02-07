import { useState } from 'react';
import Button from '@/components/common/Button';

interface CommentFormProps {
    onSubmit: (content: string, isAnonymous: boolean) => Promise<void>;
    placeholder?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
}

export default function CommentForm({ onSubmit, placeholder = "Write a thoughtful comment...", autoFocus, onCancel }: CommentFormProps) {
    const [content, setContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, isAnonymous);
            setContent('');
            setIsAnonymous(false);
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-h-[80px] resize-y text-slate-900 bg-white dark:bg-slate-900 dark:text-white placeholder:text-slate-400"
                    autoFocus={autoFocus}
                />
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Post anonymously
                    </label>
                    <div className="flex gap-2">
                        {onCancel && (
                            <Button variant="ghost" size="sm" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!content.trim() || isSubmitting}
                            isLoading={isSubmitting}
                        >
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

