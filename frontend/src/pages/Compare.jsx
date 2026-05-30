import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, X, Check, Minus, Star, ExternalLink, Zap, Users, MousePointer2, 
  Cpu, ShieldCheck, AlertCircle, ThumbsUp, ThumbsDown, Trophy, ArrowRight,
  TrendingUp, Award, BarChart3, HelpCircle, Flame, DollarSign, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Safe URL Hostname Parser Helper
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

const Compare = () => {
  const [selectedTools, setSelectedTools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('compareTools');
      if (stored) {
        setSelectedTools(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading compare tools:', err);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      axios.get(`http://localhost:5000/api/tools?search=${searchQuery}`)
        .then(res => setSearchResults(res.data.filter(t => !selectedTools.find(st => st._id === t._id))))
        .catch(err => console.error(err));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedTools]);

  const saveCompareList = (list) => {
    setSelectedTools(list);
    try {
      localStorage.setItem('compareTools', JSON.stringify(list));
      window.dispatchEvent(new Event('compareUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const addTool = (tool) => {
    if (selectedTools.length < 2) {
      const updated = [...selectedTools, tool];
      saveCompareList(updated);
      setSearchQuery('');
    }
  };

  const removeTool = (id) => {
    const updated = selectedTools.filter(t => t._id !== id);
    saveCompareList(updated);
  };

  const getWinnerIndex = () => {
    if (selectedTools.length !== 2) return -1;
    const r1 = selectedTools[0].rating || 0;
    const r2 = selectedTools[1].rating || 0;
    if (r1 === r2) return -1;
    return r1 > r2 ? 0 : 1;
  };
  const winnerIndex = getWinnerIndex();

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      {/* Decorative backdrops */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4"
          >
            <Zap className="w-3.5 h-3.5 fill-indigo-400" />
            <span>Head-To-Head Analysis</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter"
          >
            Compare <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">AI Tools</span>
          </motion.h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Choose any two tools to analyze their features, pricing plans, model parameters, and community sentiments side-by-side.
          </p>
        </div>

        {/* Selection Area */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16 items-stretch">
          <div className="lg:w-1/2 flex flex-col justify-between glass-card-premium rounded-3xl p-5 md:p-8 border border-white/5 relative z-30">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Search className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Select Platforms</h2>
              </div>
              <p className="text-xs text-slate-500">Search from our premium repository of 156+ verified AI platforms.</p>
              
              <div className="relative pt-2">
                <input
                  type="text"
                  placeholder="Search AI tools (e.g. ChatGPT, Midjourney)..."
                  className="w-full h-14 bg-slate-950/50 border border-white/5 rounded-xl px-5 text-base text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={selectedTools.length >= 2}
                />
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-slate-950/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                    >
                      <div className="p-2 divide-y divide-white/5">
                        {searchResults.slice(0, 5).map(tool => (
                          <button
                            key={tool._id}
                            onClick={() => addTool(tool)}
                            className="w-full flex items-center p-3 hover:bg-white/5 rounded-xl transition-all text-left group border-0 bg-transparent"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-900 p-2 mr-3 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                              <img 
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/utils/proxy-logo?domain=${getHostname(tool.link)}&name=${encodeURIComponent(tool.name)}`}
                                alt={tool.name} 
                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" 
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-bold text-sm truncate">{tool.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tool.category}</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Check className="w-4 h-4 text-indigo-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {selectedTools.length >= 2 && (
              <p className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase mt-4 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Maximum limit reached. Remove a tool to compare another.</span>
              </p>
            )}
          </div>

          {/* Selected Tools Preview */}
          <div className="lg:w-1/2 flex flex-col sm:flex-row gap-4 items-stretch">
            {[0, 1].map(index => (
              <div key={index} className="flex-1 glass-card-premium rounded-3xl p-5 md:p-6 flex flex-col items-center justify-center border-dashed border-2 border-white/5 min-h-[200px] group relative overflow-hidden transition-all duration-300 hover:border-indigo-500/20">
                {selectedTools[index] ? (
                  <motion.div 
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full text-center relative z-10 flex flex-col items-center justify-center"
                  >
                    <button 
                      onClick={() => removeTool(selectedTools[index]._id)}
                      className="absolute -top-1 -right-1 p-2 bg-slate-900/80 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-white/5 hover:border-transparent active:scale-90"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-3.5 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden mb-4 shrink-0">
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/utils/proxy-logo?domain=${getHostname(selectedTools[index].link)}&name=${encodeURIComponent(selectedTools[index].name)}`}
                        alt={selectedTools[index].name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <h3 className="text-white text-lg font-black">{selectedTools[index].name}</h3>
                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mt-1 block">
                      {selectedTools[index].category}
                    </span>
                  </motion.div>
                ) : (
                  <div className="text-center relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950/60 flex items-center justify-center mx-auto mb-3 border border-white/5 shadow-inner">
                      <span className="text-xl font-black text-slate-800">{index + 1}</span>
                    </div>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Awaiting Platform</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Graphical Comparison Matrix */}
        <AnimatePresence mode="wait">
          {selectedTools.length === 2 ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="space-y-8"
            >
              {/* Graphical Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Column 0: Parameter labels block (hidden on mobile header) */}
                <div className="glass-card-premium rounded-[2rem] p-6 border border-white/5 flex flex-col justify-center bg-slate-900/10 shrink-0">
                  <Award className="w-10 h-10 text-yellow-500/80 mb-4 fill-yellow-500/5" />
                  <h3 className="text-xl font-black text-white tracking-tight">Compare Matrix</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Analyzing model architectures, capabilities, pros, and pricing levels side-by-side.
                  </p>
                </div>

                {/* Column 1: Tool A Card */}
                <div className="relative glass-card-premium rounded-3xl p-5 md:p-8 border border-white/10 text-center bg-gradient-to-b from-indigo-950/20 to-slate-950/40 hover:border-indigo-500/20 transition-all duration-300 flex flex-col justify-between">
                  {winnerIndex === 0 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center gap-1.5 animate-pulse">
                      <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Rating Winner</span>
                    </span>
                  )}
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 p-3 mx-auto border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden mb-4">
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/utils/proxy-logo?domain=${getHostname(selectedTools[0].link)}&name=${encodeURIComponent(selectedTools[0].name)}`}
                        alt={selectedTools[0].name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase text-indigo-500 tracking-wider">Option A</span>
                    <h3 className="text-2xl font-black text-white mt-1">{selectedTools[0].name}</h3>
                    <p className="text-xs text-slate-400 mt-2 italic px-4 leading-relaxed">"{selectedTools[0].tagline}"</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Rating</p>
                      <p className="text-lg font-black text-white mt-0.5">{selectedTools[0].rating?.toFixed(1)} ★</p>
                    </div>
                    <div className="h-6 w-px bg-white/5" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Tier</p>
                      <p className="text-sm font-black text-indigo-300 mt-1 uppercase tracking-wider">{selectedTools[0].pricing}</p>
                    </div>
                  </div>
                </div>

                {/* Column 2: Tool B Card */}
                <div className="relative glass-card-premium rounded-3xl p-5 md:p-8 border border-white/10 text-center bg-gradient-to-b from-purple-950/20 to-slate-950/40 hover:border-purple-500/20 transition-all duration-300 flex flex-col justify-between">
                  {winnerIndex === 1 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center gap-1.5 animate-pulse">
                      <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Rating Winner</span>
                    </span>
                  )}
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 p-3 mx-auto border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden mb-4">
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/utils/proxy-logo?domain=${getHostname(selectedTools[1].link)}&name=${encodeURIComponent(selectedTools[1].name)}`}
                        alt={selectedTools[1].name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase text-violet-500 tracking-wider">Option B</span>
                    <h3 className="text-2xl font-black text-white mt-1">{selectedTools[1].name}</h3>
                    <p className="text-xs text-slate-400 mt-2 italic px-4 leading-relaxed">"{selectedTools[1].tagline}"</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Rating</p>
                      <p className="text-lg font-black text-white mt-0.5">{selectedTools[1].rating?.toFixed(1)} ★</p>
                    </div>
                    <div className="h-6 w-px bg-white/5" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Tier</p>
                      <p className="text-sm font-black text-violet-300 mt-1 uppercase tracking-wider">{selectedTools[1].pricing}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Core Performance & Sentiment */}
              <ComparisonSectionCard title="Core Performance & Sentiment" icon={<Flame className="w-5 h-5 text-orange-400" />}>
                <GridRow label="Performance Score">
                  <RatingDisplay rating={selectedTools[0].rating} />
                  <RatingDisplay rating={selectedTools[1].rating} />
                </GridRow>

                <GridRow label="Pricing Structure">
                  <div className="flex flex-col items-center space-y-2">
                    <PricingBadge pricing={selectedTools[0].pricing} />
                    <p className="text-[10px] text-slate-500 font-medium">Plan: {selectedTools[0].plans?.free || 'Included'}</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <PricingBadge pricing={selectedTools[1].pricing} />
                    <p className="text-[10px] text-slate-500 font-medium">Plan: {selectedTools[1].plans?.free || 'Included'}</p>
                  </div>
                </GridRow>

                <GridRow label="Community Popularity">
                  <ComparisonBar 
                    val1={selectedTools[0].popularity || 'Medium'} 
                    val2={selectedTools[1].popularity || 'Medium'} 
                    label="Volume Tier" 
                  />
                </GridRow>

                <GridRow label="Engagement Index">
                  <ComparisonBar 
                    val1={`${selectedTools[0].clicks || 0}`} 
                    val2={`${selectedTools[1].clicks || 0}`} 
                    label="User Clicks" 
                  />
                </GridRow>

                <GridRow label="Pros & Cons (Head-to-Head)">
                  <ProsConsList pros={selectedTools[0].pros} cons={selectedTools[0].cons} />
                  <ProsConsList pros={selectedTools[1].pros} cons={selectedTools[1].cons} />
                </GridRow>
              </ComparisonSectionCard>

              {/* Section 2: AI Tech Specs */}
              <ComparisonSectionCard title="AI Foundations & Model Specifications" icon={<Cpu className="w-5 h-5 text-indigo-400" />}>
                <GridRow label="Core AI Engine">
                  <ModelInfo info={selectedTools[0].modelInfo} />
                  <ModelInfo info={selectedTools[1].modelInfo} />
                </GridRow>

                <GridRow label="Free Credits Budget">
                  <p className="font-extrabold text-indigo-300 text-sm bg-indigo-500/5 border border-indigo-500/10 px-4 py-1.5 rounded-xl inline-block">
                    {selectedTools[0].modelInfo?.credits || 'Unlimited'}
                  </p>
                  <p className="font-extrabold text-indigo-300 text-sm bg-indigo-500/5 border border-indigo-500/10 px-4 py-1.5 rounded-xl inline-block">
                    {selectedTools[1].modelInfo?.credits || 'Unlimited'}
                  </p>
                </GridRow>

                <GridRow label="Developer API Suite">
                  <ApiAccessIcon apiAccess={selectedTools[0].modelInfo?.apiAccess} />
                  <ApiAccessIcon apiAccess={selectedTools[1].modelInfo?.apiAccess} />
                </GridRow>
              </ComparisonSectionCard>

              {/* Section 3: Symmetrical Capabilities */}
              <ComparisonSectionCard title="Capabilities & Operational Stacking" icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}>
                <GridRow label="Core Capabilities">
                  <FeaturesList features={selectedTools[0].features} />
                  <FeaturesList features={selectedTools[1].features} />
                </GridRow>

                <GridRow label="Symmetrical Use Cases">
                  <UseCasesList useCases={selectedTools[0].useCases} />
                  <UseCasesList useCases={selectedTools[1].useCases} />
                </GridRow>
              </ComparisonSectionCard>

              {/* Footer Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-900/40 p-8 rounded-[2rem] border border-white/5">
                <div className="text-left md:pr-4">
                  <p className="text-sm font-black text-white flex items-center gap-1">
                    <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />
                    <span>Decision Checklist Ready</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Compare features, pros and pricing structure, then click below to launch the platforms.
                  </p>
                </div>
                
                <div className="text-center">
                  <a 
                    href={selectedTools[0].link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                  >
                    <span>Launch {selectedTools[0].name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="text-center">
                  <a 
                    href={selectedTools[1].link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white py-4 rounded-xl font-bold transition-all border border-white/5 active:scale-95 cursor-pointer"
                  >
                    <span>Launch {selectedTools[1].name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 glass-card-premium rounded-[3rem] border border-dashed border-white/10 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-slate-900/80 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl relative z-10">
                <Zap className="w-8 h-8 text-indigo-500 animate-pulse fill-indigo-500/10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 relative z-10">Compare Side-by-Side</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed relative z-10">
                Select exactly two platforms from the dropdown menu to trigger an automated feature matrix comparison.
              </p>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

// ================= HELPER MATRIX COMPONENTS =================

const ComparisonSectionCard = ({ title, icon, children }) => (
  <div className="glass-card-premium rounded-[2.5rem] p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden bg-slate-900/10">
    <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/5">
      <div className="p-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
        {icon}
      </div>
      <h4 className="text-base md:text-lg font-black text-white tracking-tight shrink-0">{title}</h4>
    </div>
    <div className="divide-y divide-white/5">
      {children}
    </div>
  </div>
);

const GridRow = ({ label, children }) => {
  const [val1, val2] = React.Children.toArray(children);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 py-6 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors -mx-6 px-6">
      {/* Parameter Label */}
      <div className="flex items-center justify-center md:justify-start text-xs font-black text-slate-500 uppercase tracking-widest md:normal-case md:text-sm md:font-bold md:text-slate-400 mb-2 md:mb-0">
        {label}
      </div>
      
      {/* Option A value container */}
      <div className="flex items-center justify-center text-center relative pt-4 md:pt-0 border-t border-dashed border-white/5 md:border-t-0">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-indigo-500 tracking-wider md:hidden">
          Option A
        </span>
        <div className="w-full md:w-auto">
          {val1}
        </div>
      </div>
      
      {/* Option B value container */}
      <div className="flex items-center justify-center text-center relative pt-4 md:pt-0 border-t border-dashed border-white/5 md:border-t-0">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-violet-500 tracking-wider md:hidden">
          Option B
        </span>
        <div className="w-full md:w-auto">
          {val2}
        </div>
      </div>
    </div>
  );
};

const PricingBadge = ({ pricing }) => {
  const colors = {
    'Free': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.08)]',
    'Freemium': 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]',
    'Paid': 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.08)]'
  };
  return (
    <span className={`px-4.5 py-1.5 rounded-full border text-[10px] font-black tracking-widest ${colors[pricing] || 'bg-slate-500/10 text-slate-400'}`}>
      {pricing?.toUpperCase()}
    </span>
  );
};

