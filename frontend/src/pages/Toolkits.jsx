import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package2, ExternalLink, Star, ChevronRight, X,
  Sparkles, ArrowRight, Search, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedMeshGradient from '../components/AnimatedMeshGradient';
import ToolModal from '../components/ToolModal';

// ─── Color map → Tailwind classes ────────────────────────────────────────────
const COLOR = {
  indigo: {
    bg:       'from-indigo-600/20 to-indigo-900/10',
    border:   'border-indigo-500/30 hover:border-indigo-500/60',
    badge:    'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
    glow:     'shadow-indigo-500/20',
    dot:      'bg-indigo-500',
    accent:   'text-indigo-400',
    pill:     'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    toolBg:   'bg-indigo-500/5 border-indigo-500/10 hover:border-indigo-500/30',
  },
  rose: {
    bg:       'from-rose-600/20 to-rose-900/10',
    border:   'border-rose-500/30 hover:border-rose-500/60',
    badge:    'bg-rose-500/15 text-rose-400 border border-rose-500/20',
    glow:     'shadow-rose-500/20',
    dot:      'bg-rose-500',
    accent:   'text-rose-400',
    pill:     'bg-rose-500/10 text-rose-300 border-rose-500/20',
    toolBg:   'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30',
  },
  cyan: {
    bg:       'from-cyan-600/20 to-cyan-900/10',
    border:   'border-cyan-500/30 hover:border-cyan-500/60',
    badge:    'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
    glow:     'shadow-cyan-500/20',
    dot:      'bg-cyan-500',
    accent:   'text-cyan-400',
    pill:     'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    toolBg:   'bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/30',
  },
  amber: {
    bg:       'from-amber-600/20 to-amber-900/10',
    border:   'border-amber-500/30 hover:border-amber-500/60',
    badge:    'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    glow:     'shadow-amber-500/20',
    dot:      'bg-amber-500',
    accent:   'text-amber-400',
    pill:     'bg-amber-500/10 text-amber-300 border-amber-500/20',
    toolBg:   'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30',
  },
  emerald: {
    bg:       'from-emerald-600/20 to-emerald-900/10',
    border:   'border-emerald-500/30 hover:border-emerald-500/60',
    badge:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    glow:     'shadow-emerald-500/20',
    dot:      'bg-emerald-500',
    accent:   'text-emerald-400',
    pill:     'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    toolBg:   'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30',
  },
  purple: {
    bg:       'from-purple-600/20 to-purple-900/10',
    border:   'border-purple-500/30 hover:border-purple-500/60',
    badge:    'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    glow:     'shadow-purple-500/20',
    dot:      'bg-purple-500',
    accent:   'text-purple-400',
    pill:     'bg-purple-500/10 text-purple-300 border-purple-500/20',
    toolBg:   'bg-purple-500/5 border-purple-500/10 hover:border-purple-500/30',
  },
};

const getLogoSrc = (tool) => {
  try {
    const domain = new URL(tool.link).hostname;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/utils/proxy-logo?domain=${domain}&name=${encodeURIComponent(tool.name)}`;
  } catch {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=6366f1&color=fff&bold=true&size=128`;
  }
};

