import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  Star, 
  Globe, 
  Heart, 
  ArrowLeft, 
  Share2, 
  CheckCircle, 
  XCircle, 
  Info, 
  Zap, 
  Shield, 
  TrendingUp,
  FolderPlus,
  ExternalLink,
  Check,
  ArrowRight
} from 'lucide-react';
import ReviewSection from '../components/ReviewSection';
import CollectionModal from '../components/CollectionModal';

const ToolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedTools, setRelatedTools] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const historyAddedRef = useRef(false);

  // Fetch tool data — only re-runs when ID changes
  useEffect(() => {
    historyAddedRef.current = false; // reset on tool change
    const fetchToolDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/tools/${id}`);
        setTool(data);

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

  // Update favourite status when user loads
  useEffect(() => {
    if (user && user.favourites) {
      const favIds = user.favourites.filter(f => f).map(f => f._id || f);
      setIsFavourite(favIds.includes(id));
    }
  }, [user, id]);

  // Add to history ONCE per tool visit
  useEffect(() => {
    if (user && id && !historyAddedRef.current) {
      historyAddedRef.current = true;
      api.post('/api/users/history', { toolId: id }).catch(err => console.error('History error:', err));
    }
  }, [user, id]);

  const toggleFavourite = async () => {
    if (!user) {
      alert('Please login to save favorites!');
      return;
    }
    try {
      const { data } = await api.post('/api/users/favourites', { toolId: id });
      // Update global context - the useEffect will handle local setIsFavourite
      updateUser({ favourites: data.favourites });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-in fade-in duration-700">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-blue-500 transition-colors group"
      >
        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Directory
      </button>

      {/* Hero Section */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 lg:p-12 mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10 rounded-full"></div>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start text-center lg:text-left">
          <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-3xl bg-white border border-border flex items-center justify-center p-4 shadow-xl shrink-0">
            <img 
              src={tool.link ? `https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128` : ''} 
              alt={tool.name} 
              className="w-full h-full object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4 justify-center lg:justify-start">
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight">{tool.name}</h1>
              <div className="flex items-center gap-2 justify-center">
                <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">
                  {tool.category}
                </span>
                <span className={`px-4 py-1.5 text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-full border ${
                  tool.pricing === 'Free' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {tool.pricing}
                </span>
              </div>
            </div>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl font-medium leading-relaxed">
              {tool.tagline}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a 
                href={tool.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
              >
                Visit Website <ExternalLink className="w-5 h-5" />
              </a>
              <button 
                onClick={toggleFavourite}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isFavourite 
                    ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25' 
                    : 'bg-card text-muted-foreground border-border hover:border-red-500 hover:text-red-500'
                }`}
                title={isFavourite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`w-5 h-5 ${isFavourite ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                onClick={() => setIsCollectionModalOpen(true)}
                className="p-3.5 rounded-2xl bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
                title="Save to Collection"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 mt-12 pt-12 border-t border-border/50">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-500 mb-1">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-xl font-black text-foreground">{tool.rating}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rating</p>
          </div>
          <div className="text-center lg:text-left border-l border-border/50 pl-2 lg:pl-8">
             <div className="text-xl font-black mb-1">{tool.numReviews || 0}</div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reviews</p>
          </div>
          <div className="text-center lg:text-left border-l border-border/50 pl-2 lg:pl-8">
             <div className="text-xl font-black mb-1 flex items-center justify-center lg:justify-start gap-1">
               <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
               {tool.modelInfo?.credits || 'Varies'}
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Access</p>
          </div>
          <div className="text-center lg:text-left border-l border-border/50 pl-2 lg:pl-8">
             <div className="text-xl font-black mb-1">Top Tier</div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Performance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Tool Details */}
        <div className="lg:col-span-2 space-y-12">
          {/* About Section */}
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

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-500/5 rounded-3xl p-8 border border-green-500/10">
              <h3 className="text-lg font-bold text-green-600 mb-6 flex items-center gap-2">
                <div className="h-2 w-8 bg-green-500 rounded-full"></div> Pros
              </h3>
              <ul className="space-y-4">
                {tool.pros?.map((pro, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0" /> {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/5 rounded-3xl p-8 border border-red-500/10">
              <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
                <div className="h-2 w-8 bg-red-500 rounded-full"></div> Cons
              </h3>
              <ul className="space-y-4">
                {tool.cons?.map((con, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border-2 border-red-500/30 shrink-0 mt-0.5" /> {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-12">
          {/* Related Tools */}
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-blue-500" /> Similar Tools
            </h3>
            <div className="space-y-6">
              {relatedTools.map(t => (
                <Link key={t._id} to={`/tools/${t._id}`} className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-white border border-border flex items-center justify-center p-2 group-hover:border-blue-500 transition-colors shrink-0">
                    <img src={`https://www.google.com/s2/favicons?domain=${new URL(t.link).hostname}&sz=64`} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate group-hover:text-blue-500 transition-colors">{t.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{t.pricing}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t border-border pt-20">
        <ReviewSection 
          toolId={id} 
          onReviewAdded={() => {
            // Re-fetch tool details to update the average rating and count
            api.get(`/api/tools/${id}`).then(({ data }) => setTool(data));
          }} 
        />
        <CollectionModal 
          isOpen={isCollectionModalOpen} 
          onClose={() => setIsCollectionModalOpen(false)}
          toolId={id}
          toolName={tool.name}
          toolLink={tool.link}
        />
      </div>
    </div>
  );
};

export default ToolDetails;
