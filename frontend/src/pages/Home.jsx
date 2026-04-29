import { Link } from 'react-router-dom';
import { Search, ArrowRight, Star, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';

const Home = () => {
  const [groupedTools, setGroupedTools] = useState({});
  const [filteredGroupedTools, setFilteredGroupedTools] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTools, setTrendingTools] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await api.get('/api/tools/trending');
        setTrendingTools(data);
        setTrendingLoading(false);
      } catch (error) {
        console.error('Error fetching trending tools', error);
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data } = await api.get('/api/tools?pageSize=100');
        const tools = data.tools;
        
        // Pricing priority order
        const pricingOrder = { 'Free': 0, 'Freemium': 1, 'Paid': 2 };

        // Group and sort tools by category and pricing
        const grouped = tools.reduce((acc, tool) => {
          if (!acc[tool.category]) {
            acc[tool.category] = [];
          }
          acc[tool.category].push(tool);
          return acc;
        }, {});

        // Fixed category display order
        const CATEGORY_ORDER = [
          'Writing', 'Coding', 'Image', 'Video', 
          'Audio', 'Automation', 'Marketing', 
          'Education', 'Productivity', 'Data'
        ];

        // Sort each category by pricing order
        Object.keys(grouped).forEach(category => {
          grouped[category].sort((a, b) => {
            return (pricingOrder[a.pricing] ?? 99) - (pricingOrder[b.pricing] ?? 99);
          });
        });

        // Apply fixed category order
        const ordered = {};
        CATEGORY_ORDER.forEach(cat => {
          if (grouped[cat]) ordered[cat] = grouped[cat];
        });
        // Add any extra categories not in list
        Object.keys(grouped).forEach(cat => {
          if (!ordered[cat]) ordered[cat] = grouped[cat];
        });

        setGroupedTools(ordered);
        setFilteredGroupedTools(ordered);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tools', error);
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredGroupedTools(groupedTools);
      return;
    }

    const filtered = {};
    Object.entries(groupedTools).forEach(([category, tools]) => {
      // Check if category name matches OR if any tool in this category matches
      const categoryMatches = category.toLowerCase().includes(query);
      const matchingTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(query) || 
        tool.tagline.toLowerCase().includes(query)
      );

      if (categoryMatches || matchingTools.length > 0) {
        // Sort tools so that matching ones come first
        const sortedForSearch = [...tools].sort((a, b) => {
          const aMatch = a.name.toLowerCase().includes(query) || a.tagline.toLowerCase().includes(query);
          const bMatch = b.name.toLowerCase().includes(query) || b.tagline.toLowerCase().includes(query);
          
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0; // Maintain original pricing sort if both match or neither matches
        });

        filtered[category] = sortedForSearch;
      }
    });

    setFilteredGroupedTools(filtered);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative py-24 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background"></div>
        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Discover the Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">AI Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Explore, compare, and analyze thousands of AI tools across all categories to supercharge your workflow and creativity.
          </p>
          
          <div className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col sm:flex-row w-full bg-card rounded-lg shadow-xl ring-1 ring-border">
              <div className="flex items-center pl-4 pr-2 text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Search tools (e.g. ChatGPT, Coding, Writing...)" 
                className="w-full py-4 px-2 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={handleSearch}
              />
              <button className="m-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {!searchQuery && trendingTools.length > 0 && (
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black">Trending Now</h2>
                <p className="text-sm text-muted-foreground font-medium">Most loved tools by the community this week</p>
              </div>
            </div>
            <Link to="/tools" className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Explore All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingTools.map((tool, idx) => (
              <Link 
                key={tool._id} 
                to={`/tools/${tool._id}`}
                className="group relative bg-slate-900 rounded-[2rem] p-6 overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
              >
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 text-8xl font-black text-white/5 italic select-none group-hover:text-blue-500/10 transition-colors">
                  {idx + 1}
                </div>
                
                <div className="relative z-10">
                  <div className="h-12 w-12 bg-white rounded-xl mb-4 p-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors truncate pr-8">{tool.name}</h3>
                  <p className="text-slate-400 text-xs font-medium line-clamp-1 mb-4">{tool.tagline}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-white">{tool.rating}</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                      Trending 🔥
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Sections */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.keys(filteredGroupedTools).length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold mb-2">No tools found for "{searchQuery}"</h3>
            <p className="text-muted-foreground">Try searching for a different keyword or category.</p>
            <button 
              onClick={() => { setSearchQuery(''); setFilteredGroupedTools(groupedTools); }}
              className="mt-6 text-blue-500 font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          Object.entries(filteredGroupedTools).map(([category, tools]) => (
            <section key={category} className="w-full">
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <span className="h-8 w-2 bg-blue-600 rounded-full"></span>
                  {category}
                  <span className="text-sm font-normal text-muted-foreground ml-2">({tools.length} Tools)</span>
                </h2>
                <Link to={`/tools?category=${category}`} className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
                  Explore all {category} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map(tool => {
                  const isMatch = searchQuery && (
                    tool.name.toLowerCase().includes(searchQuery) || 
                    tool.tagline.toLowerCase().includes(searchQuery)
                  );
                  
                  return (
                    <div 
                      key={tool._id} 
                      className={`bg-card rounded-xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col relative overflow-hidden ${
                        isMatch 
                          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-500/[0.05] to-transparent' 
                          : 'border-border'
                      }`}
                    >
                      {isMatch && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-lg shadow-sm z-10 animate-pulse">
                          Matched Result
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center border transition-all overflow-hidden p-1.5 bg-white shadow-sm ${
                          isMatch ? 'border-blue-500/60 ring-2 ring-blue-500/10' : 'border-blue-500/20'
                        }`}>
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`} 
                            alt={tool.name} 
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              // If Google fails, try Clearbit as a backup
                              const domain = new URL(tool.link).hostname.replace('www.', '');
                              if (!e.target.src.includes('clearbit')) {
                                e.target.src = `https://logo.clearbit.com/${domain}`;
                              } else {
                                // If both fail, use UI Avatars
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${tool.name}&background=0D8ABC&color=fff&size=128`;
                              }
                            }}
                          />
                        </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                          tool.pricing === 'Free' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          tool.pricing === 'Paid' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {tool.pricing === 'Freemium' ? 'Free Tier Available' : tool.pricing === 'Free' ? '100% Free' : 'Paid Only'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-500 transition-colors">{tool.name}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{tool.tagline}</p>
                    
                    {/* Credits Info */}
                    {tool.modelInfo?.credits && (
                      <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 py-1 px-2 rounded-md w-fit">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {tool.modelInfo.credits}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm text-foreground">{tool.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({tool.numReviews || 0})</span>
                      </div>
                      <Link to={`/tools/${tool._id}`} className="text-xs font-semibold uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-1">
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>


    </div>
  );
};

export default Home;
