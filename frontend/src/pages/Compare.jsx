import { useState, useEffect } from 'react';
import api from '../api/client';
import { Search, ArrowRight, Star, Check, X, Shield, Zap, TrendingUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Compare = () => {
  const [tools, setTools] = useState([]);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [selected1, setSelected1] = useState(null);
  const [selected2, setSelected2] = useState(null);
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);

  useEffect(() => {
    // Initial fetch for trending or common tools
    const fetchTools = async () => {
      try {
        const { data } = await api.get('/api/tools?pageSize=100');
        setTools(data.tools);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };
    fetchTools();
  }, []);

  const handleSearch = (query, setSuggestions) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const filtered = tools.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const ComparisonRow = ({ label, icon: Icon, value1, value2, isArray = false, isRating = false }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8 border-b border-border hover:bg-secondary/10 transition-colors px-4 group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <span className="font-black text-sm uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      
      <div className="flex flex-col justify-center">
        {isRating ? (
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="text-xl font-black">{value1 || 'N/A'}</span>
          </div>
        ) : isArray ? (
          <div className="space-y-2">
            {(value1 || []).slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-3 h-3 text-green-500" /> {item}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg font-bold">{value1 || 'N/A'}</p>
        )}
      </div>

      <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8">
        {isRating ? (
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="text-xl font-black">{value2 || 'N/A'}</span>
          </div>
        ) : isArray ? (
          <div className="space-y-2">
            {(value2 || []).slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-3 h-3 text-green-500" /> {item}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg font-bold">{value2 || 'N/A'}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-6">
          Compare <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Tools</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
          Choose two tools to see a head-to-head breakdown of their features, pricing, and capabilities.
        </p>
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Selection 1 */}
        <div className="relative">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-blue-500" />
              <input 
                type="text"
                placeholder="Search first tool..."
                value={search1}
                onChange={(e) => {
                  setSearch1(e.target.value);
                  handleSearch(e.target.value, setSuggestions1);
                }}
                className="w-full bg-transparent outline-none font-bold text-lg"
              />
            </div>
            
            {suggestions1.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                {suggestions1.map(t => (
                  <button 
                    key={t._id}
                    onClick={() => {
                      setSelected1(t);
                      setSearch1(t.name);
                      setSuggestions1([]);
                    }}
                    className="w-full px-6 py-4 text-left hover:bg-secondary flex items-center gap-4 transition-colors border-b border-border last:border-0"
                  >
                    <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center p-2">
                       <img src={`https://www.google.com/s2/favicons?domain=${new URL(t.link).hostname}&sz=64`} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selected1 && (
              <div className="mt-6 flex items-center gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 animate-in zoom-in duration-300">
                <div className="h-16 w-16 rounded-2xl bg-white border border-border flex items-center justify-center p-3 shadow-sm">
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(selected1.link).hostname}&sz=64`} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{selected1.name}</h3>
                  <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">{selected1.pricing}</p>
                </div>
                <button onClick={() => setSelected1(null)} className="ml-auto p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selection 2 */}
        <div className="relative">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-indigo-500" />
              <input 
                type="text"
                placeholder="Search second tool..."
                value={search2}
                onChange={(e) => {
                  setSearch2(e.target.value);
                  handleSearch(e.target.value, setSuggestions2);
                }}
                className="w-full bg-transparent outline-none font-bold text-lg"
              />
            </div>
            
            {suggestions2.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                {suggestions2.map(t => (
                  <button 
                    key={t._id}
                    onClick={() => {
                      setSelected2(t);
                      setSearch2(t.name);
                      setSuggestions2([]);
                    }}
                    className="w-full px-6 py-4 text-left hover:bg-secondary flex items-center gap-4 transition-colors border-b border-border last:border-0"
                  >
                    <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center p-2">
                       <img src={`https://www.google.com/s2/favicons?domain=${new URL(t.link).hostname}&sz=64`} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selected2 && (
              <div className="mt-6 flex items-center gap-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 animate-in zoom-in duration-300">
                <div className="h-16 w-16 rounded-2xl bg-white border border-border flex items-center justify-center p-3 shadow-sm">
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(selected2.link).hostname}&sz=64`} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{selected2.name}</h3>
                  <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{selected2.pricing}</p>
                </div>
                <button onClick={() => setSelected2(null)} className="ml-auto p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      {selected1 && selected2 ? (
        <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-1000">
          <div className="bg-secondary/50 p-8 border-b border-border hidden md:grid grid-cols-3 gap-8">
            <div className="text-xl font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Feature</div>
            <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
              <div className="h-2 w-8 bg-blue-600 rounded-full"></div> {selected1.name}
            </div>
            <div className="text-2xl font-black text-indigo-600 flex items-center gap-2">
              <div className="h-2 w-8 bg-indigo-600 rounded-full"></div> {selected2.name}
            </div>
          </div>

          <ComparisonRow label="Pricing" icon={Shield} value1={selected1.pricing} value2={selected2.pricing} />
          <ComparisonRow label="Rating" icon={Star} value1={selected1.rating} value2={selected2.rating} isRating />
          <ComparisonRow label="Category" icon={TrendingUp} value1={selected1.category} value2={selected2.category} />
          <ComparisonRow label="Key Features" icon={ListChecks} value1={selected1.features} value2={selected2.features} isArray />
          <ComparisonRow label="Top Pros" icon={Check} value1={selected1.pros} value2={selected2.pros} isArray />
          <ComparisonRow label="Top Cons" icon={X} value1={selected1.cons} value2={selected2.cons} isArray />
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-blue-600/5">
            <div className="font-black text-sm uppercase tracking-widest text-muted-foreground">Action</div>
            <div>
              <Link to={`/tools/${selected1._id}`} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25">
                View {selected1.name} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div>
              <Link to={`/tools/${selected2._id}`} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25">
                View {selected2.name} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border group">
          <HelpCircle className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
          <h2 className="text-3xl font-black mb-4">Ready to Compare?</h2>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
            Select two AI tools from the search bars above to start your deep comparison.
          </p>
        </div>
      )}
    </div>
  );
};

const ListChecks = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>
  </svg>
);

export default Compare;
