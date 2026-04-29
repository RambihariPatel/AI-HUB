import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Rocket, Link as LinkIcon, Tag, Type, MessageSquare, Send, CheckCircle, ListChecks, PlusCircle, MinusCircle, ShieldCheck, AlertCircle } from 'lucide-react';

const SubmitTool = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    category: 'Writing',
    tagline: '',
    descriptionShort: '',
    descriptionLong: '',
    pricing: 'Free',
    features: '',
    pros: '',
    cons: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please agree to the submission terms first!');
      return;
    }
    setLoading(true);

    const formattedData = {
      ...formData,
      features: formData.features.split(',').map(item => item.trim()).filter(item => item !== ''),
      pros: formData.pros.split(',').map(item => item.trim()).filter(item => item !== ''),
      cons: formData.cons.split(',').map(item => item.trim()).filter(item => item !== ''),
    };

    try {
      await api.post('/api/tools/submit', formattedData);
      setSubmitted(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting tool');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-4xl font-black mb-4">Submission Successful!</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
          Thank you for following our guidelines. Your tool has been queued for manual review.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 flex items-center justify-center gap-3">
          <Rocket className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" /> 
          Submit Your AI Tool
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
          Share your innovation with the community. Please follow our quality guidelines to ensure quick approval.
        </p>
      </div>

      {/* Submission Guidelines Section */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-8 mb-10">
        <h3 className="text-amber-600 font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5" /> Submission Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">1</div>
            No duplicate tools. Check the directory before submitting.
          </div>
          <div className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">2</div>
            Provide a working website URL (HTTPS preferred).
          </div>
          <div className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">3</div>
            Use professional language. Avoid all-caps or spammy text.
          </div>
          <div className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">4</div>
            Accurately list pricing and key features.
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-6 lg:p-12 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section: Basic Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-blue-600 border-b border-border pb-2">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Type className="w-4 h-4" /> Tool Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. ChatGPT" className="w-full px-5 py-3.5 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Website URL</label>
                <input type="url" name="link" required value={formData.link} onChange={handleChange} placeholder="https://..." className="w-full px-5 py-3.5 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Tag className="w-4 h-4" /> Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-5 py-3.5 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold">
                  <option value="Writing">Text & Writing</option>
                  <option value="Image">Image & Design</option>
                  <option value="Video">Video & Animation</option>
                  <option value="Coding">Coding & Dev</option>
                  <option value="Audio">Audio & Music</option>
                  <option value="Marketing">Marketing & SEO</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Data">Data & Analysis</option>
                  <option value="Automation">Automation</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Rocket className="w-4 h-4" /> Pricing Model</label>
                <select name="pricing" value={formData.pricing} onChange={handleChange} className="w-full px-5 py-3.5 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold">
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Content & Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-blue-600 border-b border-border pb-2">2. Tool Description</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Tagline</label>
                <input type="text" name="tagline" required value={formData.tagline} onChange={handleChange} placeholder="A short, catchy one-liner..." className="w-full px-5 py-3.5 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Type className="w-4 h-4" /> Full Description</label>
                <textarea name="descriptionLong" required value={formData.descriptionLong} onChange={handleChange} placeholder="Detailed explanation..." className="w-full h-40 px-5 py-4 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Section: Deep Detailing */}
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-blue-600 border-b border-border pb-2">3. Deep Detailing</h3>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2"><ListChecks className="w-4 h-4" /> Key Features (Comma separated)</label>
                <textarea name="features" required value={formData.features} onChange={handleChange} placeholder="Feature 1, Feature 2..." className="w-full h-24 px-5 py-4 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-green-600 flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Pros (Comma separated)</label>
                  <textarea name="pros" required value={formData.pros} onChange={handleChange} placeholder="Pro 1, Pro 2..." className="w-full h-32 px-5 py-4 bg-green-500/5 border border-green-500/10 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-red-600 flex items-center gap-2"><MinusCircle className="w-4 h-4" /> Cons (Comma separated)</label>
                  <textarea name="cons" required value={formData.cons} onChange={handleChange} placeholder="Con 1, Con 2..." className="w-full h-32 px-5 py-4 bg-red-500/5 border border-red-500/10 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Agreement */}
          <div className="pt-6 border-t border-border">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-1 rounded border-border text-blue-600 focus:ring-blue-500/20"
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                I understand that my submission will undergo a manual review. I confirm that all information provided is accurate and does not violate the <span className="text-blue-600 font-bold">Community Guidelines</span>.
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Submitting...' : <><Send className="w-5 h-5" /> Submit for Approval</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitTool;
