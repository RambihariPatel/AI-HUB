import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Menu, Search, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Tools Hub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/tools" className="text-foreground hover:text-blue-600 transition-colors">Directory</Link>
            <Link to="/categories" className="text-foreground hover:text-blue-600 transition-colors">Categories</Link>
            <Link to="/compare" className="text-foreground hover:text-blue-600 transition-colors">Compare</Link>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted transition-colors font-bold text-sm">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  {user.name}
                </Link>
                <button onClick={logout} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/25">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-muted transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/tools" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted">Directory</Link>
            <Link to="/categories" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted">Categories</Link>
            <Link to="/compare" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted">Compare</Link>
            <div className="pt-4 border-t border-border flex justify-between items-center px-3">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <button onClick={logout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
