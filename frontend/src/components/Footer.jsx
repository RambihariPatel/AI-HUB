import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Code, Share2, Mail, Heart, Sparkles, Globe, Shield, Check } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="relative mt-20 border-t border-border bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              AI Tools Hub
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs font-medium">
              Your ultimate directory to discover, compare, and master the world's most powerful AI tools. Supercharge your workflow today.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-secondary hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all"><Send className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-secondary hover:bg-slate-900/10 hover:text-foreground rounded-xl transition-all"><Code className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-secondary hover:bg-blue-600/10 hover:text-blue-600 rounded-xl transition-all"><Share2 className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/tools" className="text-muted-foreground hover:text-blue-500 text-sm font-medium transition-colors">Tool Directory</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-blue-500 text-sm font-medium transition-colors">Categories</Link></li>
              <li><Link to="/compare" className="text-muted-foreground hover:text-blue-500 text-sm font-medium transition-colors">Comparison Tool</Link></li>
              <li><Link to="/profile" className="text-muted-foreground hover:text-blue-500 text-sm font-medium transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal/Support */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Support</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
                <Shield className="w-4 h-4" /> Privacy Policy
              </li>
              <li className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
                <Globe className="w-4 h-4" /> Terms of Service
              </li>
              <li className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
                <Mail className="w-4 h-4" /> Contact Us
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Stay Updated</h4>
            <p className="text-muted-foreground text-sm font-medium">Join 5,000+ AI enthusiasts getting weekly updates.</p>
            <form onSubmit={handleSubscribe} className="relative group">
              <input 
                type="email" 
                required
                placeholder="Enter email..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button 
                type="submit"
                disabled={subscribed}
                className={`absolute right-2 top-2 bottom-2 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1 ${
                  subscribed ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {subscribed ? <><Check className="w-3 h-3" /> Joined</> : 'Join'}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} AI Tools Hub. Built for the future of productivity.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> by your AI team.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
