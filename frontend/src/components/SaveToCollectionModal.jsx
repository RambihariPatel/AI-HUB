import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Plus, Folder, Check, Loader2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SaveToCollectionModal = ({ isOpen, onClose, tool }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [isGeneralFavorited, setIsGeneralFavorited] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingFolder, setSubmittingFolder] = useState(false);

  useEffect(() => {
    if (!isOpen || !user || !tool) return;
    fetchCollectionsAndFavorites();
  }, [isOpen, user, tool]);

  const fetchCollectionsAndFavorites = async () => {
    try {
      setLoading(true);
      // Fetch collections
      const { data: cols } = await axios.get('/api/collections', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCollections(cols);

      // Fetch general favorites list directly from backend
      const { data: favs } = await axios.get('/api/users/favorites', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const isFav = favs.some(t => (t._id || t) === tool._id);
      setIsGeneralFavorited(isFav);

      // Update the merged favoritesList in localStorage
      const favIds = favs.map(t => t._id || t);
      const colIds = cols.flatMap(c => c.tools.map(t => t._id || t));
      const allSavedIds = Array.from(new Set([...favIds, ...colIds]));
      localStorage.setItem('favoritesList', JSON.stringify(allSavedIds));
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('Error loading collections data:', error);
      toast.error('Failed to load collections.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGeneralFavorite = async () => {
    try {
      const { data } = await axios.post('/api/users/favorites', 
        { toolId: tool._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const isFav = data.favorites.some(id => id?.toString() === tool._id);
      setIsGeneralFavorited(isFav);

      // Update favoritesList in localStorage with the merged list
      const favIds = data.favorites.map(id => id?.toString()).filter(Boolean);
      const colIds = collections.flatMap(c => c.tools.map(t => t._id || t));
      const allSavedIds = Array.from(new Set([...favIds, ...colIds]));
      localStorage.setItem('favoritesList', JSON.stringify(allSavedIds));
      window.dispatchEvent(new Event('favoritesUpdated'));
      
      if (isFav) {
        toast.success('Saved to General Favorites! ❤️');
      } else {
        toast.success('Removed from General Favorites.');
      }
    } catch (error) {
      toast.error('Failed to update favorites.');
    }
  };

  const handleToggleFolder = async (collection) => {
    const isAlreadyInFolder = collection.tools.some(t => (t._id || t) === tool._id);

    try {
      if (isAlreadyInFolder) {
        // Remove from folder
        await axios.delete(`/api/collections/${collection._id}/tools/${tool._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success(`Removed from folder "${collection.name}".`);
      } else {
        // Add to folder
        await axios.post(`/api/collections/${collection._id}/tools`, 
          { toolId: tool._id },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        toast.success(`Saved to folder "${collection.name}"! 📂`);
      }
      
      // Refresh list and sync localStorage
      await fetchCollectionsAndFavorites();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update collection.');
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setSubmittingFolder(true);
      // 1. Create collection
      const { data: newCol } = await axios.post('/api/collections', 
        { name: newFolderName.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // 2. Add current tool to it
      await axios.post(`/api/collections/${newCol._id}/tools`, 
        { toolId: tool._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success(`Folder "${newCol.name}" created and tool added! 📂`);
      setNewFolderName('');
      
      // Refresh list and sync localStorage
      await fetchCollectionsAndFavorites();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create folder.');
    } finally {
      setSubmittingFolder(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.25rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-10 overflow-hidden text-left glass-card-premium"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-black text-white leading-tight">Save to Folder</h3>
              <p className="text-slate-500 text-xs mt-1">Organize <span className="text-indigo-400 font-bold">{tool?.name}</span> inside collections.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing folders...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folder list */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                {/* General Favorites checkbox */}
                <button
                  onClick={handleToggleGeneralFavorite}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 border border-white/5 hover:bg-slate-950/80 rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Heart className={`w-4 h-4 ${isGeneralFavorited ? 'fill-rose-500' : ''}`} />
                    </div>
                    <span className="font-bold text-sm">General Favorites</span>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    isGeneralFavorited 
                      ? 'bg-rose-500 border-rose-500 text-white' 
                      : 'border-white/10 group-hover:border-slate-500'
                  }`}>
                    {isGeneralFavorited && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Custom Folders */}
                {collections.map(col => {
                  const isChecked = col.tools.some(t => (t._id || t) === tool._id);
                  return (
                    <button
                      key={col._id}
                      onClick={() => handleToggleFolder(col)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 border border-white/5 hover:bg-slate-950/80 rounded-2xl transition-all group text-left"
                    >
                      <div className="flex items-center space-x-3 text-white">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Folder className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{col.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{col.tools.length} item{col.tools.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'border-white/10 group-hover:border-slate-500'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Create new collection form */}
              <form onSubmit={handleCreateFolder} className="pt-4 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder="Create new folder (e.g. Design)..."
                  className="flex-1 h-12 bg-slate-950 border border-white/5 rounded-xl px-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition-all"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  disabled={submittingFolder}
                />
                <button
                  type="submit"
                  disabled={submittingFolder || !newFolderName.trim()}
                  className="w-12 h-12 rounded-xl bg-white hover:bg-indigo-50 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-lg font-bold"
                  title="Create folder and save"
                >
                  {submittingFolder ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-950 stroke-[3]" />
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default SaveToCollectionModal;
