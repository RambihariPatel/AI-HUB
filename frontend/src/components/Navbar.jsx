import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Menu, Rocket, Folder } from 'lucide-react';
import { useState } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton 
} from "@clerk/clerk-react";

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none">
              AI Tools Hub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="text-sm lg:text-base text-foreground hover:text-blue-600 transition-colors font-medium">Home</Link>
            <Link to="/tools" className="text-sm lg:text-base text-foreground hover:text-blue-600 transition-colors font-medium">Directory</Link>
            <Link to="/categories" className="text-sm lg:text-base text-foreground hover:text-blue-600 transition-colors font-medium">Categories</Link>
            <Link to="/compare" className="text-sm lg:text-base text-foreground hover:text-blue-600 transition-colors font-medium">Compare</Link>
            <Link to="/submit-tool" className="text-sm lg:text-base text-blue-600 hover:text-blue-700 transition-colors font-bold flex items-center gap-1">
              <Rocket className="w-4 h-4" /> Submit
            </Link>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border">
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
            </button>
            
            <div className="min-w-[120px] flex justify-end">
              <SignedOut>
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                  <SignInButton mode="modal">
                    <button className="px-3 py-1.5 text-xs lg:text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-all">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="px-4 py-1.5 text-xs lg:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/25">
                      Sign Up
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-4 animate-in fade-in duration-300">
                  <Link to="/profile" className="hidden lg:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                    <Folder className="w-4 h-4 text-blue-600" /> {user?.name || 'Profile'}
                  </Link>
                  <div className="h-4 w-[1px] bg-border hidden lg:block"></div>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8 lg:w-9 lg:h-9 rounded-xl",
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-muted transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl hover:bg-muted transition-colors border border-border">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/tools" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Directory</Link>
            <Link to="/categories" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Categories</Link>
            <Link to="/compare" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Compare</Link>
            <Link to="/submit-tool" className="block px-3 py-2 rounded-md text-base font-bold text-blue-600 hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Submit Tool 🚀</Link>
            <div className="pt-4 border-t border-border flex justify-between items-center px-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-between w-full">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600" /> My Profile
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
