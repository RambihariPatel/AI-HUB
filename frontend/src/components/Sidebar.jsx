import React from 'react';
import { 
  PenTool, Code, Image as ImageIcon, Video, Music, 
  Database, Zap, BarChart3, GraduationCap, Bot,
  Palette, DollarSign, Scale, Users, ShieldCheck
} from 'lucide-react';

const categories = [
  { name: 'All', icon: null },
  { name: 'Writing', icon: <PenTool className="w-4 h-4" /> },
  { name: 'Coding', icon: <Code className="w-4 h-4" /> },
  { name: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
  { name: 'Video', icon: <Video className="w-4 h-4" /> },
  { name: 'Audio', icon: <Music className="w-4 h-4" /> },
  { name: 'Data', icon: <Database className="w-4 h-4" /> },
  { name: 'Productivity', icon: <Zap className="w-4 h-4" /> },
  { name: 'Marketing', icon: <BarChart3 className="w-4 h-4" /> },
  { name: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { name: 'Automation', icon: <Bot className="w-4 h-4" /> },
  { name: 'Design', icon: <Palette className="w-4 h-4" /> },
  { name: 'Finance', icon: <DollarSign className="w-4 h-4" /> },
  { name: 'Legal', icon: <Scale className="w-4 h-4" /> },
  { name: 'HR', icon: <Users className="w-4 h-4" /> },
  { name: 'Cybersecurity', icon: <ShieldCheck className="w-4 h-4" /> },
];

const Sidebar = ({ activeCategory, onCategoryChange }) => {
  return (
    <aside className="lg:w-64 pr-0 lg:pr-8 lg:sticky lg:top-24 self-start">
      {/* Mobile Horizontal Scroll */}
      <div className="lg:hidden flex overflow-x-auto pb-4 gap-2 no-scrollbar scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategoryChange(cat.name)}
            className={`whitespace-nowrap flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
              activeCategory === cat.name
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 bg-slate-900 border-white/5 hover:text-white'
            }`}
          >
            {cat.icon && React.cloneElement(cat.icon, { className: 'w-3.5 h-3.5' })}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Desktop Vertical List */}
      <div className="hidden lg:block">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Categories</h2>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat.name
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 bg-transparent border-transparent hover:bg-slate-900 hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-12 p-4 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20">
          <h3 className="text-sm font-bold text-indigo-300 mb-2">Want to list your tool?</h3>
          <p className="text-xs text-slate-400 mb-4">Reach thousands of developers and AI enthusiasts.</p>
          <button className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg transition-all">
            Submit Tool
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
