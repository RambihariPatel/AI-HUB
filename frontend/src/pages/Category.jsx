import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ToolCard from '../components/ToolCard';
import { motion } from 'framer-motion';
import { Filter, Sparkles, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedMeshGradient from '../components/AnimatedMeshGradient';
import SkeletonCard from '../components/SkeletonCard';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryName || 'All');
  const [pricingFilter, setPricingFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchTools();
  }, [activeCategory, pricingFilter, minRating, sortBy]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/tools`, {
        params: {
          category: activeCategory !== 'All' ? activeCategory : undefined,
          pricing: pricingFilter !== 'All' ? pricingFilter : undefined,
          rating: minRating > 0 ? minRating : undefined
        }
      });
      
      // Client-side sort
      const sortedData = [...data].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setTools(sortedData);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    navigate(`/category/${cat}`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <AnimatedMeshGradient />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-indigo-400 font-bold">{activeCategory} Tools</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Sidebar 
              activeCategory={activeCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </div>

          {/* Main Feed */}
          <div className="flex-1">
            <section>
              {/* Header & Stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                  <h2 className="text-3xl font-black text-white">
                    {activeCategory} AI Tools
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-bold bg-slate-900 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                    {tools.length} Tools Found
                  </span>
                </div>
              </div>

              {/* Advanced Filter Bar */}
              <div className="glass-card-premium rounded-[1.5rem] p-2 mb-8 flex flex-wrap items-center gap-2 border border-white/5">
                {/* Pricing Filters */}
                <div className="flex items-center bg-slate-950/50 rounded-xl p-1 border border-white/5">
                  {['All', 'Free', 'Freemium', 'Paid'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPricingFilter(p)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        pricingFilter === p 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="h-8 w-[1px] bg-white/10 hidden md:block mx-2" />

                {/* Rating Filter */}
                <div className="flex items-center space-x-2 bg-slate-950/50 rounded-xl px-3 py-1.5 border border-white/5">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <select 
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="0" className="bg-slate-900 text-white">All Ratings</option>
                    <option value="4" className="bg-slate-900 text-white">4.0+ Stars</option>
                    <option value="4.5" className="bg-slate-900 text-white">4.5+ Stars</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="flex items-center space-x-2 bg-slate-950/50 rounded-xl px-3 py-1.5 border border-white/5 ml-auto">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="rating" className="bg-slate-900 text-white">Top Rated</option>
                    <option value="clicks" className="bg-slate-900 text-white">Most Popular</option>
                    <option value="newest" className="bg-slate-900 text-white">Recently Added</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {tools.map(tool => (
                    <ToolCard key={tool._id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 glass-card-premium rounded-[3rem] border border-white/5">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
                    <Filter className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No tools matched your filters</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or category to find what you're looking for.</p>
                  <button 
                    onClick={() => { setPricingFilter('All'); setMinRating(0); }}
                    className="mt-8 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
