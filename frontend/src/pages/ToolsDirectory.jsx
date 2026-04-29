import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/client';
import { Search, Filter, Star, ArrowRight, Zap, RefreshCw } from 'lucide-react';

const ToolsDirectory = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All Categories';

  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [pricing, setPricing] = useState('All Pricing');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'All Categories', 'Writing', 'Coding', 'Image', 'Video', 'Audio', 
    'Automation', 'Marketing', 'Education', 'Productivity', 'Data'
  ];

  const pricingModels = ['All Pricing', 'Free', 'Freemium', 'Paid'];

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        let url = `/api/tools?page=${page}&pageSize=12`;
        
        if (category !== 'All Categories') url += `&category=${category}`;
        if (pricing !== 'All Pricing') url += `&pricing=${pricing}`;
        if (searchQuery) url += `&keyword=${searchQuery}`;

        const { data } = await api.get(url);
        setTools(data.tools);
        setTotalPages(data.pages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tools directory', error);
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchTools();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, pricing, searchQuery, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, pricing, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">AI Tools Directory</h1>
          <p className="text-muted-foreground">Discover and filter through {tools.length * totalPages}+ high-capability AI tools.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search tools, tags, use cases..." 
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-10">
        {/* Sidebar Filters */}
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg">
              <Filter className="w-5 h-5 text-blue-500" /> Filters
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        category === cat 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Pricing Model</label>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {pricingModels.map(model => (
                    <button
                      key={model}
                      onClick={() => setPricing(model)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                        pricing === model 
                          ? 'bg-blue-600/10 border-blue-500 text-blue-600' 
                          : 'bg-background border-border text-muted-foreground hover:border-blue-500/40'
                      }`}
                    >
                      {model === 'Freemium' ? 'Free Tier Available' : model}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => { setCategory('All Categories'); setPricing('All Pricing'); setSearchQuery(''); }}
                className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-secondary rounded-2xl border border-border"></div>
              ))}
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-24 bg-card border border-border border-dashed rounded-3xl">
              <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-8">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => { setCategory('All Categories'); setPricing('All Pricing'); setSearchQuery(''); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tools.map(tool => (
                  <div key={tool._id} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-xl bg-white border border-blue-500/20 flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`} 
                          alt={tool.name} 
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            const domain = new URL(tool.link).hostname.replace('www.', '');
                            if (!e.target.src.includes('clearbit')) {
                              e.target.src = `https://logo.clearbit.com/${domain}`;
                            } else {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${tool.name}&background=0D8ABC&color=fff&size=128`;
                            }
                          }}
                        />
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                        tool.pricing === 'Free' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        tool.pricing === 'Paid' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {tool.pricing === 'Freemium' ? 'Free Tier' : tool.pricing}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-1 group-hover:text-blue-500 transition-colors truncate">{tool.name}</h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 mb-4 h-8">{tool.tagline}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-foreground">{tool.rating}</span>
                      </div>
                      <Link to={`/tools/${tool._id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-500 flex items-center gap-1">
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-secondary transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-bold text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-secondary transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolsDirectory;
