import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { User, Heart, Clock, Settings, ChevronRight, Star, Folder, Trash2, ExternalLink } from 'lucide-react';
import { UserProfile } from '@clerk/clerk-react';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('collections');
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localUser, setLocalUser] = useState(null);

  const getHostname = (link) => {
    try {
      if (!link) return '';
      const url = new URL(link);
      return url.hostname;
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    if (user) {
      setLocalUser(user);
      fetchCollections();
    }
  }, [user]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/collections');
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error.response?.status, error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await api.delete(`/api/collections/${id}`);
      setCollections(collections.filter(c => c._id !== id));
    } catch (error) {
      alert('Error deleting collection');
    }
  };

  const removeFromCollection = async (collectionId, toolId) => {
    try {
      await api.post('/api/collections/remove-tool', { collectionId, toolId });
      fetchCollections();
    } catch (error) {
      alert('Error removing tool');
    }
  };

  const removeFavorite = async (toolId) => {
    try {
      await api.post('/api/users/favourites', { toolId });
      setLocalUser(prev => ({
        ...prev,
        favourites: prev.favourites.filter(f => f._id !== toolId)
      }));
    } catch (error) {
      alert('Error removing favorite');
    }
  };

  const removeHistoryItem = async (toolId) => {
    console.log('Attempting to remove history item:', toolId);
    try {
      const res = await api.delete(`/api/users/history/item/${toolId}`);
      console.log('Server response:', res.data);
      setLocalUser(prev => ({
        ...prev,
        history: prev.history.filter(h => (h._id || h) !== toolId)
      }));
    } catch (error) {
      console.error('History removal failed:', error);
      alert('Error removing item');
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm('Clear all browsing history?')) return;
    try {
      await api.delete('/api/users/history/all');
      setLocalUser(prev => ({
        ...prev,
        history: []
      }));
    } catch (error) {
      alert('Error clearing history');
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 animate-in fade-in duration-500">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-[2.5rem] p-6 lg:p-8 lg:sticky lg:top-24 shadow-sm">
            <div className="flex lg:flex-col items-center gap-4 lg:gap-0 lg:text-center mb-6 lg:mb-8">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 lg:mx-auto lg:mb-4 overflow-hidden">
                {localUser?.imageUrl ? (
                   <img src={localUser.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                   <User className="w-8 h-8 lg:w-12 lg:h-12" />
                )}
              </div>
              <div className="text-left lg:text-center min-w-0">
                <h2 className="text-xl lg:text-2xl font-black truncate">{localUser?.name}</h2>
                <p className="text-xs lg:text-sm text-muted-foreground truncate">{localUser?.email}</p>
              </div>
            </div>

            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {[
                { id: 'collections', label: 'Collections', icon: Folder },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'history', label: 'History', icon: Clock },
                { id: 'settings', label: 'Account', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'hover:bg-secondary text-muted-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 min-w-0">
          <div className="space-y-8">
            <>
              {activeTab === 'collections' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                  {collections.length > 0 ? (
                    collections.map(col => (
                      <div key={col._id} className="bg-card border border-border rounded-3xl shadow-sm hover:shadow-lg hover:border-blue-500/30 transition-all group overflow-hidden">
                        
                        {/* Folder Header */}
                        <div className="p-6 pb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                                <Folder className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-black text-lg leading-tight">{col.name}</h3>
                                <p className="text-xs text-muted-foreground">{col.tools?.length || 0} tools saved</p>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteCollection(col._id)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              title="Delete folder"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Tools List */}
                          {col.tools?.length > 0 ? (
                            <div className="space-y-2">
                              {col.tools.slice(0, 5).map(tool => (
                                <div key={tool._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition-colors group/item">
                                  {/* Tool Logo */}
                                  <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                    <img
                                      src={getHostname(tool.link) ? `https://www.google.com/s2/favicons?domain=${getHostname(tool.link)}&sz=64` : ''}
                                      alt=""
                                      className="w-5 h-5 object-contain"
                                      onError={(e) => e.target.style.display='none'}
                                    />
                                  </div>
                                  {/* Tool Name */}
                                  <Link to={`/tools/${tool._id}`} className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate hover:text-blue-600 transition-colors">{tool.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                                  </Link>
                                  {/* Remove Button */}
                                  <button
                                    onClick={() => removeFromCollection(col._id, tool._id)}
                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
                                    title="Remove from folder"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              {col.tools.length > 5 && (
                                <p className="text-center text-xs font-bold text-muted-foreground pt-1">
                                  +{col.tools.length - 5} more tools
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="py-4 text-center">
                              <p className="text-sm text-muted-foreground">No tools yet. Add from any tool page!</p>
                            </div>
                          )}
                        </div>

                        {/* Footer: Tool Favicons Strip */}
                        {col.tools?.length > 0 && (
                          <div className="px-6 py-3 border-t border-border/50 bg-secondary/20 flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {col.tools.slice(0, 5).map((tool, i) => (
                                <div key={i} className="w-7 h-7 bg-white border-2 border-card rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                                  <img
                                    src={getHostname(tool.link) ? `https://www.google.com/s2/favicons?domain=${getHostname(tool.link)}&sz=64` : ''}
                                    alt=""
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => e.target.style.display='none'}
                                  />
                                </div>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">{col.tools.length} tools</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 text-center py-24 bg-card border border-border border-dashed rounded-[3rem]">
                      <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold">No folders yet</h3>
                      <p className="text-muted-foreground mt-2 text-sm">Go to any tool and click "Save to Folder"</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                  {localUser?.favourites?.filter(item => item).length > 0 ? (
                    localUser.favourites.filter(item => item).map(tool => (
                      <div key={tool._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 rounded-xl bg-white border border-border flex items-center justify-center p-2 shrink-0">
                            <img src={getHostname(tool.link) ? `https://www.google.com/s2/favicons?domain=${getHostname(tool.link)}&sz=128` : ''} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors">{tool.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3 truncate">{tool.tagline}</p>
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-foreground">{tool.rating}</span>
                               </div>
                               <Link to={`/tools/${tool._id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-500">
                                 View Details
                               </Link>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFavorite(tool._id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Remove from favorites"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 text-center py-24 bg-card border border-border border-dashed rounded-[3rem]">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold">No favorites yet</h3>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex justify-end">
                     {localUser?.history?.length > 0 && (
                       <button 
                        onClick={clearAllHistory}
                        className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 flex items-center gap-2 px-4 py-2 bg-red-500/5 rounded-xl border border-red-500/10 transition-all"
                       >
                        <Trash2 className="w-3 h-3" /> Clear All History
                       </button>
                     )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localUser?.history?.filter(item => item).length > 0 ? (
                      localUser.history.filter(item => item).map(tool => (
                        <div key={tool._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative flex items-center justify-between">
                          <div className="flex gap-4 flex-1 min-w-0">
                            <div className="h-16 w-16 rounded-xl bg-white border border-border flex items-center justify-center p-2 shrink-0">
                              <img src={getHostname(tool.link) ? `https://www.google.com/s2/favicons?domain=${getHostname(tool.link)}&sz=128` : ''} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg truncate">{tool.name}</h4>
                              <Link to={`/tools/${tool._id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-500">View Again</Link>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeHistoryItem(tool._id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="md:col-span-2 text-center py-24 bg-card border border-border border-dashed rounded-[3rem]">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No history yet</h3>
                      </div>
                    )}
                   </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-card border border-border rounded-[2.5rem] p-8 animate-in slide-in-from-right-4 duration-500">
                  <UserProfile routing="path" path="/profile" />
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