// ─── Toolkit Detail Drawer ───────────────────────────────────────────────────
const ToolkitDrawer = ({ toolkit, onClose, onToolClick }) => {
  const c = COLOR[toolkit?.color] || COLOR.indigo;

  return (
    <AnimatePresence>
      {toolkit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/8 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10"
          >
            {/* Header */}
            <div className={`bg-gradient-to-br ${c.bg} px-6 pt-6 pb-5 border-b border-white/5 flex-shrink-0`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl select-none">{toolkit.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${c.badge}`}>
                        Official Toolkit
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white">{toolkit.name}</h2>
                    <p className="text-sm text-slate-400 mt-1 max-w-md leading-relaxed">{toolkit.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tags + stats */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {toolkit.tags?.map(tag => (
                  <span key={tag} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.pill}`}>
                    #{tag}
                  </span>
                ))}
                <span className="text-[10px] text-slate-500 ml-auto font-medium">
                  {toolkit.tools.length} tools included
                </span>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                Tools in this kit
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {toolkit.tools.map((tool, i) => (
                  <motion.button
                    key={tool._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { onToolClick(tool); onClose(); }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all group text-left ${c.toolBg}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/5 flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      <img src={getLogoSrc(tool)} alt={tool.name} className="w-full h-full object-contain p-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-bold text-white group-hover:${c.accent} transition-colors truncate`}>
                          {tool.name}
                        </p>
                        {tool.rating > 0 && (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] text-amber-400 font-bold">{tool.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{tool.tagline}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        tool.pricing === 'Free' ? 'bg-emerald-500/15 text-emerald-400' :
                        tool.pricing === 'Freemium' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-rose-500/15 text-rose-400'
                      }`}>
                        {tool.pricing}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Toolkit Card ─────────────────────────────────────────────────────────────
const ToolkitCard = ({ toolkit, index, onClick }) => {
  const c = COLOR[toolkit.color] || COLOR.indigo;
  const previewTools = toolkit.tools.slice(0, 5);
  const avgRating = toolkit.tools.length > 0
    ? (toolkit.tools.reduce((s, t) => s + (t.rating || 0), 0) / toolkit.tools.length).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={() => onClick(toolkit)}
      className={`group relative flex flex-col bg-slate-900/60 border ${c.border} rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-${c.glow} overflow-hidden`}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      {/* Content */}
      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl select-none group-hover:scale-110 transition-transform duration-300">
            {toolkit.emoji}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${c.badge}`}>
              Official
            </span>
            {avgRating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/15">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">{avgRating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Title + desc */}
        <h3 className="text-lg font-black text-white mb-2 group-hover:text-white transition-colors">
          {toolkit.name}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-5 group-hover:text-slate-400 transition-colors">
          {toolkit.description}
        </p>

        {/* Tool logo strip */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex -space-x-2">
            {previewTools.map((tool, i) => (
              <div
                key={tool._id}
                className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 overflow-hidden flex-shrink-0"
                style={{ zIndex: previewTools.length - i }}
              >
                <img
                  src={getLogoSrc(tool)}
                  alt={tool.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            ))}
          </div>
          {toolkit.tools.length > 5 && (
            <span className="text-xs text-slate-500 font-medium ml-1">
              +{toolkit.tools.length - 5} more
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center flex-wrap gap-1.5 mb-5">
          {toolkit.tags?.slice(0, 3).map(tag => (
            <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.pill}`}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-4 border-t border-white/5`}>
          <div className="flex items-center gap-1.5">
            <Package2 className={`w-3.5 h-3.5 ${c.accent}`} />
            <span className={`text-xs font-bold ${c.accent}`}>
              {toolkit.tools.length} tools
            </span>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${c.accent} opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0`}>
            <span>View Kit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ToolkitSkeleton = () => (
  <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 bg-slate-800 rounded-xl shimmer" />
      <div className="w-16 h-5 bg-slate-800 rounded-full shimmer" />
    </div>
    <div className="w-3/4 h-5 bg-slate-800 rounded-lg shimmer" />
    <div className="space-y-2">
      <div className="w-full h-3 bg-slate-800 rounded shimmer" />
      <div className="w-2/3 h-3 bg-slate-800 rounded shimmer" />
    </div>
    <div className="flex gap-2">
      {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 shimmer" />)}
    </div>
    <div className="w-full h-8 bg-slate-800 rounded-xl shimmer" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Toolkits = () => {
  const [toolkits, setToolkits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKit, setActiveKit] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/toolkits')
      .then(res => setToolkits(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = toolkits.filter(kit =>
    kit.name.toLowerCase().includes(search.toLowerCase()) ||
    kit.description.toLowerCase().includes(search.toLowerCase()) ||
    kit.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    setIsToolModalOpen(true);
  };

  const totalTools = toolkits.reduce((s, k) => s + k.tools.length, 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <AnimatedMeshGradient />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* ─── Hero ─── */}
        <section className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -z-10" />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Curated by AI experts</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-5 tracking-tight"
          >
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Toolkits</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Hand-picked collections of AI tools grouped by use case. Find the perfect stack for your workflow in seconds.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-8 mb-10"
          >
            {[
              { value: toolkits.length, label: 'Curated Kits' },
              { value: totalTools, label: 'Total Tools' },
              { value: '100%', label: 'Free to Browse' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-white">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-md mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search kits by name or tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/50 rounded-2xl py-4 pl-11 pr-5 text-sm text-white placeholder-slate-600 outline-none transition-all"
            />
          </motion.div>
        </section>

        {/* ─── Grid ─── */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <ToolkitSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
              <Package2 className="w-14 h-14 text-slate-800 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">No kits found</h3>
              <p className="text-slate-600 mt-2 text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((kit, i) => (
                <ToolkitCard
                  key={kit._id}
                  toolkit={kit}
                  index={i}
                  onClick={setActiveKit}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─── CTA ─── */}
        {!loading && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-3xl p-12"
          >
            <Users className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-3">Explore All AI Tools</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Browse all tools individually, filter by category, compare side-by-side, and build your own workflow.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <span>Explore Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.section>
        )}
      </main>
      <Footer />

      {/* Toolkit Drawer */}
      <ToolkitDrawer
        toolkit={activeKit}
        onClose={() => setActiveKit(null)}
        onToolClick={handleToolClick}
      />

      {/* Tool Detail Modal */}
      <ToolModal
        tool={selectedTool}
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
      />
    </div>
  );
};

export default Toolkits;
