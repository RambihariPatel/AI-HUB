import { useState, useEffect } from 'react';
import api from '../api/client';
import { Scale, X, Star, Check, AlertCircle, Plus, Zap } from 'lucide-react';

const Compare = () => {
  const [allTools, setAllTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTools = async () => {
      try {
        const { data } = await api.get('/api/tools?pageSize=100');
        setAllTools(data.tools);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tools for comparison', error);
        setLoading(false);
      }
    };
    fetchAllTools();
  }, []);

  const addTool = (tool) => {
    if (selectedTools.length >= 3) return;
    if (selectedTools.find(t => t._id === tool._id)) return;
    setSelectedTools([...selectedTools, tool]);
    setSearchTerm('');
  };

  const removeTool = (id) => {
    setSelectedTools(selectedTools.filter(t => t._id !== id));
  };

  const filteredTools = allTools.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTools.find(st => st._id === t._id)
  ).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-2xl mb-4">
          <Scale className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Compare AI Tools</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Select up to 3 AI tools to compare their features, pricing, and performance side-by-side.
        </p>
      </div>

      {/* Tool Selector */}
      <div className="max-w-2xl mx-auto mb-16 relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search and add a tool to compare..." 
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && (
          <div className="absolute z-50 mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <button
                  key={tool._id}
                  onClick={() => addTool(tool)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-secondary transition-colors text-left border-b border-border last:border-0"
                >
                  <div className="h-10 w-10 rounded-lg bg-white border border-border flex items-center justify-center p-1">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=64`} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{tool.name}</div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{tool.category} • {tool.pricing}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-6 py-4 text-muted-foreground text-center">No tools found matching "{searchTerm}"</div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      {selectedTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedTools.map(tool => (
            <div key={tool._id} className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => removeTool(tool._id)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 text-center border-b border-border bg-gradient-to-b from-secondary/50 to-transparent">
                <div className="h-20 w-20 rounded-2xl bg-white border border-border flex items-center justify-center p-3 mx-auto mb-6 shadow-md">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`} 
                    alt={tool.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-black mb-2">{tool.name}</h2>
                <div className="px-3 py-1 bg-blue-500/10 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full inline-block mb-4">
                  {tool.category}
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg font-bold text-foreground">{tool.rating}</span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-4">Pricing Model</label>
                  <div className={`text-lg font-bold ${tool.pricing === 'Free' ? 'text-green-500' : 'text-foreground'}`}>
                    {tool.pricing === 'Freemium' ? 'Free Tier Available' : tool.pricing}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-4">Top Credits Info</label>
                  <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-xl border border-border">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{tool.modelInfo?.credits || 'Varies'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-4">Key Features</label>
                  <ul className="space-y-3">
                    {tool.features?.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-4">Main Advantage</label>
                  <div className="text-sm font-medium leading-relaxed bg-green-500/5 p-4 rounded-xl border border-green-500/10 text-green-700 dark:text-green-400">
                    {tool.pros?.[0] || 'High performance and reliable.'}
                  </div>
                </div>

                <a 
                  href={tool.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Get Started
                </a>
              </div>
            </div>
          ))}

          {selectedTools.length < 3 && (
            <div className="border-2 border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center p-12 text-center bg-secondary/20">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Add Another Tool</h3>
              <p className="text-sm text-muted-foreground mb-8">Compare up to 3 tools to find the best match.</p>
              <button 
                onClick={() => document.querySelector('input').focus()}
                className="text-blue-500 font-bold hover:underline"
              >
                Search Tool
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 bg-card border border-border rounded-[3rem] shadow-sm">
          <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Scale className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Your comparison is empty</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-10">
            Search and add tools from the search bar above to see them side-by-side.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
             <button onClick={() => addTool(allTools.find(t => t.name === 'ChatGPT'))} className="px-4 py-2 bg-secondary hover:bg-border rounded-full text-sm font-bold transition-colors">Add ChatGPT</button>
             <button onClick={() => addTool(allTools.find(t => t.name === 'Gemini'))} className="px-4 py-2 bg-secondary hover:bg-border rounded-full text-sm font-bold transition-colors">Add Gemini</button>
             <button onClick={() => addTool(allTools.find(t => t.name === 'Claude 3'))} className="px-4 py-2 bg-secondary hover:bg-border rounded-full text-sm font-bold transition-colors">Add Claude 3</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
