import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, LayoutDashboard, Heart, History, Sparkles, 
  ExternalLink, Check, Trash2, ArrowLeft, Hourglass, Bookmark, Lock, Loader2, ArrowRight, Rocket,
  Folder, Plus, X, Cpu, Layers, ThumbsUp, ThumbsDown, Globe, Share2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ToolCard from '../components/ToolCard';
import AnimatedMeshGradient from '../components/AnimatedMeshGradient';
import SkeletonCard from '../components/SkeletonCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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

  const [activeTab, setActiveTab] = useState('submissions'); // submissions, favorites, history for user; moderation for admin
  const [loading, setLoading] = useState(true);
  
  // States for user data
  const [mySubmissions, setMySubmissions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [expandedFolderId, setExpandedFolderId] = useState('favorites'); // 'favorites' or collection ID
  const [newFolderName, setNewFolderName] = useState('');
  const [submittingFolder, setSubmittingFolder] = useState(false);
  
  // States for admin data
  const [pendingTools, setPendingTools] = useState([]);
  const [inspectTool, setInspectTool] = useState(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [activeInspectTab, setActiveInspectTab] = useState('overview'); // overview, specs, features, feedback

  useEffect(() => {
    if (!user) return;

    if (user.isAdmin) {
      setActiveTab('moderation');
      fetchPendingTools();
    } else {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handleFavoritesUpdate = async () => {
      try {
        const [favRes, colRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/favorites', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get('http://localhost:5000/api/collections', {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);
        setFavorites(favRes.data);
        setCollections(colRes.data);
      } catch (err) {
        console.error('Error syncing dashboard favorites/collections:', err);
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, [user]);

  const fetchPendingTools = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/tools/pending', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPendingTools(data);
    } catch (error) {
      toast.error('Failed to fetch pending tools.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch My Submissions
      const subRes = await axios.get('http://localhost:5000/api/tools/my-submissions', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMySubmissions(subRes.data);

      // Fetch Favorites
      const favRes = await axios.get('http://localhost:5000/api/users/favorites', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFavorites(favRes.data);

      // Fetch History
      const histRes = await axios.get('http://localhost:5000/api/users/history', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setHistory(histRes.data);

      // Fetch Collections
      const colRes = await axios.get('http://localhost:5000/api/collections', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCollections(colRes.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setSubmittingFolder(true);
      await axios.post('http://localhost:5000/api/collections', 
        { name: newFolderName.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`Folder "${newFolderName}" created successfully! 📂`);
      setNewFolderName('');
      
      // Refresh collections
      const colRes = await axios.get('http://localhost:5000/api/collections', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCollections(colRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create folder.');
    } finally {
      setSubmittingFolder(false);
    }
  };

  const handleDeleteFolder = async (id, folderName) => {
    if (!window.confirm(`Are you sure you want to delete the folder "${folderName}"?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/collections/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(`Folder "${folderName}" deleted.`);
      
      if (expandedFolderId === id) {
        setExpandedFolderId('favorites'); // reset back to general favorites
      }

      // Refresh collections
      const colRes = await axios.get('http://localhost:5000/api/collections', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCollections(colRes.data);

      // Sync merged favoritesList in localStorage
      const favIds = favorites.map(t => t._id || t);
      const colIds = colRes.data.flatMap(c => c.tools.map(t => t._id || t));
      const allSavedIds = Array.from(new Set([...favIds, ...colIds]));
      localStorage.setItem('favoritesList', JSON.stringify(allSavedIds));
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      toast.error('Failed to delete folder.');
    }
  };
 
  const handleTogglePublic = async (folderId) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/collections/${folderId}/toggle-public`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCollections(prev => prev.map(col => col._id === folderId ? { ...col, isPublic: data.isPublic } : col));
      toast.success(data.isPublic ? 'Folder is now public and shareable! 🤝' : 'Folder is now private.');
    } catch (error) {
      toast.error('Failed to update folder visibility.');
    }
  };

  const handleCopyShareLink = (folderId, folderName) => {
    const shareUrl = `${window.location.origin}/shared-folder/${folderId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success(`Share link for "${folderName}" copied to clipboard! 📂🔗`);
      })
      .catch(() => {
        toast.error('Failed to copy share link.');
      });
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tools/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Tool approved and set live! 🚀');
      setPendingTools(prev => prev.filter(tool => tool._id !== id));
      setIsInspectOpen(false);
      setInspectTool(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed.');
    }
  };

  const handleApproveFromDrawer = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    await handleApprove(id);
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this tool?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tools/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Tool submission rejected and deleted.');
      setPendingTools(prev => prev.filter(tool => tool._id !== id));
      setIsInspectOpen(false);
      setInspectTool(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed.');
    }
  };

  const handleRejectFromDrawer = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    await handleReject(id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 flex flex-col items-center justify-center">
          <div className="glass-card-premium rounded-[2.5rem] p-10 max-w-md border border-white/5 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4">Dashboard Blocked</h2>
            <p className="text-slate-400 mb-8">
              Please sign in or create an account to view your dashboard, manage submissions, or view favorites.
            </p>
            <div className="flex gap-4 w-full">
              <Link to="/login" className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20 text-center">
                Sign In
              </Link>
              <Link to="/signup" className="flex-1 py-3.5 bg-slate-900 border border-white/5 text-slate-300 rounded-xl font-bold hover:bg-slate-800 transition-all text-center">
                Sign Up
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <AnimatedMeshGradient />

      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {user.isAdmin ? 'Admin Moderation Center' : 'Developer & Explorer Console'}
              </h1>
            </div>
            <p className="text-slate-400">
              {user.isAdmin 
                ? 'Review, verify, and approve AI tool submissions from developers.' 
                : `Manage your submitted AI tools, check approvals, and access bookmarks.`}
            </p>
          </div>

          <Link to="/" className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Discover Tools</span>
          </Link>
        </div>

        {/* Dashboard Content */}
        {loading ? (
          <div className="space-y-8">
            {/* Shimmer tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-4">
              <div className="w-36 h-8 bg-slate-900/40 border border-white/5 rounded-lg shimmer" />
              <div className="w-36 h-8 bg-slate-900/40 border border-white/5 rounded-lg shimmer" />
              <div className="w-36 h-8 bg-slate-900/40 border border-white/5 rounded-lg shimmer" />
            </div>
            
            {/* Shimmer grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : user.isAdmin ? (
          // ================= ADMIN DASHBOARD =================
          <div>
            <div className="flex border-b border-white/5 mb-8">
              <button className="px-6 py-3 border-b-2 border-indigo-500 text-white font-bold text-sm flex items-center space-x-2">
                <Hourglass className="w-4 h-4 text-indigo-400" />
                <span>Pending Moderation ({pendingTools.length})</span>
              </button>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {pendingTools.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5"
                  >
                    <ShieldCheck className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-400">Moderation Queue Clear</h3>
                    <p className="text-slate-600 mt-2">All submitted AI tools have been processed. Great job!</p>
                  </motion.div>
                ) : (
                  pendingTools.map(tool => (
                    <motion.div
                      key={tool._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      className="glass-card-premium rounded-3xl p-5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-5 hover:border-indigo-500/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-2.5 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src={`/api/utils/proxy-logo?domain=${getHostname(tool.link)}&name=${encodeURIComponent(tool.name)}`}
                            alt={tool.name} 
                            className="max-w-full max-h-full object-contain filter drop-shadow-md" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-white truncate">{tool.name}</h3>
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-white/5">
                              {tool.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/10">
                              {tool.pricing}
                            </span>
                          </div>
                          <p className="text-indigo-300 font-bold text-xs mt-1 truncate">{tool.tagline}</p>
                          {tool.submittedBy && (
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">
                              By: <span className="text-slate-400 font-bold">{tool.submittedBy.name}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-white/5">
                        <button 
                          onClick={() => {
                            setInspectTool(tool);
                            setActiveInspectTab('overview');
                            setIsInspectOpen(true);
                          }}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Inspect Tool</span>
                        </button>
                        <button 
                          onClick={() => handleApprove(tool._id)}
                          className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/10 hover:border-transparent rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                          title="Instant Approve"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                        <button 
                          onClick={() => handleReject(tool._id)}
                          className="p-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/10 hover:border-transparent rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                          title="Instant Reject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Slide-out Inspection Drawer */}
            <AnimatePresence>
              {isInspectOpen && inspectTool && (
                <>
                  {/* Backdrop Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setIsInspectOpen(false);
                      setInspectTool(null);
                    }}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 pointer-events-auto"
                  />

                  {/* Drawer Panel */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                    className="fixed right-0 top-0 bottom-0 w-[550px] max-w-full bg-slate-950/98 border-l border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden pointer-events-auto"
                  >
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950/40">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 p-2 shadow-inner flex items-center justify-center overflow-hidden">
                          <img 
                            src={`/api/utils/proxy-logo?domain=${getHostname(inspectTool.link)}&name=${encodeURIComponent(inspectTool.name)}`}
                            alt={inspectTool.name} 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white">{inspectTool.name}</h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Inspect Submission</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsInspectOpen(false);
                          setInspectTool(null);
                        }}
                        className="p-2 bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Drawer Tab Headers */}
                    <div className="flex border-b border-white/5 px-6 bg-slate-950/50 overflow-x-auto no-scrollbar flex-shrink-0">
                      {[
                        { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
                        { id: 'specs', label: 'Model Specs', icon: <Cpu className="w-3.5 h-3.5" /> },
                        { id: 'features', label: 'Features', icon: <Sparkles className="w-3.5 h-3.5" /> },
                        { id: 'feedback', label: 'Pros & Cons', icon: <ThumbsUp className="w-3.5 h-3.5" /> },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveInspectTab(tab.id)}
                          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap -mb-[1px] ${
                            activeInspectTab === tab.id
                              ? 'border-indigo-500 text-white bg-indigo-500/5'
                              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Drawer Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                      {activeInspectTab === 'overview' && (
                        <div className="space-y-5">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Category & Pricing</span>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 border border-white/5 text-slate-300">
                                {inspectTool.category}
                              </span>
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                {inspectTool.pricing}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Tagline</span>
                            <p className="text-sm font-bold text-indigo-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-white/5">
                              {inspectTool.tagline}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Short Description</span>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5">
                              {inspectTool.descriptionShort}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Detailed Overview</span>
                            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-line">
                              {inspectTool.descriptionLong}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Submitted By</span>
                              <p className="text-xs font-bold text-white truncate">{inspectTool.submittedBy?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-500 truncate">{inspectTool.submittedBy?.email || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Launch Website</span>
                              <a
                                href={inspectTool.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline mt-1"
                              >
                                <span>{getHostname(inspectTool.link)}</span>
                                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeInspectTab === 'specs' && (
                        <div className="space-y-5">
                          {inspectTool.modelInfo ? (
                            <>
                              <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">AI Model Name</span>
                                  <p className="text-sm font-black text-white">{inspectTool.modelInfo.modelName || 'Standard Model'}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Model Type</span>
                                  <p className="text-sm font-black text-white">{inspectTool.modelInfo.modelType || 'Proprietary'}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Free Tier Available?</span>
                                  <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mt-1 ${
                                    inspectTool.modelInfo.freeAvailable 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}>
                                    {inspectTool.modelInfo.freeAvailable ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Paid Tier Available?</span>
                                  <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mt-1 ${
                                    inspectTool.modelInfo.paidAvailable 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-slate-800 text-slate-500 border border-white/5'
                                  }`}>
                                    {inspectTool.modelInfo.paidAvailable ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Free Credits</span>
                                  <p className="text-xs font-bold text-indigo-300 mt-1">{inspectTool.modelInfo.credits || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">API Access Available?</span>
                                  <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mt-1 ${
                                    inspectTool.modelInfo.apiAccess 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}>
                                    {inspectTool.modelInfo.apiAccess ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-10 bg-slate-900/10 rounded-2xl border border-white/5">
                              <p className="text-slate-500 text-xs">No technical specifications provided for this tool.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeInspectTab === 'features' && (
                        <div className="space-y-5">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-3">Key Features & Capabilities</span>
                            {inspectTool.features && inspectTool.features.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {inspectTool.features.map((feature, i) => (
                                  <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-indigo-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-xs bg-slate-900/40 p-4 rounded-xl border border-white/5">No key features listed.</p>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-3">Ideal Use Cases</span>
                            {inspectTool.useCases && inspectTool.useCases.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {inspectTool.useCases.map((useCase, i) => (
                                  <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-emerald-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {useCase}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-xs bg-slate-900/40 p-4 rounded-xl border border-white/5">No specific use cases listed.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {activeInspectTab === 'feedback' && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-3 flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                                <span>Advantages (Pros)</span>
                              </span>
                              {inspectTool.pros && inspectTool.pros.length > 0 ? (
                                <ul className="space-y-2">
                                  {inspectTool.pros.map((pro, i) => (
                                    <li key={i} className="text-xs font-medium px-4 py-2.5 rounded-xl bg-emerald-950/15 border border-emerald-500/10 text-emerald-300 flex items-start gap-2.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-500 text-xs bg-slate-900/40 p-4 rounded-xl border border-white/5">No advantages specified.</p>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-3 flex items-center gap-2">
                                <ThumbsDown className="w-4 h-4 text-rose-400" />
                                <span>Limitations (Cons)</span>
                              </span>
                              {inspectTool.cons && inspectTool.cons.length > 0 ? (
                                <ul className="space-y-2">
                                  {inspectTool.cons.map((con, i) => (
                                    <li key={i} className="text-xs font-medium px-4 py-2.5 rounded-xl bg-rose-950/15 border border-rose-500/10 text-rose-300 flex items-start gap-2.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-500 text-xs bg-slate-900/40 p-4 rounded-xl border border-white/5">No limitations specified.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="p-6 border-t border-white/5 flex gap-4 bg-slate-950 flex-shrink-0">
                      <button
                        onClick={(e) => handleApproveFromDrawer(e, inspectTool._id)}
                        className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve & Set Live</span>
                      </button>
                      <button
                        onClick={(e) => handleRejectFromDrawer(e, inspectTool._id)}
                        className="px-6 py-3.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-bold border border-red-500/10 hover:border-transparent flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Reject Submission</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // ================= USER DASHBOARD =================
          <div>
            {/* Tab switchers */}
            <div className="flex border-b border-white/5 mb-8 overflow-x-auto gap-4 scrollbar-none">
              <button 
                onClick={() => setActiveTab('submissions')}
                className={`pb-4 px-2 font-bold text-sm flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'submissions' 
                    ? 'border-indigo-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>My Submissions ({mySubmissions.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`pb-4 px-2 font-bold text-sm flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'favorites' 
                    ? 'border-indigo-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Folder className="w-4 h-4 text-indigo-400" />
                <span>Collections & Folders ({1 + collections.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`pb-4 px-2 font-bold text-sm flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'history' 
                    ? 'border-indigo-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Recently Viewed ({history.length})</span>
              </button>
            </div>

            {/* Submissions Section */}
            {activeTab === 'submissions' && (
              <div className="space-y-6">
                {mySubmissions.length === 0 ? (
                  <div className="text-center py-24 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5">
                    <Rocket className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-400">No submissions found</h3>
                    <p className="text-slate-600 mt-2">Submit your own AI tool to showcase it to the community!</p>
                    <Link to="/submit-tool" className="inline-flex items-center space-x-2 text-indigo-400 font-bold hover:text-indigo-300 mt-6 transition-colors">
                      <span>Submit a tool now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  mySubmissions.map(tool => (
                    <div 
                      key={tool._id}
                      className="glass-card-premium rounded-[2rem] p-6 md:p-8 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-3 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src={`/api/utils/proxy-logo?domain=${getHostname(tool.link)}&name=${encodeURIComponent(tool.name)}`}
                            alt={tool.name} 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black text-white">{tool.name}</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-white/5">
                              {tool.category}
                            </span>
                          </div>
                          <p className="text-indigo-300 font-bold text-sm mt-1">{tool.tagline}</p>
                          <p className="text-xs text-slate-500 mt-2 font-medium">
                            Submitted on {new Date(tool.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="shrink-0">
                        {tool.isApproved ? (
                          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>Approved & Live</span>
                          </div>
                        ) : (
                          <div className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                            <Hourglass className="w-4 h-4" />
                            <span>Pending Moderation</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Favorites & Collections Section */}
            {activeTab === 'favorites' && (
              <div className="space-y-10 w-full">
                {/* Create Folder Form Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-6 rounded-3xl border border-white/5">
                  <div>
                    <h3 className="text-xl font-black text-white">My Collections</h3>
                    <p className="text-xs text-slate-500 mt-1">Organize your saved AI tools in custom project folders.</p>
                  </div>
                  <form onSubmit={handleCreateFolder} className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Folder name (e.g. Design)..."
                      className="bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-700 outline-none focus:border-indigo-500 transition-all w-full sm:w-56"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      disabled={submittingFolder}
                    />
                    <button
                      type="submit"
                      disabled={submittingFolder || !newFolderName.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>New Folder</span>
                    </button>
                  </form>
                </div>

                {/* Folders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* General Favorites Folder Card */}
                  <div 
                    onClick={() => setExpandedFolderId('favorites')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 group relative overflow-hidden ${
                      expandedFolderId === 'favorites'
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/5'
                        : 'bg-slate-900/20 border-white/5 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl ${
                        expandedFolderId === 'favorites' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-950/40 text-slate-500'
                      }`}>
                        <Heart className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-lg font-black text-white">{favorites.length}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm group-hover:text-indigo-400 transition-colors">General Favorites</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Default bookmark folder</p>
                    </div>
                  </div>

                  {/* Custom Folders Cards */}
                  {collections.map(col => (
                    <div 
                      key={col._id}
                      onClick={() => setExpandedFolderId(col._id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 group relative overflow-hidden ${
                        expandedFolderId === col._id
                          ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/5'
                          : 'bg-slate-900/20 border-white/5 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-2.5 rounded-xl ${
                          expandedFolderId === col._id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-950/40 text-slate-500'
                        }`}>
                          <Folder className="w-5 h-5" />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-black text-white">{col.tools.length}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(col._id, col.name);
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Folder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm group-hover:text-indigo-400 transition-colors truncate pr-4">{col.name}</h4>
                        <div className="flex items-center justify-between mt-1.5 relative z-20">
                          <p className="text-[10px] text-slate-500">Custom folder</p>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                            col.isPublic 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                              : 'bg-slate-800/80 text-slate-500 border border-white/5'
                          }`}>
                            {col.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expanded Folder Header & Grid */}
                <div className="pt-6 border-t border-white/5 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                      <h3 className="text-xl font-black text-white">
                        {expandedFolderId === 'favorites' 
                          ? 'General Favorites' 
                          : collections.find(c => c._id === expandedFolderId)?.name || 'Folder Tools'}
                      </h3>
                    </div>
                    
                    {expandedFolderId !== 'favorites' && (() => {
                      const activeFolder = collections.find(c => c._id === expandedFolderId);
                      if (!activeFolder) return null;
                      return (
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <button
                            onClick={() => handleTogglePublic(activeFolder._id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeFolder.isPublic
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                            }`}
                            title="Toggle Visibility"
                          >
                            {activeFolder.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            <span>{activeFolder.isPublic ? 'Public' : 'Private'}</span>
                          </button>
                          
                          {activeFolder.isPublic && (
                            <button
                              onClick={() => handleCopyShareLink(activeFolder._id, activeFolder.name)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-500/10"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share Folder</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {expandedFolderId === 'favorites' ? (
                      favorites.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-slate-900/10 rounded-[2.5rem] border border-dashed border-white/5">
                          <Bookmark className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                          <h4 className="font-bold text-slate-400">Folder is empty</h4>
                          <p className="text-xs text-slate-600 mt-1">Add tools to General Favorites using the heart icon.</p>
                        </div>
                      ) : (
                        favorites.map(tool => (
                          <ToolCard key={tool._id} tool={tool} />
                        ))
                      )
                    ) : (
                      (() => {
                        const activeFolder = collections.find(c => c._id === expandedFolderId);
                        if (!activeFolder || activeFolder.tools.length === 0) {
                          return (
                            <div className="col-span-full text-center py-20 bg-slate-900/10 rounded-[2.5rem] border border-dashed border-white/5">
                              <Folder className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                              <h4 className="font-bold text-slate-400">Folder is empty</h4>
                              <p className="text-xs text-slate-600 mt-1">Save tools to this folder using the heart icon on cards or detail pages.</p>
                            </div>
                          );
                        }
                        return activeFolder.tools.map(tool => (
                          <ToolCard key={tool._id} tool={tool} />
                        ));
                      })()
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* History Section */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {history.length === 0 ? (
                  <div className="text-center py-24 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5">
                    <History className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-400">Viewing history empty</h3>
                    <p className="text-slate-600 mt-2">Tools you click on and view will automatically save in your history.</p>
                  </div>
                ) : (
                  history.map(item => {
                    const tool = item.tool;
                    if (!tool) return null;
                    return (
                      <div 
                        key={item._id}
                        className="glass-card-premium rounded-[2rem] p-6 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 p-2 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                            <img 
                              src={`/api/utils/proxy-logo?domain=${getHostname(tool.link)}&name=${encodeURIComponent(tool.name)}`}
                              alt={tool.name} 
                              className="max-w-full max-h-full object-contain" 
                            />
                          </div>
                          <div>
                            <h4 className="font-black text-white text-lg">{tool.name}</h4>
                            <p className="text-indigo-300 font-bold text-xs">{tool.tagline}</p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-4 text-xs w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                          <span className="text-slate-500 font-medium">
                            Visited {new Date(item.visitedAt).toLocaleDateString()}
                          </span>
                          <Link to={`/tool/${tool._id}`} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 rounded-xl font-bold transition-all">
                            View Tool
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
