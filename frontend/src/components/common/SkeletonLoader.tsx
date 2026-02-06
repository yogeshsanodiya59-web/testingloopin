interface SkeletonLoaderProps {
    className?: string;
}

/**
 * Generic skeleton loader component
 * Usage: <SkeletonLoader className="w-32 h-4" />
 */
export default function SkeletonLoader({
    className = ""
}: SkeletonLoaderProps) {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            aria-label="Loading..."
        />
    );
}
