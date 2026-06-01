import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, X, Check, Minus, Info, Star, ExternalLink, Zap, Users, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Compare = () => {
  const [selectedTools, setSelectedTools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      axios.get(`/api/tools?search=${searchQuery}`)
        .then(res => setSearchResults(res.data.filter(t => !selectedTools.find(st => st._id === t._id))))
        .catch(err => console.error(err));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedTools]);

  const addTool = (tool) => {
    if (selectedTools.length < 2) {
      setSelectedTools([...selectedTools, tool]);
      setSearchQuery('');
    }
  };

  const removeTool = (id) => {
    setSelectedTools(selectedTools.filter(t => t._id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-white mb-4 tracking-tighter"
          >
            Compare <span className="text-indigo-500">AI Tools</span>
          </motion.h1>
          <p className="text-slate-400 text-lg">Choose any two tools to analyze their features, pricing, and performance side-by-side.</p>
        </div>

        {/* Selection Area */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          <div className="lg:w-1/2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Select Tools to Compare</h2>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search AI tools (e.g. ChatGPT, Midjourney)..."
                className="w-full h-16 bg-slate-900/50 border border-white/5 rounded-[1.25rem] px-6 text-lg text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={selectedTools.length >= 2}
              />
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      {searchResults.slice(0, 5).map(tool => (
                        <button
                          key={tool._id}
                          onClick={() => addTool(tool)}
                          className="w-full flex items-center p-3 hover:bg-white/5 rounded-xl transition-all text-left group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-800 p-2 mr-4 border border-white/5 flex items-center justify-center overflow-hidden">
                            <img 
                              src={`/api/utils/proxy-logo?domain=${new URL(tool.link).hostname}&name=${encodeURIComponent(tool.name)}`}
                              alt={tool.name} 
                              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" 
                            />
                          </div>
                          <div>
                            <p className="text-white font-bold">{tool.name}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{tool.category}</p>
                          </div>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check className="w-5 h-5 text-indigo-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selected Tools Preview */}
          <div className="lg:w-1/2 flex flex-col sm:flex-row gap-4">
            {[0, 1].map(index => (
              <div key={index} className="flex-1 glass-card-premium rounded-[2rem] p-6 flex flex-col items-center justify-center border-dashed border-2 border-white/5 min-h-[160px] group relative overflow-hidden">
                {selectedTools[index] ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full text-center relative z-10"
                  >
                    <button 
                      onClick={() => removeTool(selectedTools[index]._id)}
                      className="absolute -top-1 -right-1 p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mx-auto mb-4 p-4 border border-white/10 shadow-2xl flex items-center justify-center">
                      <img 
                        src={`/api/utils/proxy-logo?domain=${new URL(selectedTools[index].link).hostname}&name=${encodeURIComponent(selectedTools[index].name)}`}
                        alt={selectedTools[index].name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <h3 className="text-white text-xl font-black">{selectedTools[index].name}</h3>
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{selectedTools[index].category}</span>
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950/50 flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
                      <span className="text-3xl font-black text-slate-800">{index + 1}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Wait For Tool</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <AnimatePresence mode="wait">
          {selectedTools.length === 2 ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="glass-card-premium rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="overflow-x-auto no-scrollbar touch-pan-x">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-white/5">
                      <th className="p-8 text-xs font-black text-slate-500 uppercase tracking-widest w-1/4">Feature Analysis</th>
                      <th className="p-8 text-2xl md:text-3xl font-black text-white text-center w-3/8">
                        <div className="flex flex-col items-center">
                          <span className="text-indigo-400 text-sm mb-2">Option A</span>
                          {selectedTools[0].name}
                        </div>
                      </th>
                      <th className="p-8 text-2xl md:text-3xl font-black text-white text-center w-3/8">
                        <div className="flex flex-col items-center">
                          <span className="text-indigo-400 text-sm mb-2">Option B</span>
                          {selectedTools[1].name}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <ComparisonRow 
                      label="Pricing Model" 
                      val1={<PricingBadge pricing={selectedTools[0].pricing} />} 
                      val2={<PricingBadge pricing={selectedTools[1].pricing} />} 
                    />
                    <ComparisonRow 
                      label="Performance Rating" 
                      val1={<RatingDisplay rating={selectedTools[0].rating} />} 
                      val2={<RatingDisplay rating={selectedTools[1].rating} />} 
                    />
                    <ComparisonRow 
                      label="Monthly Traffic" 
                      val1={<StatBadge icon={<Users className="w-4 h-4" />} val={selectedTools[0].monthlyUsers || '10k+'} />} 
                      val2={<StatBadge icon={<Users className="w-4 h-4" />} val={selectedTools[1].monthlyUsers || '10k+'} />} 
                    />
                    <ComparisonRow 
                      label="Total Engagement" 
                      val1={<StatBadge icon={<MousePointer2 className="w-4 h-4" />} val={`${selectedTools[0].clicks || 0} Clicks`} />} 
                      val2={<StatBadge icon={<MousePointer2 className="w-4 h-4" />} val={`${selectedTools[1].clicks || 0} Clicks`} />} 
                    />
                    <ComparisonRow 
                      label="Primary Model" 
                      val1={<ModelInfo info={selectedTools[0].modelInfo} />} 
                      val2={<ModelInfo info={selectedTools[1].modelInfo} />} 
                    />
                    <ComparisonRow 
                      label="Free Credits" 
                      val1={<p className="font-bold text-indigo-400">{selectedTools[0].modelInfo?.credits || 'Varies'}</p>} 
                      val2={<p className="font-bold text-indigo-400">{selectedTools[1].modelInfo?.credits || 'Varies'}</p>} 
                    />
                    <ComparisonRow 
                      label="Key Capabilities" 
                      val1={<FeaturesList features={selectedTools[0].features} />} 
                      val2={<FeaturesList features={selectedTools[1].features} />} 
                    />
                    <ComparisonRow 
                      label="API Availability" 
                      val1={selectedTools[0].modelInfo.apiAccess ? <CheckIcon /> : <MinusIcon />} 
                      val2={selectedTools[1].modelInfo.apiAccess ? <CheckIcon /> : <MinusIcon />} 
                    />
                    {/* Final Action Row */}
                    <tr className="bg-slate-900/30">
                      <td className="p-8" />
                      <td className="p-8 text-center">
                        <a 
                          href={selectedTools[0].link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                        >
                          <span>Visit {selectedTools[0].name}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="p-8 text-center">
                        <a 
                          href={selectedTools[1].link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/5"
                        >
                          <span>Visit {selectedTools[1].name}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 glass-card-premium rounded-[3rem] border border-dashed border-white/10"
            >
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
                <Zap className="w-10 h-10 text-indigo-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Select Two Tools to Compare</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
                Choose your favorite AI platforms above to see a detailed side-by-side analysis of their strengths and weaknesses.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

// Helper Components
const ComparisonRow = ({ label, val1, val2 }) => (
  <tr className="hover:bg-white/5 transition-colors group">
    <td className="p-8 font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{label}</td>
    <td className="p-8 text-center">{val1}</td>
    <td className="p-8 text-center">{val2}</td>
  </tr>
);

const PricingBadge = ({ pricing }) => {
  const colors = {
    'Free': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Freemium': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Paid': 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full border text-xs font-black tracking-widest ${colors[pricing] || 'bg-slate-500/10 text-slate-400'}`}>
      {pricing?.toUpperCase()}
    </span>
  );
};

const RatingDisplay = ({ rating }) => (
  <div className="flex items-center justify-center space-x-2">
    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
    <span className="text-2xl font-black text-white">{rating.toFixed(1)}</span>
  </div>
);

const StatBadge = ({ icon, val }) => (
  <div className="inline-flex items-center space-x-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
    <div className="text-indigo-400">{icon}</div>
    <span className="text-sm font-bold text-slate-300">{val}</span>
  </div>
);

const ModelInfo = ({ info }) => (
  <div className="flex flex-col items-center">
    <p className="font-black text-white text-lg tracking-tight">{info?.modelName || 'Custom AI'}</p>
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{info?.modelType || 'Proprietary'}</p>
  </div>
);

const FeaturesList = ({ features }) => (
  <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
    {(features || ['AI Powered']).slice(0, 3).map((f, i) => (
      <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-950 text-slate-400 border border-white/5">
        {f}
      </span>
    ))}
  </div>
);

const CheckIcon = () => <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20"><Check className="w-5 h-5 text-emerald-500" /></div>;
const MinusIcon = () => <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto border border-white/5"><Minus className="w-5 h-5 text-slate-600" /></div>;

export default Compare;
