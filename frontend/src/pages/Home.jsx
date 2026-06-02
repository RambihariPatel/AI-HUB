import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, TrendingUp, Search, X, ChevronRight,
  PenTool, Code, Image as ImageIcon, Video, Music, Database,
  Zap, BarChart3, GraduationCap, Bot, Palette, DollarSign,
  Scale, Users, ShieldCheck, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [trendingTools, setTrendingTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allTools, setAllTools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tools: [], categories: [] });
  const navigate = useNavigate();
  const searchRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    'Writing', 'Coding', 'Image', 'Video', 'Audio', 
    'Data', 'Productivity', 'Marketing', 'Education', 'Automation',
    'Design', 'Logo Maker', 'Finance', 'Legal', 'HR', 'Cybersecurity'
  ];

  const premiumCategories = [
    { name: 'Writing', desc: 'Copywriting, blogging, & content creation assistants', icon: PenTool, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/10' },
    { name: 'Coding', desc: 'AI code generation, debugging, & development toolkits', icon: Code, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/10' },
    { name: 'Image', desc: 'AI art generation, graphic design, & text-to-image prompts', icon: ImageIcon, color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/10' },
    { name: 'Video', desc: 'Video generation, AI avatars, & automated video editing', icon: Video, color: 'from-red-500 to-orange-600', shadow: 'shadow-red-500/10' },
    { name: 'Audio', desc: 'Music generation, text-to-speech, & voice cloning', icon: Music, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/10' },
    { name: 'Data', desc: 'Advanced data parsing, visualization, & intelligence analytics', icon: Database, color: 'from-amber-500 to-yellow-600', shadow: 'shadow-amber-500/10' },
    { name: 'Productivity', desc: 'AI notes, smart search, scheduling, & email management', icon: Zap, color: 'from-cyan-500 to-sky-600', shadow: 'shadow-cyan-500/10' },
    { name: 'Marketing', desc: 'SEO optimization, copy generation, ads & growth tools', icon: BarChart3, color: 'from-lime-500 to-green-600', shadow: 'shadow-lime-500/10' },
    { name: 'Education', desc: 'Smart AI tutors, interactive research, & homework help', icon: GraduationCap, color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/10' },
    { name: 'Automation', desc: 'Workflow integration, automated triggers & chat bots', icon: Bot, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/10' },
    { name: 'Design', desc: 'AI asset creation, smart palettes, & UI/UX design tools', icon: Palette, color: 'from-pink-500 to-purple-600', shadow: 'shadow-pink-500/10' },
    { name: 'Logo Maker', desc: 'AI-powered logo design, brand identity & icon generators', icon: Crown, color: 'from-amber-400 to-yellow-600', shadow: 'shadow-amber-500/10' },
    { name: 'Finance', desc: 'Smart bookkeeping, stock analytics, & financial intelligence', icon: DollarSign, color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/10' },
    { name: 'Legal', desc: 'Contracts analysis, law research, & automated compliance', icon: Scale, color: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/10' },
    { name: 'HR', desc: 'Applicant tracking, resume screeners, & talent onboarding', icon: Users, color: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/10' },
    { name: 'Cybersecurity', desc: 'Threat monitoring, smart audits & cryptographical safety', icon: ShieldCheck, color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/10' }
  ];

  useEffect(() => {
    fetchAllTools();
    fetchTrending();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      const filteredTools = allTools.filter(tool => 
        tool.name.toLowerCase().includes(query) || 
        tool.category.toLowerCase().includes(query) ||
        tool.tagline.toLowerCase().includes(query)
      ).slice(0, 8);
      
      const filteredCategories = categories.filter(cat => 
        cat.toLowerCase().includes(query)
      ).slice(0, 4);

      setSearchResults({ tools: filteredTools, categories: filteredCategories });
    } else {
      setSearchResults({ tools: [], categories: [] });
    }
  }, [searchQuery, allTools]);

  const fetchAllTools = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/tools`);
      setAllTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const { data } = await axios.get('/api/tools/trending');
      setTrendingTools(data);
    } catch (error) {
      console.error('Error fetching trending tools:', error);
    }
  };

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      <div className="flex-grow">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          {/* Hero Section */}
          <section className="text-center mb-20 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Discover the future of AI tools</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight"
            >
              All-in-One <br /><span className="text-indigo-500">AI Tools Hub</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Explore the most comprehensive directory of AI tools, categorized and detailed for your every need.
            </motion.p>

            {/* Hero Search Bar */}
            <div ref={searchRef} className="max-w-2xl mx-auto relative group">
              <div className="relative flex items-center">
                <div className="absolute left-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  placeholder="Search over 110+ AI tools, categories, or features..."
                  className="w-full bg-slate-900/50 backdrop-blur-xl border-2 border-white/5 rounded-2xl py-5 pl-14 pr-14 text-lg text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all shadow-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {(searchResults.tools.length > 0 || searchResults.categories.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="p-2 max-h-[450px] overflow-y-auto custom-scrollbar">
                      {/* Categories Results */}
                      {searchResults.categories.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categories</div>
                          <div className="grid grid-cols-2 gap-1 px-2">
                            {searchResults.categories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => {
                                  navigate(`/category/${cat}`);
                                  setSearchQuery('');
                                }}
                                className="flex items-center justify-between px-3 py-2.5 hover:bg-indigo-500/10 rounded-xl group/item transition-all border border-transparent hover:border-indigo-500/20"
                              >
                                <span className="text-sm font-bold text-slate-300 group-hover/item:text-white">{cat}</span>
                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-indigo-400 group-hover/item:translate-x-1 transition-all" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tools Results */}
                      {searchResults.tools.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5 mt-2 pt-4">Tools</div>
                          <div className="space-y-1 p-2">
                            {searchResults.tools.map(tool => (
                              <button
                                key={tool._id}
                                onClick={() => {
                                  handleToolClick(tool);
                                  setSearchQuery('');
                                }}
                                className="w-full flex items-center p-3 hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-white/5 group/tool"
                              >
                                <div className="w-12 h-12 rounded-xl bg-slate-800 p-2 mr-4 border border-white/5 group-hover/tool:scale-110 transition-transform">
                                  <img 
                                    src={`/api/utils/proxy-logo?domain=${new URL(tool.link).hostname}&name=${encodeURIComponent(tool.name)}`}
                                    alt={tool.name} 
                                    className="w-full h-full object-contain" 
                                  />
                                </div>
                                <div className="text-left flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-white font-bold text-sm group-hover/tool:text-indigo-400 transition-colors">{tool.name}</p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">{tool.category}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{tool.tagline}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-950/50 p-3 text-center border-t border-white/5">
                      <p className="text-[10px] text-slate-600 font-medium">Found {searchResults.tools.length} tools and {searchResults.categories.length} categories</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Trending Section */}
          {!loading && trendingTools.length > 0 && (
            <section className="mb-24">
              <div className="flex items-center justify-between mb-10 border-l-4 border-amber-500 pl-6">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center">
                    <TrendingUp className="w-8 h-8 mr-3 text-amber-500" />
                    Trending Tools
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">The most popular AI tools this week</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {trendingTools.slice(0, 5).map(tool => (
                  <ToolCard key={tool._id} tool={tool} onClick={handleToolClick} />
                ))}
              </div>
            </section>
          )}

          {/* Premium Category Blocks Grid */}
          <section className="mb-24">
            <div className="flex items-center justify-between mb-10 border-l-4 border-indigo-500 pl-6">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center">
                  <Sparkles className="w-8 h-8 mr-3 text-indigo-500" />
                  Explore Categories
                </h2>
                <p className="text-slate-500 text-sm mt-1">Choose a category to discover specialized AI solutions</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-48 rounded-[2rem] animate-pulse bg-slate-900/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      whileHover={{ y: -6 }}
                      onClick={() => navigate(`/category/${cat.name}`)}
                      className="group relative cursor-pointer glass-card-premium rounded-3xl p-6 border border-white/5 hover:border-white/10 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 blur-2xl group-hover:bg-indigo-600/10 transition-colors" />
                      
                      <div className="flex items-start justify-between">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${cat.color} ${cat.shadow} text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          Browse Category
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mt-6 group-hover:text-indigo-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {cat.desc}
                      </p>

                      <div className="flex items-center space-x-1 text-xs text-indigo-400 mt-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>View tools</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer />

      <ToolModal 
        tool={selectedTool} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
