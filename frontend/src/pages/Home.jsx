import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import { motion } from 'framer-motion';
import { 
  Sparkles, ArrowRight, TrendingUp, Search, X, ChevronRight, Heart,
  PenTool, Code, Image, Video, Music, Database, CheckSquare, Megaphone,
  GraduationCap, Cpu, Palette, DollarSign, Scale, Users, ShieldCheck, Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnimatedMeshGradient from '../components/AnimatedMeshGradient';
import SkeletonCard from '../components/SkeletonCard';
import { getLogoUrl } from '../apiConfig.js';

const Home = () => {
  const [categoriesData, setCategoriesData] = useState({});
  const [trendingTools, setTrendingTools] = useState([]);
  const [favoritedTools, setFavoritedTools] = useState([]);
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

      // Check client-side session cache
      const cached = sessionStorage.getItem('all_tools_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const grouped = parsed.reduce((acc, tool) => {
          if (!acc[tool.category]) acc[tool.category] = [];
          acc[tool.category].push(tool);
          return acc;
        }, {});
        
        setAllTools(parsed);
        setCategoriesData(grouped);
        setLoading(false);
        
        // Fetch in background to silently update cache
        axios.get(`http://localhost:5000/api/tools`).then(({ data }) => {
          sessionStorage.setItem('all_tools_cache', JSON.stringify(data));
        }).catch(() => {});
        return;
      }

      const { data } = await axios.get(`http://localhost:5000/api/tools`);
      sessionStorage.setItem('all_tools_cache', JSON.stringify(data));
      
      // Group tools by category
      const grouped = data.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
      }, {});
      
      setAllTools(data);
      setCategoriesData(grouped);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const cachedTrending = sessionStorage.getItem('trending_tools_cache');
      const cachedFavorites = sessionStorage.getItem('favorites_tools_cache');

      if (cachedTrending) setTrendingTools(JSON.parse(cachedTrending));
      if (cachedFavorites) setFavoritedTools(JSON.parse(cachedFavorites));

      // Fetch both in parallel using Promise.all
      const [{ data: trending }, { data: favorites }] = await Promise.all([
        axios.get('http://localhost:5000/api/tools/trending'),
        axios.get('http://localhost:5000/api/tools/favorites-trending')
      ]);

      setTrendingTools(trending);
      setFavoritedTools(favorites);

      sessionStorage.setItem('trending_tools_cache', JSON.stringify(trending));
      sessionStorage.setItem('favorites_tools_cache', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error fetching trending/favorited tools:', error);
    }
  };

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const categoryMeta = {
    'Writing': { icon: <PenTool className="w-5 h-5 text-indigo-400" />, bg: 'hover:border-indigo-500/30' },
    'Coding': { icon: <Code className="w-5 h-5 text-cyan-400" />, bg: 'hover:border-cyan-500/30' },
    'Image': { icon: <Image className="w-5 h-5 text-purple-400" />, bg: 'hover:border-purple-500/30' },
    'Video': { icon: <Video className="w-5 h-5 text-rose-400" />, bg: 'hover:border-rose-500/30' },
    'Audio': { icon: <Music className="w-5 h-5 text-emerald-400" />, bg: 'hover:border-emerald-500/30' },
    'Data': { icon: <Database className="w-5 h-5 text-amber-400" />, bg: 'hover:border-amber-500/30' },
    'Productivity': { icon: <CheckSquare className="w-5 h-5 text-violet-400" />, bg: 'hover:border-violet-500/30' },
    'Marketing': { icon: <Megaphone className="w-5 h-5 text-pink-400" />, bg: 'hover:border-pink-500/30' },
    'Education': { icon: <GraduationCap className="w-5 h-5 text-teal-400" />, bg: 'hover:border-teal-500/30' },
    'Automation': { icon: <Cpu className="w-5 h-5 text-orange-400" />, bg: 'hover:border-orange-500/30' },
    'Design': { icon: <Palette className="w-5 h-5 text-lime-400" />, bg: 'hover:border-lime-500/30' },
    'Logo Maker': { icon: <Sparkles className="w-5 h-5 text-yellow-400" />, bg: 'hover:border-yellow-500/30' },
    'Finance': { icon: <DollarSign className="w-5 h-5 text-green-400" />, bg: 'hover:border-green-500/30' },
    'Legal': { icon: <Scale className="w-5 h-5 text-sky-400" />, bg: 'hover:border-sky-500/30' },
    'HR': { icon: <Users className="w-5 h-5 text-fuchsia-400" />, bg: 'hover:border-fuchsia-500/30' },
    'Cybersecurity': { icon: <ShieldCheck className="w-5 h-5 text-red-400" />, bg: 'hover:border-red-500/30' }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <AnimatedMeshGradient />
      
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
                placeholder={`Search over ${allTools.length > 0 ? Math.floor(allTools.length / 10) * 10 : 150}+ AI tools, categories, or features...`}
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
                                  src={getLogoUrl(tool)}
                                  alt={tool.name} 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=6366f1&color=fff&bold=true&size=128`;
                                  }}
                                  loading="lazy"
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
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8 border-l-4 border-amber-500 pl-6">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3 text-amber-500" />
                  Trending Tools
                </h2>
                <p className="text-slate-500 text-sm mt-1">The most popular AI tools this week</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingTools.slice(0, 6).map(tool => (
                <ToolCard key={tool._id} tool={tool} onClick={handleToolClick} />
              ))}
            </div>
          </section>
        )}

        {/* Most Favorited Section */}
        {!loading && favoritedTools.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8 border-l-4 border-rose-500 pl-6">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center">
                  <Heart className="w-8 h-8 mr-3 text-rose-500 fill-rose-500 animate-pulse" />
                  Most Favorited Tools
                </h2>
                <p className="text-slate-500 text-sm mt-1">AI tools with the highest community votes this week</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoritedTools.slice(0, 6).map(tool => (
                <ToolCard key={tool._id} tool={tool} onClick={handleToolClick} />
              ))}
            </div>
          </section>
        )}

        {/* Category Showcase Grid (App-Store Style) */}
        {!loading && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-8 border-l-4 border-indigo-600 pl-6">
              <div>
                <h2 className="text-3xl font-black text-white">Explore by Category</h2>
                <p className="text-slate-500 text-sm mt-1">Slick quick-access directories of premium AI assistants</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const meta = categoryMeta[category] || { icon: <Sparkles className="w-5 h-5 text-indigo-400" />, bg: 'hover:border-indigo-500/30' };
                const count = categoriesData[category]?.length || 0;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => navigate(`/category/${category}`)}
                    className={`glass-card-premium rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 cursor-pointer ${meta.bg}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl">
                        {meta.icon}
                      </div>
                      <span className="text-[9px] font-black uppercase text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                        {count} Tools
                      </span>
                    </div>
                    <div className="mt-6 flex items-center justify-between group">
                      <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{category}</h3>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </main>

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