const RatingDisplay = ({ rating }) => {
  const score = rating || 0;
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-2">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
        <span className="text-2xl font-black text-white">{score.toFixed(1)}</span>
      </div>
      {/* 5-star visual indicator */}
      <div className="flex gap-0.5 mt-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-3 h-3 ${
              star <= Math.round(score) 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-slate-800'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

const ComparisonBar = ({ val1, val2, label }) => {
  // Parse values head-to-head (e.g. 'High' -> 3, 'Medium' -> 2, 'Low' -> 1)
  const parseVal = (v) => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    
    // Parse popularity keywords
    if (v === 'High') return 3;
    if (v === 'Medium') return 2;
    if (v === 'Low') return 1;

    const num = parseFloat(v.replace(/[^0-9.]/g, ''));
    if (v.toLowerCase().includes('k')) return num * 1000;
    if (v.toLowerCase().includes('m')) return num * 1000000;
    return num || 0;
  };

  const n1 = parseVal(val1);
  const n2 = parseVal(val2);
  const total = n1 + n2 || 1;
  const p1 = (n1 / total) * 100;
  const p2 = (n2 / total) * 100;

  return (
    <div className="w-full max-w-[280px] md:max-w-xs mx-auto space-y-2">
      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
        <span>{val1}</span>
        <span className="text-indigo-400 font-black">{label}</span>
        <span>{val2}</span>
      </div>
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex border border-white/5">
        <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500" style={{ width: `${p1}%` }} />
        <div className="h-full bg-slate-800 w-[2px] shrink-0" />
        <div className="h-full bg-gradient-to-l from-violet-600 to-violet-500" style={{ width: `${p2}%`, background: '#7c3aed' }} />
      </div>
    </div>
  );
};

