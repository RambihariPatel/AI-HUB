import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetToken, setResetToken] = useState(''); // Dev mode to show token

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await api.post('/api/auth/forgotpassword', { email });
      setMessage({ type: 'success', text: 'Reset instructions have been generated!' });
      setResetToken(data.resetToken); // In real app, this goes to email
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] -z-10 rounded-full"></div>
      
      <div className="max-w-md w-full space-y-8 bg-card border border-border p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black mb-2">Forgot Password?</h2>
          <p className="text-muted-foreground text-sm">
            Enter your email and we'll help you recover your account.
          </p>
        </div>

        {message.text && (
          <div className={`${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'} p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}

        {!resetToken ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
              {!loading && <Send className="ml-2 w-4 h-4" />}
            </button>
          </form>
        ) : (
          <div className="mt-8 p-6 bg-secondary/50 rounded-2xl border border-dashed border-blue-500/50 text-center">
            <p className="text-sm font-medium mb-4">Reset link generated (Development Mode):</p>
            <Link 
              to={`/reset-password/${resetToken}`} 
              className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all mb-4"
            >
              Go to Reset Page
            </Link>
            <p className="text-[10px] text-muted-foreground">In production, this would be sent to your email.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/login" className="text-sm font-bold text-muted-foreground hover:text-blue-600 inline-flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
