import React from 'react';

const AnimatedMeshGradient = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 bg-slate-950 transition-colors duration-700 dark:bg-slate-950 html-light-bg">
      {/* Glow Blob 1 */}
      <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] animate-blob-1 transition-all duration-700" />
      
      {/* Glow Blob 2 */}
      <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-[130px] animate-blob-2 transition-all duration-700" />
      
      {/* Glow Blob 3 */}
      <div className="absolute top-[25%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px] animate-blob-3 transition-all duration-700" />
      
      {/* Fine-grain lighting adjustments */}
      <div className="absolute inset-0 bg-white/5 dark:bg-transparent pointer-events-none mix-blend-overlay transition-opacity duration-700" />
    </div>
  );
};

export default AnimatedMeshGradient;
