import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Menu, X, User, LogOut, LayoutDashboard, BrainCircuit, Sun, Moon, Package2, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      return stored ? stored : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [compareCount, setCompareCount] = useState(() => {
    try {
      const stored = localStorage.getItem('compareTools');
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  const [favoritesCount, setFavoritesCount] = useState(() => {
    try {
      const stored = localStorage.getItem('favoritesList');
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleCompareUpdate = () => {
      try {
        const stored = localStorage.getItem('compareTools');
        setCompareCount(stored ? JSON.parse(stored).length : 0);
      } catch {
        setCompareCount(0);
      }
    };
    
    const handleFavoritesUpdate = () => {
      try {
        const stored = localStorage.getItem('favoritesList');
        setFavoritesCount(stored ? JSON.parse(stored).length : 0);
      } catch {
        setFavoritesCount(0);
      }
    };

    window.addEventListener('compareUpdated', handleCompareUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('compareUpdated', handleCompareUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AI Tools Hub
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link to="/category/All" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Categories</Link>
            <Link to="/toolkits" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Package2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Toolkits</span>
            </Link>
            <Link to="/compare" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <span>Compare</span>
              {compareCount > 0 && (
                <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {compareCount}
                </span>
              )}
            </Link>
            
            {user && (
              <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                {favoritesCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            )}
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all border border-white/5 flex items-center justify-center cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <Link to="/submit-tool" className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400 hover:opacity-80 transition-opacity">Submit Tool</Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="p-2 text-slate-300 hover:text-indigo-400 transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-full border border-slate-700 hover:border-slate-500 transition-all">
                    <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    {user.isAdmin && (
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="btn-primary py-1.5 px-4 text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-300">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-white/5 px-4 pt-2 pb-6 space-y-4">
          <div className="flex flex-col space-y-4 pt-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-slate-300">Directory</Link>
            <Link to="/toolkits" onClick={() => setIsMenuOpen(false)} className="text-slate-300 flex items-center gap-2">
              <Package2 className="w-4 h-4 text-purple-400" />
              <span>Toolkits</span>
            </Link>
            <Link to="/compare" onClick={() => setIsMenuOpen(false)} className="text-slate-300 flex items-center justify-between">
              <span>Compare</span>
              {compareCount > 0 && (
                <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>
            
            {user && (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Favorites</span>
                </div>
                {favoritesCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            )}
            
            <button 
              onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
              className="flex items-center justify-between text-slate-300 py-1 text-left w-full cursor-pointer"
            >
              <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <Link to="/submit-tool" onClick={() => setIsMenuOpen(false)} className="text-pink-400 font-bold">Submit Tool</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-slate-300">Dashboard</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-red-400 text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-slate-300">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
