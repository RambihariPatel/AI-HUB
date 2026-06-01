import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, ExternalLink, TrendingUp, Users, MousePointer2, ShieldCheck, Zap, GitCompare, Heart, Bell, BookmarkPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SaveToCollectionModal from './SaveToCollectionModal';
import { motion } from 'framer-motion';

const ToolCard = ({ tool }) => {
  const { user } = useAuth();
  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
  const [isCompared, setIsCompared] = React.useState(() => {
    try {
      const stored = localStorage.getItem('compareTools');
      const list = stored ? JSON.parse(stored) : [];
      return list.some(t => t._id === tool._id);
    } catch {
      return false;
    }
  });

  const [isFavorited, setIsFavorited] = React.useState(() => {
    try {
      const stored = localStorage.getItem('favoritesList');
      const list = stored ? JSON.parse(stored) : [];
      return list.includes(tool._id);
    } catch {
      return false;
    }
  });

  const [isSubscribed, setIsSubscribed] = React.useState(() => {
    try {
      const stored = localStorage.getItem('alertSubscriptionsList');
      const list = stored ? JSON.parse(stored) : [];
      return list.includes(tool._id);
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const handleCompareUpdate = () => {
      try {
        const stored = localStorage.getItem('compareTools');
        const list = stored ? JSON.parse(stored) : [];
        setIsCompared(list.some(t => t._id === tool._id));
      } catch {}
    };
    window.addEventListener('compareUpdated', handleCompareUpdate);
    return () => window.removeEventListener('compareUpdated', handleCompareUpdate);
  }, [tool._id]);

  React.useEffect(() => {
    const handleFavoritesUpdate = () => {
      try {
        const stored = localStorage.getItem('favoritesList');
        const list = stored ? JSON.parse(stored) : [];
        setIsFavorited(list.includes(tool._id));
      } catch {}
    };
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, [tool._id]);

  React.useEffect(() => {
    const handleSubscriptionsUpdate = () => {
      try {
        const stored = localStorage.getItem('alertSubscriptionsList');
        const list = stored ? JSON.parse(stored) : [];
        setIsSubscribed(list.includes(tool._id));
      } catch {}
    };
    window.addEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);
    return () => window.removeEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);
  }, [tool._id]);

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let currentCompare = [];
    try {
      const stored = localStorage.getItem('compareTools');
      currentCompare = stored ? JSON.parse(stored) : [];
    } catch {
      currentCompare = [];
    }

    const isAlreadyAdded = currentCompare.some(t => t._id === tool._id);
    if (isAlreadyAdded) {
      const updated = currentCompare.filter(t => t._id !== tool._id);
      localStorage.setItem('compareTools', JSON.stringify(updated));
      window.dispatchEvent(new Event('compareUpdated'));
      setIsCompared(false);
      toast.success(`${tool.name} removed from comparison.`);
    } else {
      if (currentCompare.length >= 2) {
        toast.toast ? toast.error('You can compare up to 2 tools at a time.') : toast.error('You can compare up to 2 tools at a time.');
        return;
      }
      const updated = [...currentCompare, tool];
      localStorage.setItem('compareTools', JSON.stringify(updated));
      window.dispatchEvent(new Event('compareUpdated'));
      setIsCompared(true);
      toast.success(`${tool.name} added to comparison! 🏆`);
    }
  };

  const handleToggleSubscription = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to subscribe to alerts! 🔔');
      return;
    }

    try {
      const { data } = await axios.post('/api/users/subscriptions', 
        { toolId: tool._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const isSub = data.alertSubscriptions.some(id => id.toString() === tool._id);
      setIsSubscribed(isSub);
      localStorage.setItem('alertSubscriptionsList', JSON.stringify(data.alertSubscriptions));
      window.dispatchEvent(new Event('subscriptionsUpdated'));
      
      if (isSub) {
        toast.success(`Subscribed to alerts for ${tool.name}! 🔔`);
      } else {
        toast.success(`Unsubscribed from alerts for ${tool.name}.`);
      }
    } catch (error) {
      toast.error('Failed to update subscription.');
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to save tools! ❤️');
      return;
    }

    try {
      const { data } = await axios.post('/api/users/favorites', 
        { toolId: tool._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      const isFav = data.favorites.some(id => id?.toString() === tool._id);
      
      const { data: cols } = await axios.get('/api/collections', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const favIds = data.favorites.map(id => id?.toString()).filter(Boolean);
      const colIds = cols.flatMap(c => c.tools.map(t => t._id || t));
      const allSavedIds = Array.from(new Set([...favIds, ...colIds]));
      
      localStorage.setItem('favoritesList', JSON.stringify(allSavedIds));
      window.dispatchEvent(new Event('favoritesUpdated'));
      
      if (isFav) {
        toast.success('Added to Favorites! ❤️');
      } else {
        toast.success('Removed from Favorites.');
      }
    } catch (error) {
      toast.error('Failed to update favorites.');
    }
  };

  const handleOpenCollections = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to save to folders! 📂');
      return;
    }

    setIsSaveModalOpen(true);
  };

  const getPricingColor = (pricing) => {
    switch (pricing) {
      case 'Free': return 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20';
      case 'Freemium': return 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20';
      case 'Paid': return 'from-indigo-500/10 to-purple-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'from-slate-500/10 to-slate-600/10 text-slate-400 border-slate-500/20';
    }
  };

  const hostname = new URL(tool.link).hostname;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative bg-slate-900/35 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full premium-glow transition-all duration-300 hover:border-indigo-500/35 hover:shadow-[0_30px_60px_rgba(99,102,241,0.15)]"
    >
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[50px] -z-10 group-hover:scale-125 transition-transform duration-500" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-10" />

      {/* Card Content Wrapper */}
      <Link to={`/tool/${tool._id}`} className="p-6 flex flex-col flex-1 cursor-pointer">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-5 gap-3">
          <div className="flex items-center space-x-3.5">
            {/* Logo Container */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-3 shadow-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-indigo-500/30 transition-all duration-500">
                <img 
                  src={`${import.meta.env.VITE_API_URL || ''}/api/utils/proxy-logo?domain=${hostname}&name=${encodeURIComponent(tool.name)}`}
                  alt={tool.name} 
                  className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {tool.popularity === 'High' && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 p-1.5 rounded-full shadow-lg border border-slate-950/80 animate-pulse">
                  <TrendingUp className="w-3 h-3 text-slate-950" />
                </div>
              )}
            </div>
            
            {/* Title & Category */}
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors leading-tight">
                  {tool.name}
                </h3>
                {tool.rating >= 4.5 && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-500/10 shrink-0" title="Top Rated & Verified" />
                )}
              </div>
              <span className="inline-block text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                {tool.category}
              </span>
            </div>
          </div>

          {/* Action Floaters */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto mt-2 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleSubscription}
              title={isSubscribed ? "Mute alerts" : "Get price & update alerts"}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                isSubscribed 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' 
                  : 'bg-slate-950/40 text-slate-500 border-white/5 hover:text-white hover:border-slate-700'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-amber-400 text-amber-400' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleFavorite}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                isFavorited 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20' 
                  : 'bg-slate-950/40 text-slate-500 border-white/5 hover:text-white hover:border-slate-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-400 text-rose-400' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleOpenCollections}
              title="Save to Folder"
              className="p-2 rounded-xl border transition-all duration-300 bg-slate-950/40 text-slate-500 border-white/5 hover:text-white hover:border-slate-700"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleCompare}
              title={isCompared ? "Remove from comparison" : "Add to comparison"}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                isCompared 
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20' 
                  : 'bg-slate-950/40 text-slate-500 border-white/5 hover:text-white hover:border-slate-700'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Pricing Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-gradient-to-r ${getPricingColor(tool.pricing)}`}>
            {tool.pricing}
          </span>
        </div>

        {/* Tagline & Description */}
        <div className="mb-5">
          <h4 className="text-indigo-300/90 text-sm font-bold mb-2 line-clamp-1 group-hover:text-indigo-200 transition-colors">
            {tool.tagline || "Advanced AI for your workflow"}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {tool.descriptionShort}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-slate-950/30 rounded-2xl p-2.5 border border-white/5 flex flex-col items-center justify-center hover:bg-slate-950/50 transition-colors">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-white">{tool.rating.toFixed(1)}</span>
            </div>
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Rating</span>
          </div>
          <div className="bg-slate-950/30 rounded-2xl p-2.5 border border-white/5 flex flex-col items-center justify-center hover:bg-slate-950/50 transition-colors">
            <div className="flex items-center space-x-1 mb-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-black text-white">{tool.monthlyUsers || '10k+'}</span>
            </div>
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Users</span>
          </div>
          <div className="bg-slate-950/30 rounded-2xl p-2.5 border border-white/5 flex flex-col items-center justify-center hover:bg-slate-950/50 transition-colors">
            <div className="flex items-center space-x-1 mb-1">
              {tool.favoriteCount !== undefined ? (
                <>
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span className="text-xs font-black text-white">{tool.favoriteCount}</span>
                </>
              ) : (
                <>
                  <MousePointer2 className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-black text-white">{tool.clicks || '0'}</span>
                </>
              )}
            </div>
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
              {tool.favoriteCount !== undefined ? 'Favorites' : 'Clicks'}
            </span>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {(tool.features || ['AI Powered']).slice(0, 3).map((feature, i) => (
            <span key={i} className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-slate-950/50 text-slate-400 border border-white/5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-indigo-500" />
              {feature}
            </span>
          ))}
        </div>

        {/* Free Tier Details (High Performance Highlight) */}
        {(tool.pricing === 'Free' || tool.pricing === 'Freemium') && tool.modelInfo && (
          <div className="mt-2 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4.5 relative overflow-hidden group/free">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/free:opacity-40 transition-opacity">
              <Zap className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Free Tier Access</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Model</p>
                  <p className="text-xs font-black text-white truncate">{tool.modelInfo.modelName || 'Standard'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Credits</p>
                  <p className="text-xs font-black text-indigo-300 truncate">{tool.modelInfo.credits || 'Unlimited'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Link>

      {/* Footer Actions */}
      <div className="border-t border-white/5 flex items-stretch h-12 mt-auto bg-slate-950/20 backdrop-blur-md">
        <Link 
          to={`/tool/${tool._id}`}
          className="flex-1 flex items-center justify-center space-x-2 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
        <div className="w-[1px] bg-white/5" />
        <a 
          href={tool.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-2 text-xs font-black transition-all duration-300"
        >
          <span>Launch AI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <SaveToCollectionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        tool={tool}
      />
    </motion.div>
  );
};

export default ToolCard;
