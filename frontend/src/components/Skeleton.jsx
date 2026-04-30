import React from 'react';

const Skeleton = ({ className }) => {
    return (
        <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded ${className}`}></div>
    );
};

export const ToolCardSkeleton = () => (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="mt-auto pt-4 border-t border-border flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
        </div>
    </div>
);

export const TrendingSkeleton = () => (
    <div className="bg-slate-900 rounded-[2rem] p-6 border border-white/5 h-full">
        <Skeleton className="h-12 w-12 rounded-xl mb-4 bg-zinc-700" />
        <Skeleton className="h-6 w-3/4 mb-2 bg-zinc-700" />
        <Skeleton className="h-4 w-full mb-4 bg-zinc-700" />
        <div className="flex justify-between">
            <Skeleton className="h-5 w-12 bg-zinc-700" />
            <Skeleton className="h-4 w-16 bg-zinc-700" />
        </div>
    </div>
);

export default Skeleton;
