import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ExternalLink, Star, CheckCircle2, AlertCircle, 
  Cpu, CreditCard, Users, Zap, ThumbsUp, ThumbsDown, MessageSquare 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ToolModal = ({ tool, isOpen, onClose }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && tool) {
      // Record history
      if (user) {
        axios.post('http://localhost:5000/api/users/history', { toolId: tool._id }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      
      // Fetch reviews
      axios.get(`http://localhost:5000/api/reviews/${tool._id}`)
        .then(res => setReviews(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen, tool, user]);

  if (!tool) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 p-2 border border-white/5 flex items-center justify-center">
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/utils/proxy-logo?domain=${new URL(tool.link).hostname}&name=${encodeURIComponent(tool.name)}`}
                    alt={tool.name} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{tool.name}</h2>
                  <p className="text-indigo-400 font-medium">{tool.tagline}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <a 
                  href={tool.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Visit Tool</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex px-6 border-b border-white/5">
              {['overview', 'features', 'model-info', 'pricing', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold capitalize transition-all border-b-2 ${
                    activeTab === tab 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <section>
                    <h3 className="text-lg font-bold text-white mb-4">Description</h3>
                    <p className="text-slate-300 leading-relaxed max-w-3xl">
                      {tool.descriptionLong}
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                      <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Monthly Users</span>
                      </div>
                      <p className="text-xl font-bold text-white">{tool.monthlyUsers}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                      <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                        <Star className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Rating</span>
                      </div>
                      <p className="text-xl font-bold text-white">{tool.rating.toFixed(1)} / 5.0</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                      <div className="flex items-center space-x-2 text-purple-400 mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Popularity</span>
                      </div>
                      <p className="text-xl font-bold text-white">{tool.popularity}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <h4 className="flex items-center space-x-2 text-emerald-400 font-bold mb-4">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Pros</span>
                      </h4>
                      <ul className="space-y-2">
                        {tool.pros.map(pro => (
                          <li key={pro} className="flex items-start space-x-2 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                      <h4 className="flex items-center space-x-2 text-red-400 font-bold mb-4">
                        <ThumbsDown className="w-4 h-4" />
                        <span>Cons</span>
                      </h4>
                      <ul className="space-y-2">
                        {tool.cons.map(con => (
                          <li key={con} className="flex items-start space-x-2 text-sm text-slate-300">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.features.map(feature => (
                    <div key={feature} className="flex items-center space-x-3 p-4 rounded-xl bg-slate-950/50 border border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      <span className="text-slate-200 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'model-info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white">Advanced Model Details</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-400">Model Name</span>
                        <span className="text-white font-bold">{tool.modelInfo.modelName}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-400">Model Type</span>
                        <span className="text-white font-bold">{tool.modelInfo.modelType}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-400">API Availability</span>
                        <span className={`font-bold ${tool.modelInfo.apiAccess ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tool.modelInfo.apiAccess ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white">Credits & Access</h3>
                    <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-600/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                        <span className="font-bold text-white">Credits System</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {tool.modelInfo.credits}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/50 flex flex-col">
                    <h4 className="text-lg font-bold text-white mb-2">Free</h4>
                    <p className="text-slate-400 text-sm mb-6">{tool.plans.free || 'No free plan available'}</p>
                    <div className="mt-auto">
                      <span className="text-2xl font-bold text-white">$0</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border-2 border-indigo-500 bg-indigo-500/5 flex flex-col relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                    <h4 className="text-lg font-bold text-white mb-2">Pro</h4>
                    <p className="text-slate-400 text-sm mb-6">{tool.plans.pro || 'Contact for pricing'}</p>
                    <div className="mt-auto">
                      <span className="text-2xl font-bold text-white">Paid</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/50 flex flex-col">
                    <h4 className="text-lg font-bold text-white mb-2">Enterprise</h4>
                    <p className="text-slate-400 text-sm mb-6">{tool.plans.enterprise || 'Custom solutions for teams'}</p>
                    <div className="mt-auto">
                      <span className="text-2xl font-bold text-white">Custom</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">User Reviews ({reviews.length})</h3>
                    <button className="btn-primary text-xs py-2">Write a Review</button>
                  </div>
                  
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-slate-950/30 rounded-2xl border border-white/5">
                      <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review._id} className="p-6 rounded-2xl bg-slate-950/50 border border-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                                {review.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-bold">{review.userName}</p>
                                <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ToolModal;
