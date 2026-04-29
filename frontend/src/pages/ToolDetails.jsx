import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Star, ExternalLink, Check, ArrowLeft, Zap, MessageSquare, Info, TrendingUp, Heart } from 'lucide-react';

const ToolDetails = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedTools, setRelatedTools] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/tools/${id}`);
        setTool(data);

        // Fetch related tools in same category
        const { data: catData } = await api.get(`/api/tools?category=${data.category}`);
        setRelatedTools(catData.tools.filter(t => t._id !== id).slice(0, 4));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tool details', error);
        setLoading(false);
      }
    };
    fetchToolDetails();
  }, [id]);

  const toggleFavourite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to save favorites!');
      return;
    }
    try {
      await api.post('/api/users/favourites', { toolId: id });
      setIsFavourite(!isFavourite);
    } catch (error) {
      console.error('Error toggling favourite', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Tool not found</h2>
        <Link to="/" className="text-blue-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-blue-500 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discover
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Tool Info */}
        <div className="lg:col-span-2 space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="h-32 w-32 rounded-2xl bg-white flex items-center justify-center border border-blue-500/20 shadow-inner overflow-hidden p-4">
              <img 
                src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=256`} 
                alt={tool.name} 
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${tool.name}&background=0D8ABC&color=fff&size=256`;
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {tool.category}
                </span>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                  tool.pricing === 'Free' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                  tool.pricing === 'Paid' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                  'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  {tool.pricing}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{tool.name}</h1>
              <p className="text-xl text-muted-foreground mb-6 font-medium">{tool.tagline}</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="w-6 h-6 fill-current" />
                  <span className="text-2xl font-bold text-foreground">{tool.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">({tool.numReviews || 0} reviews)</span>
                </div>
                <div className="h-6 w-px bg-border hidden sm:block"></div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">{tool.popularityLevel} Popularity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-border pb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-500" /> About {tool.name}
            </h2>
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {tool.descriptionLong || tool.descriptionShort}
              </p>
            </div>
          </div>

          {/* Features Section */}
          {tool.features && tool.features.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-border pb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-green-500" /> Key Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-12 mt-12 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" /> User Reviews
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-lg font-bold">
                <Star className="w-4 h-4 fill-current" />
                {tool.rating}
              </div>
            </div>

            <div className="space-y-6">
              {/* Review Form */}
              <div className="bg-secondary/30 p-8 rounded-3xl border border-border">
                <h3 className="text-lg font-bold mb-4">Share your experience</h3>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-6 h-6 text-muted-foreground cursor-pointer hover:text-amber-500 transition-colors" />
                    ))}
                  </div>
                  <textarea 
                    placeholder="What do you think about this tool? (Features, speed, accuracy...)" 
                    className="w-full h-32 p-4 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  ></textarea>
                  <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                    Post Review
                  </button>
                </div>
              </div>

              {/* Sample Review */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                    <div>
                      <div className="font-bold">John Doe</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">2 days ago</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Excellent tool! The accuracy and speed are exactly what I was looking for. Highly recommended for students.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Sidebar */}
        <div className="space-y-8 sticky top-24 h-fit">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <a 
              href={tool.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all mb-4 shadow-lg shadow-blue-500/25 active:scale-95"
            >
              Visit Website <ExternalLink className="w-5 h-5" />
            </a>
            
            {tool.modelInfo?.credits && (
              <div className="bg-secondary/50 p-4 rounded-xl border border-border/50 mb-6 flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Free Credits</div>
                  <div className="font-bold text-sm">{tool.modelInfo.credits}</div>
                </div>
              </div>
            )}

            <button 
              onClick={toggleFavourite}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-border mb-4 font-semibold ${
                isFavourite ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavourite ? 'fill-current' : ''}`} /> 
              {isFavourite ? 'Saved to Favorites' : 'Save to Favorites'}
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Pricing Model</span>
                <span className="font-bold">{tool.pricing}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">API Available</span>
                <span className="font-bold">{tool.modelInfo?.apiAccess ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="font-bold">{tool.category}</span>
              </div>
            </div>

            <button className="w-full mt-8 py-3 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              <MessageSquare className="w-5 h-5" /> Write a Review
            </button>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                Similar to {tool.name}
              </h3>
              <div className="space-y-4">
                {relatedTools.map(t => (
                  <Link 
                    to={`/tools/${t._id}`} 
                    key={t._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-border overflow-hidden p-1">
                       <img 
                         src={`https://www.google.com/s2/favicons?domain=${new URL(t.link).hostname}&sz=64`} 
                         alt={t.name} 
                         className="h-full w-full object-contain"
                         onError={(e) => {
                           e.target.onerror = null;
                           e.target.src = `https://ui-avatars.com/api/?name=${t.name}&background=0D8ABC&color=fff&size=64`;
                         }}
                       />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm group-hover:text-blue-500 transition-colors truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t.pricing}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolDetails;
