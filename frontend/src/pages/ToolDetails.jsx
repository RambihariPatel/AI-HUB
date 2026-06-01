import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ToolCard from '../components/ToolCard';
import { 
  Star, ExternalLink, CheckCircle2, AlertCircle, 
  Cpu, CreditCard, Users, Zap, ThumbsUp, ThumbsDown, 
  MessageSquare, ChevronLeft, Globe, ShieldCheck, 
  Share2, ArrowRight, TrendingUp, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ToolDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [relatedTools, setRelatedTools] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${id}`);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/tools/${id}`);
        setTool(data);
        
        // Record history if user is logged in
        if (user) {
          axios.post('/api/users/history', { toolId: id }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        }

        // Fetch related tools
        const relatedRes = await axios.get(`/api/tools`, {
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
      await axios.post('/api/reviews', {
        toolId: id,
        rating: userRating,
        comment: userComment
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      toast.success('Review posted successfully! 🚀');
      setUserComment('');
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
                src={`/api/utils/proxy-logo?domain=${new URL(tool.link).hostname}&name=${encodeURIComponent(tool.name)}`}
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
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Rate your experience</p>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              className="focus:outline-none transition-transform active:scale-90"
                            >
                              <Star 
                                className={`w-8 h-8 ${
                                  star <= userRating 
                                    ? 'text-yellow-500 fill-yellow-500 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' 
                                    : 'text-slate-700 hover:text-slate-600'
                                } transition-colors`}
                              />
                            </button>
                          ))}
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
                        className="flex-1 min-h-[160px] bg-slate-950/50 border border-white/10 rounded-3xl p-6 text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-lg font-medium resize-none mb-6"
                      />
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
            ) : (
              reviews.map((review, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card-premium rounded-[2rem] p-8 border border-white/5 hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white border border-white/5 shadow-xl uppercase ring-4 ring-indigo-500/10">
                        {review.userName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-black group-hover:text-indigo-400 transition-colors">{review.userName}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-400 font-medium leading-relaxed italic line-clamp-4 relative">
                    <span className="text-indigo-500/50 text-4xl absolute -top-4 -left-2 opacity-50 font-serif">“</span>
                    {review.comment}
                  </p>
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
    </div>
  );
};

export default ToolDetails;
