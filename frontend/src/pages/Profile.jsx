import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Heart, Clock, Settings, ChevronRight, Star } from 'lucide-react';
import { UserProfile } from '@clerk/clerk-react';

const Profile = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 animate-in fade-in duration-500">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Sidebar / Mobile Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-[2rem] p-6 lg:p-8 lg:sticky lg:top-24 shadow-sm">
            <div className="flex lg:flex-col items-center gap-4 lg:gap-0 lg:text-center mb-6 lg:mb-8">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 lg:mx-auto lg:mb-4 overflow-hidden">
                {user?.imageUrl ? (
                   <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                   <User className="w-8 h-8 lg:w-12 lg:h-12" />
                )}
              </div>
              <div className="text-left lg:text-center min-w-0">
                <h2 className="text-xl lg:text-2xl font-black truncate">{user?.name}</h2>
                <p className="text-xs lg:text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar -mx-2 px-2 lg:mx-0 lg:px-0">
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 min-w-[120px] lg:w-full flex items-center justify-between p-3 lg:p-4 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'favorites' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-secondary/50 lg:bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
                  <span className="text-sm lg:text-base">Favorites</span>
                </div>
                <ChevronRight className="hidden lg:block w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 min-w-[120px] lg:w-full flex items-center justify-between p-3 lg:p-4 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-secondary/50 lg:bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base">History</span>
                </div>
                <ChevronRight className="hidden lg:block w-4 h-4" />
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 min-w-[120px] lg:w-full flex items-center justify-between p-3 lg:p-4 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-secondary/50 lg:bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base">Account</span>
                </div>
                <ChevronRight className="hidden lg:block w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'settings' ? (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <UserProfile routing="hash" />
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-4xl font-black mb-2 capitalize">{activeTab}</h1>
                <p className="text-muted-foreground">Manage your saved tools and browsing history.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                {activeTab === 'favorites' ? (
                  user?.favourites?.length > 0 ? (
                    user.favourites.map(tool => (
                      <div key={tool._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 rounded-xl bg-white border border-border flex items-center justify-center p-2 shrink-0">
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`} 
                              alt="" 
                              className="w-full h-full object-contain"
                            />
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
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 text-center py-24 bg-card border border-border border-dashed rounded-[3rem]">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold">No favorites yet</h3>
                      <Link to="/tools" className="text-blue-600 font-bold mt-4 inline-block">Explore tools</Link>
                    </div>
                  )
                ) : (
                  user?.history?.length > 0 ? (
                    user.history.map(tool => (
                      <div key={tool._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 rounded-xl bg-white border border-border flex items-center justify-center p-2 shrink-0">
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`} 
                              alt="" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate">{tool.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3 truncate">{tool.tagline}</p>
                            <Link to={`/tools/${tool._id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-500">
                              View Again
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 text-center py-24 bg-card border border-border border-dashed rounded-[3rem]">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold">No history yet</h3>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
