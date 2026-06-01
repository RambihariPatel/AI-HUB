import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Rocket, Code, Tag, Link as LinkIcon, 
  AlignLeft, Type, DollarSign, CheckCircle2, ChevronLeft
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Writing', 'Coding', 'Image', 'Video', 'Audio', 
  'Data', 'Productivity', 'Marketing', 'Education', 
  'Automation', 'Design', 'Finance', 'Legal', 'HR', 'Cybersecurity'
];

const PRICING_OPTIONS = ['Free', 'Paid', 'Freemium'];

const SubmitTool = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    category: 'Productivity',
    link: '',
    descriptionShort: '',
    descriptionLong: '',
    pricing: 'Freemium',
    features: '',
    useCases: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Process comma-separated strings into arrays
      const processedData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        useCases: formData.useCases.split(',').map(u => u.trim()).filter(Boolean),
        // Add required default fields for schema
        pros: [],
        cons: [],
        modelInfo: {
          modelName: 'Unknown',
          modelType: 'Unknown',
          freeAvailable: formData.pricing !== 'Paid',
          apiAccess: false,
          credits: 'N/A'
        }
      };

      await axios.post('/api/tools/submit', processedData);
      
      toast.success('Tool submitted successfully! It is pending admin approval. 🚀', {
        duration: 5000
      });
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit tool. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-500 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-indigo-500/10 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-indigo-500/20"
          >
            <Rocket className="w-10 h-10 text-indigo-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Submit an AI Tool</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Help the community discover amazing AI products. Submit a tool to our database and grow the platform!
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-premium rounded-[2.5rem] p-8 md:p-12 border border-white/5"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tool Name */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <Type className="w-4 h-4 text-indigo-400" />
                  <span>Tool Name *</span>
                </label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. ChatGPT"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <AlignLeft className="w-4 h-4 text-pink-400" />
                  <span>Tagline *</span>
                </label>
                <input 
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Powerful conversational AI"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>Category *</span>
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span>Pricing Model *</span>
                </label>
                <select 
                  name="pricing"
                  value={formData.pricing}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all outline-none font-medium appearance-none"
                >
                  {PRICING_OPTIONS.map(price => (
                    <option key={price} value={price}>{price}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL Link */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                <span>Website URL *</span>
              </label>
              <input 
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
                placeholder="https://example.com"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Short Description *</label>
              <textarea 
                name="descriptionShort"
                value={formData.descriptionShort}
                onChange={handleChange}
                required
                placeholder="1-2 sentences explaining what the tool does..."
                className="w-full h-24 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium resize-none"
              />
            </div>

            {/* Long Description */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Detailed Description *</label>
              <textarea 
                name="descriptionLong"
                value={formData.descriptionLong}
                onChange={handleChange}
                required
                placeholder="A comprehensive overview of the tool, its benefits, and how it works..."
                className="w-full h-40 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Features */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>Key Features</span>
                </label>
                <input 
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium"
                />
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Comma separated</p>
              </div>

              {/* Use Cases */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Use Cases</span>
                </label>
                <input 
                  type="text"
                  name="useCases"
                  value={formData.useCases}
                  onChange={handleChange}
                  placeholder="Blogging, Marketing, Research"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                />
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Comma separated</p>
              </div>
            </div>

            <div className="pt-8 flex justify-end border-t border-white/5">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-12 py-4 bg-white text-slate-950 hover:bg-indigo-50 rounded-2xl font-black text-lg transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Tool</span>
                    <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default SubmitTool;
