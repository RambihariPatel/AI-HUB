import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-slate-900/35 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full relative p-6">
      {/* Top Header Row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center space-x-3.5 w-full">
          {/* Logo Container */}
          <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-white/5 flex-shrink-0 shimmer" />
          
          {/* Title & Category Shimmer */}
          <div className="space-y-2 w-1/2">
            <div className="h-4 bg-slate-800/40 rounded-md shimmer w-3/4" />
            <div className="h-3 bg-slate-800/40 rounded-md shimmer w-1/2" />
          </div>
        </div>
        
        {/* Float Action buttons */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800/40 border border-white/5 shimmer" />
          <div className="w-8 h-8 rounded-xl bg-slate-800/40 border border-white/5 shimmer" />
        </div>
      </div>

      {/* Pricing Badge */}
      <div className="mb-4">
        <div className="h-5 bg-slate-800/40 rounded-lg shimmer w-20" />
      </div>

      {/* Tagline & Description */}
      <div className="mb-5 space-y-2">
        <div className="h-4 bg-slate-800/40 rounded-md shimmer w-5/6" />
        <div className="h-3 bg-slate-800/40 rounded-md shimmer w-full" />
        <div className="h-3 bg-slate-800/40 rounded-md shimmer w-4/5" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-slate-950/30 rounded-2xl p-2.5 border border-white/5 h-12 flex items-center justify-center">
          <div className="h-3 bg-slate-800/40 rounded w-10 shimmer" />
        </div>
        <div className="bg-slate-950/30 rounded-2xl p-2.5 border border-white/5 h-12 flex items-center justify-center">
          <div className="h-3 bg-slate-800/40 rounded w-10 shimmer" />
        </div>
        <div className="bg-slate-950/30 rounded-2xl p-2.5 border border-white/5 h-12 flex items-center justify-center">
          <div className="h-3 bg-slate-800/40 rounded w-10 shimmer" />
        </div>
      </div>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
        <div className="h-5 bg-slate-800/40 rounded-lg shimmer w-16" />
        <div className="h-5 bg-slate-800/40 rounded-lg shimmer w-20" />
        <div className="h-5 bg-slate-800/40 rounded-lg shimmer w-14" />
      </div>

      {/* Footer Actions Spacer */}
      <div className="border-t border-white/5 flex items-stretch h-12 -mx-6 -mb-6 mt-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="h-3 bg-slate-800/40 rounded w-16 shimmer" />
        </div>
        <div className="w-[1px] bg-white/5" />
        <div className="flex-1 bg-indigo-600/20 flex items-center justify-center">
          <div className="h-3 bg-slate-800/40 rounded w-16 shimmer" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
