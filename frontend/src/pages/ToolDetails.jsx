import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ToolCard from '../components/ToolCard';
import { 
  Star, ExternalLink, CheckCircle2, AlertCircle, 
  Cpu, CreditCard, Users, Zap, ThumbsUp, ThumbsDown, 
  MessageSquare, ChevronLeft, Globe, ShieldCheck, 
  Share2, ArrowRight, TrendingUp, User, X, GitCompare, Heart, Bell, BookmarkPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import SaveToCollectionModal from '../components/SaveToCollectionModal';

const ToolDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const getHostname = (urlStr) => {
    try {
      if (!urlStr) return '';
      let formattedUrl = urlStr;
      if (!/^https?:\/\//i.test(urlStr)) {
        formattedUrl = `https://${urlStr}`;
      }
      return new URL(formattedUrl).hostname;
    } catch (e) {
      return '';
    }
  };
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [relatedTools, setRelatedTools] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [isCompared, setIsCompared] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [liveViewers, setLiveViewers] = useState(3);

  useEffect(() => {
    if (!tool) return;
    const getBaseViewers = (usersStr) => {
      if (!usersStr) return 3;
      if (usersStr.includes('M')) {
        return Math.floor(Math.random() * 25 + 15);
      }
      if (usersStr.includes('k')) {
        const val = parseInt(usersStr);
        if (val > 500) return Math.floor(Math.random() * 8 + 6);
        return Math.floor(Math.random() * 4 + 3);
      }
      return 3;
    };
    let current = getBaseViewers(tool.monthlyUsers);
    setLiveViewers(current);

    const interval = setInterval(() => {
      setLiveViewers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(2, Math.min(45, next));
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [tool]);

  useEffect(() => {
    if (!tool) return;
    try {
      const stored = localStorage.getItem('alertSubscriptionsList');
      const list = stored ? JSON.parse(stored) : [];
      setIsSubscribed(list.includes(tool._id));
    } catch {}

    const handleSubscriptionsUpdate = () => {
      try {
        const stored = localStorage.getItem('alertSubscriptionsList');
        const list = stored ? JSON.parse(stored) : [];
        setIsSubscribed(list.includes(tool._id));
      } catch {}
    };

    window.addEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);
    return () => window.removeEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);
  }, [tool]);

  const handleToggleSubscription = async () => {
    if (!user) {
      toast.error('Please log in to subscribe to alerts! 🔔');
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/subscriptions', 
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
  const [screenshot, setScreenshot] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot('');
    setScreenshotPreview('');
  };

  const handleToggleHelpful = async (reviewId) => {
    if (!user) {
      toast.error('Please log in to vote on reviews! 👍');
      return;
    }

    try {
      const { data } = await axios.post(`http://localhost:5000/api/reviews/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpfulVotes: data.helpfulVotes, badges: data.badges } : r));
      toast.success(data.helpfulVotes.some(uid => uid.toString() === user._id) ? 'Marked as helpful! 👍' : 'Removed vote.');
    } catch (error) {
      toast.error('Failed to register vote.');
    }
  };

  useEffect(() => {
    if (!tool) return;
    try {
      const stored = localStorage.getItem('compareTools');
      const list = stored ? JSON.parse(stored) : [];
      setIsCompared(list.some(t => t._id === tool._id));
    } catch {}

    try {
      const stored = localStorage.getItem('favoritesList');
      const list = stored ? JSON.parse(stored) : [];
      setIsFavorited(list.includes(tool._id));
    } catch {}

    const handleCompareUpdate = () => {
      try {
        const stored = localStorage.getItem('compareTools');
        const list = stored ? JSON.parse(stored) : [];
        setIsCompared(list.some(t => t._id === tool._id));
      } catch {}
    };

    const handleFavoritesUpdate = () => {
      try {
        const stored = localStorage.getItem('favoritesList');
        const list = stored ? JSON.parse(stored) : [];
        setIsFavorited(list.includes(tool._id));
      } catch {}
    };

    window.addEventListener('compareUpdated', handleCompareUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('compareUpdated', handleCompareUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [tool]);

  const handleToggleCompare = () => {
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
        toast.error('You can compare up to 2 tools at a time.');
        return;
      }
      const updated = [...currentCompare, tool];
      localStorage.setItem('compareTools', JSON.stringify(updated));
      window.dispatchEvent(new Event('compareUpdated'));
      setIsCompared(true);
      toast.success(`${tool.name} added to comparison! 🏆`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in to save tools! ❤️');
      return;
    }
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/favorites', 
        { toolId: tool._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      const isFav = data.favorites.some(id => id?.toString() === tool._id);
      setIsFavorited(isFav);
      
      const { data: cols } = await axios.get('http://localhost:5000/api/collections', {
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

  const handleOpenCollections = () => {
    if (!user) {
      toast.error('Please log in to save to folders! 📂');
      return;
    }
    setIsSaveModalOpen(true);
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/tools/${id}`);
        setTool(data);
        
        // Record history if user is logged in
        if (user) {
          axios.post('http://localhost:5000/api/users/history', { toolId: id }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        }

        // Fetch related tools
        const relatedRes = await axios.get(`http://localhost:5000/api/tools`, {
          params: { category: data.category }
        });
        setRelatedTools(relatedRes.data.filter(t => t._id !== id).slice(0, 4));

        // Fetch initial reviews
        fetchReviews();
      } catch (error) {
        console.error('Error fetching tool details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToolDetails();
    window.scrollTo(0, 0);
  }, [id, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    if (!userComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post('http://localhost:5000/api/reviews', {
        toolId: id,
        rating: userRating,
        comment: userComment,
        screenshot: screenshot
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      toast.success('Review posted successfully! 🚀');
      setUserComment('');
      setScreenshot('');
      setScreenshotPreview('');
      setShowReviewForm(false);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${tool.name} - AI Tools Hub`,
      text: `Check out ${tool.name}: ${tool.tagline}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share not supported');
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (copyErr) {
        toast.error('Failed to copy link.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-bold animate-pulse">Loading AI intelligence...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">AI Tool Not Found</h2>
          <Link to="/" className="btn-primary inline-flex items-center space-x-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      {/* Hero Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Link to={`/category/${tool.category}`} className="flex items-center space-x-2 text-slate-500 hover:text-white transition-all group">
            <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Back to {tool.category}</span>
          </Link>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button 
              onClick={handleToggleSubscription}
              title={isSubscribed ? "Mute alerts" : "Get price & update alerts"}
              className={`p-3 rounded-xl border transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2 ${
                isSubscribed 
                  ? 'bg-amber-600/20 text-amber-500 border-amber-500/30' 
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Bell className={`w-5 h-5 ${isSubscribed ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button 
              onClick={handleToggleFavorite}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className={`p-3 rounded-xl border transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2 ${
                isFavorited 
                  ? 'bg-rose-600/20 text-rose-500 border-rose-500/30 animate-pulse' 
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button 
              onClick={handleOpenCollections}
              title="Save to Folder"
              className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/10 active:scale-95 flex items-center justify-center"
            >
              <BookmarkPlus className="w-5 h-5" />
            </button>
            <button 
              onClick={handleToggleCompare}
              title={isCompared ? "Remove from comparison" : "Add to comparison"}
              className={`p-3 rounded-xl border transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2 ${
                isCompared 
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 animate-pulse' 
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <GitCompare className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/10 active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <a 
              href={tool.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none px-6 md:px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Visit Site</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Hero Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">
          <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 md:p-8 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 group hover:border-indigo-500/50 transition-colors"
            >
              <img 
                src={`/api/utils/proxy-logo?domain=${getHostname(tool.link)}&name=${encodeURIComponent(tool.name)}`}
                alt={tool.name} 
                className="max-w-full max-h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
              />
            </motion.div>
            <div className="text-center md:text-left pt-2 md:pt-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{tool.name}</h1>
                <div className="flex flex-wrap justify-center gap-2">
                  {tool.rating >= 4.5 && (
                    <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                  )}
                  {tool.popularity === 'High' && (
                    <div className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Trending</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-indigo-300 mb-6 leading-tight max-w-2xl">{tool.tagline}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                <div className="flex items-center space-x-2 bg-slate-900/50 px-3 md:px-4 py-2 rounded-xl border border-white/5">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-base md:text-lg font-black text-white">{tool.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-900/50 px-3 md:px-4 py-2 rounded-xl border border-white/5 text-slate-400 font-bold">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  <span className="text-sm md:text-base text-white">{tool.monthlyUsers || '10k+'}</span>
                </div>
              </div>

              {/* Glowing Live Concurrent Viewers Tracker */}
              <div className="mt-5 flex items-center space-x-2.5 bg-slate-900/40 px-4 py-2.5 rounded-2xl border border-white/5 w-fit mx-auto md:mx-0 shadow-[0_0_15px_rgba(239,68,68,0.03)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-none">
                  🔥 <span className="text-red-400 font-black">{liveViewers}</span> people exploring this platform right now!
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            <div className="glass-card-premium rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-indigo-400 mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xl md:text-2xl font-black text-white">{tool.clicks || 0}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Clicks</p>
            </div>
            <div className="glass-card-premium rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
              <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xl md:text-2xl font-black text-white">{tool.pricing}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Pricing</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-16">
            {/* About Section */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                <h2 className="text-2xl font-black text-white">Advanced Overview</h2>
              </div>
              <div className="glass-card-premium rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
                <p className="text-lg text-slate-300 leading-relaxed relative z-10">
                  {tool.descriptionLong}
                </p>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-3xl rounded-full" />
              </div>
            </section>

            {/* Features & Capabilities */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-purple-500 rounded-full" />
                <h2 className="text-2xl font-black text-white">Core Capabilities</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.features.map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-4 p-5 bg-slate-900/50 rounded-2xl border border-white/5 hover:bg-slate-900 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-slate-200 font-bold text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Pros & Cons */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                <h3 className="flex items-center space-x-3 text-2xl font-black text-emerald-400 mb-8">
                  <ThumbsUp className="w-6 h-6" />
                  <span>The Good Parts</span>
                </h3>
                <ul className="space-y-4">
                  {tool.pros.map((pro, i) => (
                    <li key={i} className="flex items-start space-x-4 text-slate-300 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10">
                <h3 className="flex items-center space-x-3 text-2xl font-black text-red-400 mb-8">
                  <ThumbsDown className="w-6 h-6" />
                  <span>The Downsides</span>
                </h3>
                <ul className="space-y-4">
                  {tool.cons.map((con, i) => (
                    <li key={i} className="flex items-start space-x-4 text-slate-300 font-medium">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      </div>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Use Cases */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-amber-500 rounded-full" />
                <h2 className="text-2xl font-black text-white">Popular Use Cases</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {tool.useCases.map((useCase, i) => (
                  <div key={i} className="px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 font-bold hover:text-white transition-all cursor-default">
                    {useCase}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Detail Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Model Information Card */}
            <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 sticky top-28">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">AI Model Intelligence</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Architecture</p>
                    <p className="text-lg font-black text-white">{tool.modelInfo.modelName}</p>
                  </div>
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 text-xs font-black uppercase">
                    {tool.modelInfo.modelType}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Free Model Availability</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${tool.modelInfo.freeAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <p className="text-white font-bold">{tool.modelInfo.freeAvailable ? 'High-Performance Free Tier' : 'Paid Only Access'}</p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Credit System</p>
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">{tool.modelInfo.credits}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                  <span className="text-slate-400 font-bold">API Access</span>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${tool.modelInfo.apiAccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tool.modelInfo.apiAccess ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Available</> : <><AlertCircle className="w-3 h-3 mr-1" /> restricted</>}
                  </div>
                </div>
              </div>

              {/* Pricing Shortcut */}
              <div className="mt-10 pt-10 border-t border-white/5">
                <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 text-center">Pricing Tiers</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <span className="text-slate-300 font-bold group-hover:text-white">Free Access</span>
                    <span className="text-indigo-400 font-black">$0</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30">
                    <span className="text-white font-black italic">Pro Plan</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <a 
                  href={tool.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-3 bg-white text-slate-950 py-5 rounded-3xl font-black text-lg hover:bg-indigo-50 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.1)] group"
                >
                  <span>Start Building Now</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-32">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-pink-500 rounded-full" />
              <h2 className="text-3xl font-black text-white">Community Feedback</h2>
            </div>
            
            {user ? (
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                  showReviewForm 
                    ? 'bg-slate-800 text-slate-300' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                }`}
              >
                {showReviewForm ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
              </button>
            ) : (
              <Link to="/login" className="px-6 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-400 font-bold hover:text-white transition-all flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Login to Review</span>
              </Link>
            )}
          </div>

          {/* Rating Breakdown Dashboard */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* Left side: Avg Rating Card */}
              <div className="lg:col-span-4 bg-slate-900/40 rounded-[2rem] border border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Average User Rating</p>
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-6xl font-black text-white">{tool.rating.toFixed(1)}</span>
                  <span className="text-xl text-slate-500 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const ratingVal = Math.round(tool.rating);
                    return (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= ratingVal
                            ? 'text-yellow-500 fill-yellow-500 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                            : 'text-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 font-bold">
                  Based on <span className="text-white font-black">{reviews.length} reviews</span>
                </p>
              </div>

              {/* Right side: Detailed Breakdown Progress Bars */}
              <div className="lg:col-span-8 bg-slate-900/40 rounded-[2rem] border border-white/5 p-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Rating Distribution</p>
                  {selectedRatingFilter && (
                    <button
                      onClick={() => setSelectedRatingFilter(null)}
                      className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1"
                    >
                      <span>Clear Filter ({selectedRatingFilter} Star)</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    const isSelected = selectedRatingFilter === stars;
                    return (
                      <button
                        key={stars}
                        onClick={() => {
                          if (count > 0) {
                            setSelectedRatingFilter(isSelected ? null : stars);
                          }
                        }}
                        disabled={count === 0}
                        className={`w-full flex items-center space-x-4 p-2 rounded-xl text-left transition-all ${
                          count === 0
                            ? 'opacity-30 cursor-not-allowed'
                            : isSelected
                            ? 'bg-indigo-500/10 border border-indigo-500/20'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span className="w-12 text-sm font-black text-white whitespace-nowrap flex items-center space-x-1">
                          <span>{stars}</span>
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        </span>
                        <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                            }`}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-bold text-slate-400">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="overflow-hidden mb-12"
              >
                <form 
                  onSubmit={handleReviewSubmit}
                  className="glass-card-premium rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl bg-indigo-500/5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 space-y-6">
                      <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Rate your experience</p>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="focus:outline-none transition-transform active:scale-75 hover:scale-110"
                            >
                              <Star 
                                className={`w-8 h-8 ${
                                  star <= (hoverRating || userRating) 
                                    ? 'text-yellow-500 fill-yellow-500 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' 
                                    : 'text-slate-700 hover:text-slate-600'
                                } transition-colors duration-150`}
                              />
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 min-h-[24px]">
                          <motion.p
                            key={hoverRating || userRating}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-black text-indigo-300"
                          >
                            {(() => {
                              const activeRating = hoverRating || userRating;
                              switch (activeRating) {
                                case 1: return "Bakwaas hai! 😡 (Terrible)";
                                case 2: return "Kaam chalau hai. 😐 (Average)";
                                case 3: return "Achha hai, normal use ke liye. 🙂 (Good)";
                                case 4: return "Dhamakedar! Mazaa aa gaya. 🚀 (Awesome)";
                                case 5: return "Ekdum Gazab! Solid tool. 💎🔥 (Outstanding)";
                                default: return "";
                              }
                            })()}
                          </motion.p>
                        </div>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/5">
                        <div className="flex items-center space-x-3 mb-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-black text-white uppercase tracking-tight">Verified Feedback</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                          Your review helps the community discover the best AI tools. Be honest and detailed!
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-8 flex flex-col">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Detailed Review</p>
                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="What do you think about this AI tool? Mention features, pricing, or ease of use..."
                        className="flex-1 min-h-[160px] bg-slate-950/50 border border-white/10 rounded-3xl p-6 text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-lg font-medium resize-none mb-4"
                      />

                      {/* Screenshot drag-and-drop / upload input */}
                      <div className="mb-6">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Upload Screenshot of your work (Optional)</p>
                        
                        {!screenshotPreview ? (
                          <label className="flex flex-col items-center justify-center h-28 w-full bg-slate-950/50 border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-slate-950 rounded-2xl cursor-pointer group transition-all">
                            <div className="flex flex-col items-center justify-center space-y-1.5 text-center px-4">
                              <span className="text-indigo-400 font-bold text-sm group-hover:text-indigo-300">Click to upload screenshot</span>
                              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">PNG or JPG, max 2MB</span>
                            </div>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={handleScreenshotChange}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-white/10 group">
                            <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={handleRemoveScreenshot}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          disabled={isSubmitting}
                          type="submit"
                          className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 group"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              <span>Posting...</span>
                            </>
                          ) : (
                            <>
                              <span>Post Review</span>
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-slate-900/30 rounded-[3rem] border border-dashed border-white/5">
                <MessageSquare className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-400">No user reviews yet.</h3>
                <p className="text-slate-600">Be the first to share your thoughts on {tool.name}.</p>
              </div>
            ) : selectedRatingFilter && reviews.filter(r => r.rating === selectedRatingFilter).length === 0 ? (
              <div className="col-span-full text-center py-16 bg-slate-900/30 rounded-[3rem] border border-dashed border-white/5">
                <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-400">No {selectedRatingFilter}-star reviews found.</h3>
                <button 
                  onClick={() => setSelectedRatingFilter(null)}
                  className="mt-2 text-sm text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                >
                  Clear filter to see all reviews
                </button>
              </div>
            ) : (
              reviews
                .filter(review => !selectedRatingFilter || review.rating === selectedRatingFilter)
                .map((review, i) => (
                  <motion.div 
                    key={review._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card-premium rounded-[2.25rem] p-8 border border-white/5 hover:-translate-y-1 hover:border-indigo-500/20 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      {/* Review Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white border border-white/5 shadow-xl uppercase ring-4 ring-indigo-500/10">
                            {review.userName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-1">
                              <p className="text-white font-black group-hover:text-indigo-400 transition-colors leading-none">{review.userName}</p>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} />
                          ))}
                        </div>
                      </div>

                      {/* Dynamic User Badges */}
                      {review.badges && review.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {review.badges.map(badge => {
                            let badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                            if (badge === 'Verified Creator') badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                            if (badge === 'Power User') badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                            return (
                              <span key={badge} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                                {badge}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Comment text */}
                      <p className="text-slate-400 font-medium leading-relaxed italic relative pl-4 border-l border-white/5 text-sm">
                        <span className="text-indigo-500/30 text-4xl absolute -top-4 -left-1 opacity-50 font-serif">“</span>
                        {review.comment}
                      </p>

                      {/* Screenshot display */}
                      {review.screenshot && (
                        <div 
                          onClick={() => setLightboxImage(review.screenshot)}
                          className="mt-5 relative rounded-2xl overflow-hidden border border-white/5 max-w-full cursor-zoom-in group/img shadow-md hover:border-indigo-500/30 transition-all"
                        >
                          <img src={review.screenshot} alt="User created work screenshot" className="w-full h-auto object-cover max-h-40 group-hover/img:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-[1px]">
                            <span>Click to Zoom</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Review Footer with Helpful upvotes toggle */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleHelpful(review._id)}
                        className={`flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                          user && review.helpfulVotes?.some(uid => uid.toString() === user._id)
                            ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                            : 'bg-slate-950/40 text-slate-500 border-white/5 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({review.helpfulVotes?.length || 0})</span>
                      </button>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </section>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center space-x-3 mb-12">
              <div className="w-2 h-8 bg-indigo-500 rounded-full" />
              <h2 className="text-3xl font-black text-white">More {tool.category} AI Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedTools.map(relatedTool => (
                <ToolCard key={relatedTool._id} tool={relatedTool} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link 
                to={`/category/${tool.category}`}
                className="inline-flex items-center space-x-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors group"
              >
                <span>View All {tool.category} Tools</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        )}
      </main>
      <SaveToCollectionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        tool={tool}
      />

      {/* Screenshot Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] z-10 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden p-2 shadow-2xl flex items-center justify-center"
            >
              <button 
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300 hover:text-white transition-all border border-white/5 z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={lightboxImage} alt="Full screen review work screenshot" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolDetails;
