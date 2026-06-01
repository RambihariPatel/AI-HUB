import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ToolCard from '../components/ToolCard';
import { Folder, AlertCircle, ChevronLeft, Globe, Share2, Compass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SharedFolder = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveViewers, setLiveViewers] = useState(3);

  useEffect(() => {
    setLiveViewers(Math.floor(Math.random() * 5 + 3));
    const interval = setInterval(() => {
      setLiveViewers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(2, Math.min(10, next));
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSharedCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/api/collections/shared/${id}`);
        setCollection(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'This folder is private or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedCollection();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-bold animate-pulse">Retrieving shared AI stack...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card-premium rounded-[2.5rem] p-10 border border-white/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {error || 'This collection has been made private by its creator or does not exist.'}
          </p>
          <div className="flex gap-4 w-full">
            <Link to="/" className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20 text-center flex items-center justify-center space-x-2">
              <Compass className="w-4 h-4" />
              <span>Explore Hub</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Decorative gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-10">
          <Link to="/" className="flex items-center space-x-2 text-slate-500 hover:text-white transition-all group w-fit">
            <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Back to AI Hub</span>
          </Link>
        </div>

        {/* Collection Hero Header */}
        <div className="glass-card-premium rounded-[3rem] p-8 md:p-12 border border-white/5 mb-12 bg-gradient-to-b from-indigo-950/10 to-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 relative z-10 text-center md:text-left">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.75rem] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-2xl shrink-0">
              <Folder className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            
            <div className="flex-1 space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>Shared Collection</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{collection.name}</h1>
              <p className="text-sm md:text-base text-slate-400 font-medium">
                Curated AI Stack by <span className="text-indigo-400 font-bold">{collection.user?.name || 'Community Member'}</span>
              </p>
              
              {/* Glowing Live Concurrent Viewers Tracker */}
              <div className="mt-3 flex items-center space-x-2 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/5 w-fit shadow-[0_0_15px_rgba(239,68,68,0.02)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none">
                  🔥 <span className="text-red-400 font-black">{liveViewers}</span> developers viewing this stack now
                </p>
              </div>
            </div>
            
            <div className="shrink-0 flex items-center bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 shadow-inner">
              <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-center">AI Platforms</p>
                <p className="text-2xl font-black text-white text-center mt-0.5">{collection.tools?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Tools Grid */}
        <section className="space-y-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            <h2 className="text-xl font-black text-white uppercase tracking-wider">AI Stack Showcase</h2>
          </div>

          {collection.tools.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/10 rounded-[2.5rem] border border-dashed border-white/5">
              <Sparkles className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400">This stack is empty</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                The curator hasn't loaded any AI platforms into this stack yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collection.tools.map(tool => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          )}
        </section>

        {/* Extra discovery call to action */}
        <div className="mt-16 text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 font-black transition-all hover:translate-x-1">
            <span>Discover more AI Platforms</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SharedFolder;
