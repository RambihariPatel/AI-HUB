import React, { useState, useEffect } from 'react';
import { Check, X, Clock, ExternalLink, ShieldCheck, List, LayoutGrid, Trash2 } from 'lucide-react';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [view, setView] = useState('pending'); // 'pending' or 'all'

    const fetchTools = async () => {
        try {
            setLoading(true);
            const endpoint = view === 'pending' ? '/api/admin/pending' : '/api/admin/all-tools';
            const { data } = await api.get(endpoint);
            setTools(data);
        } catch (error) {
            console.error('Error fetching tools:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTools();
    }, [view]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/api/admin/approve/${id}`);
            setMessage({ type: 'success', text: 'Tool approved successfully!' });
            if (view === 'pending') {
                setTools(tools.filter(t => t._id !== id));
            } else {
                setTools(tools.map(t => t._id === id ? { ...t, status: 'approved' } : t));
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to approve tool.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tool? This action cannot be undone.')) return;
        try {
            await api.delete(`/api/admin/reject/${id}`);
            setMessage({ type: 'success', text: 'Tool deleted successfully.' });
            setTools(tools.filter(t => t._id !== id));
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete tool.' });
        }
    };

    const handleSeed = async () => {
        try {
            setLoading(true);
            const { data } = await api.post('/api/admin/seed');
            setMessage({ type: 'success', text: data.message });
            fetchTools();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to seed sample tools.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black">Admin Dashboard</h1>
                            <button 
                                onClick={handleSeed}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:scale-105 transition-all disabled:opacity-50"
                            >
                                <ShieldCheck size={14} /> Seed Data
                            </button>
                        </div>
                        <p className="text-muted-foreground">Control center for AI HUB directory</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Seed Button (Visible only in All Tools view or for new DBs) */}
                    <button 
                        onClick={handleSeed}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <ShieldCheck size={18} /> Seed Sample Tools
                    </button>

                    {/* View Toggles */}
                    <div className="flex p-1 bg-muted rounded-2xl border border-border">
                        <button 
                            onClick={() => setView('pending')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                view === 'pending' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Clock size={16} /> Pending
                        </button>
                        <button 
                            onClick={() => setView('all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                view === 'all' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <LayoutGrid size={16} /> All Tools
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
                            message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                        }`}
                    >
                        <span className="font-bold">{message.text}</span>
                        <button onClick={() => setMessage(null)}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : tools.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl border border-dashed border-border">
                        <Clock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-bold">No Tools Found</h3>
                        <p className="text-muted-foreground">List is empty.</p>
                    </div>
                ) : (
                    tools.map((tool) => (
                        <motion.div 
                            key={tool._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-6 rounded-3xl border border-border hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
                        >
                            <div className="h-16 w-16 bg-white rounded-2xl border flex items-center justify-center p-2 shrink-0 shadow-sm relative">
                                <img 
                                    src={`https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`} 
                                    alt="" 
                                    className="w-full h-full object-contain"
                                />
                                <div className={`absolute -top-2 -right-2 h-5 w-5 rounded-full border-2 border-white dark:border-zinc-900 ${
                                    tool.status === 'approved' ? 'bg-green-500' : 'bg-orange-500'
                                }`}></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold truncate">{tool.name}</h3>
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                        {tool.category}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2 italic">"{tool.tagline}"</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(tool.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        By: <span className="font-bold text-foreground">{tool.submittedBy?.name || 'Admin'}</span>
                                    </span>
                                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                        Link <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {tool.status === 'pending' && (
                                    <button 
                                        onClick={() => handleApprove(tool._id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all active:scale-95 text-sm"
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(tool._id)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all active:scale-95 text-sm"
                                >
                                    <Trash2 size={16} /> {tool.status === 'pending' ? 'Reject' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
