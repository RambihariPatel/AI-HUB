import { Link } from 'react-router-dom';
import { 
  PenTool, Code, Image as ImageIcon, Video, Music, 
  Zap, BarChart, GraduationCap, Layout, Database, 
  ArrowRight, Sparkles 
} from 'lucide-react';

const Categories = () => {
  const categories = [
    { name: 'Writing', icon: <PenTool className="w-8 h-8" />, color: 'from-blue-500 to-cyan-500', count: 10, desc: 'AI assistants for blogs, emails, and copywriting.' },
    { name: 'Coding', icon: <Code className="w-8 h-8" />, color: 'from-indigo-500 to-purple-500', count: 10, desc: 'Code completion, debugging, and AI-first editors.' },
    { name: 'Image', icon: <ImageIcon className="w-8 h-8" />, color: 'from-pink-500 to-rose-500', count: 10, desc: 'Generate art, edit photos, and design assets.' },
    { name: 'Video', icon: <Video className="w-8 h-8" />, color: 'from-orange-500 to-amber-500', count: 10, desc: 'Text-to-video, AI avatars, and video editing.' },
    { name: 'Audio', icon: <Music className="w-8 h-8" />, color: 'from-green-500 to-emerald-500', count: 10, desc: 'Voice cloning, music generation, and cleanup.' },
    { name: 'Automation', icon: <Zap className="w-8 h-8" />, color: 'from-yellow-500 to-orange-500', count: 10, desc: 'Workflow automation and AI browser agents.' },
    { name: 'Marketing', icon: <BarChart className="w-8 h-8" />, color: 'from-blue-600 to-indigo-600', count: 10, desc: 'SEO, ad generation, and social media planning.' },
    { name: 'Education', icon: <GraduationCap className="w-8 h-8" />, color: 'from-teal-500 to-green-500', count: 10, desc: 'AI tutors, homework help, and study tools.' },
    { name: 'Productivity', icon: <Layout className="w-8 h-8" />, color: 'from-violet-500 to-fuchsia-500', count: 10, desc: 'Meeting notes, search, and workspace AI.' },
    { name: 'Data', icon: <Database className="w-8 h-8" />, color: 'from-slate-600 to-slate-900', count: 10, desc: 'Predictive analytics and data visualization.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black mb-6">
          Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Category</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find the perfect AI tool for your specific needs by browsing through our specialized categories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, index) => (
          <Link 
            key={index} 
            to={`/tools?category=${cat.name}`}
            className="group relative bg-card border border-border rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}></div>
            
            <div className="flex items-start justify-between mb-8">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {cat.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</span>
                <span className="text-2xl font-black text-foreground">{cat.count} Tools</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
              {cat.name}
              <Sparkles className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8 h-12">
              {cat.desc}
            </p>

            <div className="flex items-center gap-2 text-blue-500 font-bold group-hover:gap-4 transition-all">
              Explore All <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-900 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-12 text-center">
          <div>
            <div className="text-5xl font-black mb-2">10+</div>
            <div className="text-blue-100 font-medium uppercase tracking-widest">Global Categories</div>
          </div>
          <div className="h-20 w-px bg-white/20 hidden md:block"></div>
          <div>
            <div className="text-5xl font-black mb-2">100+</div>
            <div className="text-blue-100 font-medium uppercase tracking-widest">Verified AI Tools</div>
          </div>
          <div className="h-20 w-px bg-white/20 hidden md:block"></div>
          <div>
            <div className="text-5xl font-black mb-2">80%</div>
            <div className="text-blue-100 font-medium uppercase tracking-widest">Free/Freemium Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
