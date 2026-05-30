import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Twitter, Github, MessageSquare, Heart, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/5 relative overflow-hidden z-20">
      {/* Background soft glowing lights */}
      <div className="absolute -bottom-48 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AI Tools Hub
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover, analyze, and compare the world's most powerful AI platforms. Reimagined for modern developers, creators, and professionals.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-blue-500/30 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                title="Discord"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a 
                href="mailto:contact@aitoolshub.com" 
                className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  AI Directory
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Compare Matrix
                </Link>
              </li>
              <li>
                <Link to="/toolkits" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Curated Toolkits
                </Link>
              </li>
              <li>
                <Link to="/submit-tool" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Submit a Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/category/Writing" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Writing
                </Link>
              </li>
              <li>
                <Link to="/category/Coding" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Coding
                </Link>
              </li>
              <li>
                <Link to="/category/Image" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Image Art
                </Link>
              </li>
              <li>
                <Link to="/category/Logo Maker" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Logo Maker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Mockup */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Newsletter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get the latest updates on trending AI tools delivered directly to your inbox.
            </p>
            <div className="relative pt-2">
              <input 
                type="email" 
                placeholder="Enter email address..." 
                className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-650"
              />
              <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-12" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span>© {currentYear} AI Tools Hub. All rights reserved.</span>
            <span className="h-3 w-px bg-white/5" />
            <span className="flex items-center gap-1">
              Built for creators with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </span>
          </p>
          <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