const ModelInfo = ({ info }) => (
  <div className="flex flex-col items-center bg-slate-950/40 p-3 rounded-xl border border-white/5 min-w-[160px]">
    <Cpu className="w-4 h-4 text-indigo-400 mb-1.5" />
    <p className="font-black text-white text-sm tracking-tight">{info?.modelName || 'Custom AI'}</p>
    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{info?.modelType || 'Proprietary'}</p>
  </div>
);

const FeaturesList = ({ features }) => (
  <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
    {(features || ['AI Powered']).slice(0, 3).map((f, i) => (
      <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 border border-white/5 flex items-center gap-1.5 hover:border-indigo-500/10 transition-colors">
        <span className="w-1 h-1 rounded-full bg-indigo-500" />
        <span>{f}</span>
      </span>
    ))}
  </div>
);

const ProsConsList = ({ pros, cons }) => (
  <div className="flex flex-col gap-4 max-w-xs sm:max-w-md mx-auto text-left w-full">
    {/* Pros Card */}
    <div className="p-3 bg-emerald-950/10 border-l-4 border-emerald-500/30 rounded-r-xl space-y-2">
      <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest pb-1 border-b border-emerald-500/10 flex items-center gap-1">
        <ThumbsUp className="w-3 h-3 text-emerald-400" />
        <span>Pros / Advantages</span>
      </p>
      <ul className="space-y-1">
        {pros && pros.length > 0 ? pros.slice(0, 3).map((pro, i) => (
          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
            <span>{pro}</span>
          </li>
        )) : <li className="text-xs text-slate-600 italic">None specified</li>}
      </ul>
    </div>
    
    {/* Cons Card */}
    <div className="p-3 bg-rose-950/10 border-l-4 border-rose-500/30 rounded-r-xl space-y-2">
      <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest pb-1 border-b border-rose-500/10 flex items-center gap-1">
        <ThumbsDown className="w-3 h-3 text-rose-400" />
        <span>Cons / Limitations</span>
      </p>
      <ul className="space-y-1">
        {cons && cons.length > 0 ? cons.slice(0, 3).map((con, i) => (
          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
            <span className="text-rose-400 font-bold shrink-0 mt-0.5">⚠</span>
            <span>{con}</span>
          </li>
        )) : <li className="text-xs text-slate-600 italic">None specified</li>}
      </ul>
    </div>
  </div>
);

const UseCasesList = ({ useCases }) => (
  <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
    {useCases && useCases.length > 0 ? useCases.slice(0, 3).map((u, i) => (
      <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-950 text-slate-400 border border-white/5 hover:text-indigo-300 transition-colors">
        {u}
      </span>
    )) : <span className="text-[10px] text-slate-600 italic">None listed</span>}
  </div>
);

const ApiAccessIcon = ({ apiAccess }) => {
  return apiAccess ? (
    <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
      <ShieldCheck className="w-4 h-4 text-emerald-400" />
      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Available</span>
    </div>
  ) : (
    <div className="inline-flex items-center space-x-1.5 bg-slate-900/50 px-3.5 py-1.5 rounded-xl border border-white/5 shadow-inner">
      <Minus className="w-4 h-4 text-slate-500" />
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Restricted</span>
    </div>
  );
};

export default Compare;
