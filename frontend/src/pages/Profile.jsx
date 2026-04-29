import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { User, Heart, Clock, Settings, LogOut, ChevronRight, Star, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites');
  
  // Form States
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/api/users/profile', { name });
      login({ ...user, name: data.name }); 
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new) {
      setMessage({ type: 'error', text: 'Please fill all password fields' });
      return;
    }
    setLoading(true);
    try {
      await api.put('/api/users/change-password', 
        { currentPassword: passwords.current, newPassword: passwords.new }
      );
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current: '', new: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Password change failed' });
    }
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/api/users/profile');
      logout();
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-500">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-3xl p-8 sticky top-24 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${
                  activeTab === 'favorites' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
                  Favorites
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${
                  activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  History
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${
                  activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Settings
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="pt-8 mt-8 border-t border-border">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black mb-2 capitalize">{activeTab}</h1>
              <p className="text-muted-foreground">Manage your {activeTab === 'settings' ? 'account preferences' : 'saved tools and history'}.</p>
            </div>
            {message.text && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
                message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
          </div>

          {activeTab === 'settings' ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              {/* Profile Settings */}
              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>

              {/* Security Settings */}
              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" /> Security & Password
                </h3>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="mt-8 px-8 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2">
                  <LogOut className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-sm text-red-500/70 mb-6">Permanently delete your account and all your data. This action cannot be undone.</p>
                <div className="flex flex-wrap gap-4">
                  {!showDeleteConfirm ? (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={handleDeleteAccount}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 animate-pulse"
                      >
                        Confirm Delete
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-6 py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empty States */}
              <div className="md:col-span-2 text-center py-24 bg-card border border-border border-dashed rounded-[3rem]">
                <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  {activeTab === 'favorites' ? <Heart className="w-10 h-10 text-muted-foreground" /> : <Clock className="w-10 h-10 text-muted-foreground" />}
                </div>
                <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
                <p className="text-muted-foreground mb-8">Start exploring tools and add them to your {activeTab}.</p>
                <Link to="/tools" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  Explore Directory
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
