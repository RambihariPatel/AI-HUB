import { useState, useEffect } from 'react';
import api from '../api/client';
import { X, FolderPlus, Folder, Plus, Check, Loader2 } from 'lucide-react';

const CollectionModal = ({ isOpen, onClose, toolId, toolName, toolLink }) => {
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [fetching, setFetching] = useState(false);

  const getHostname = (link) => {
    try { return new URL(link).hostname; } catch { return ''; }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      setSuccess(null);
      setShowCreate(false);
      setNewCollectionName('');
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setFetching(true);
    try {
      const { data } = await api.get('/api/collections');
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections', error);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/collections', { name: newCollectionName });
      setNewCollectionName('');
      setShowCreate(false);
      await fetchCollections();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating collection');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.post('/api/collections/add-tool', { collectionId, toolId });
      setSuccess(collectionId);
      await fetchCollections(); // Refresh to show updated count
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1200);
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding tool');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const favicon = getHostname(toolLink)
    ? `https://www.google.com/s2/favicons?domain=${getHostname(toolLink)}&sz=64`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in duration-300">
        
        {/* Header with Tool Info */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            {favicon ? (
              <img src={favicon} alt="" className="w-8 h-8 object-contain"
                onError={(e) => { e.target.style.display='none'; }} />
            ) : (
              <FolderPlus className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Save to Folder</p>
            <h2 className="text-white font-black text-lg truncate">{toolName}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Folders List */}
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
            {fetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : collections.length === 0 && !showCreate ? (
              <div className="text-center py-8">
                <Folder className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground font-medium text-sm">No folders yet. Create one!</p>
              </div>
            ) : (
              collections.map(col => {
                const isAdded = col.tools?.some(t => (t._id || t) === toolId);
                const isThisSuccess = success === col._id;
                return (
                  <button
                    key={col._id}
                    onClick={() => !isAdded && handleAddToCollection(col._id)}
                    disabled={loading || isAdded}
                    className={`w-full p-4 border rounded-2xl flex items-center justify-between group transition-all ${
                      isAdded
                        ? 'bg-green-500/10 border-green-500/30 cursor-default'
                        : 'bg-secondary/30 hover:bg-blue-500/10 border-border hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini tool logos in folder */}
                      <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center">
                        <Folder className={`w-5 h-5 ${isAdded ? 'text-green-500' : 'text-blue-500'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{col.name}</p>
                        <p className="text-xs text-muted-foreground">{col.tools?.length || 0} tools</p>
                      </div>
                    </div>

                    {isAdded ? (
                      <span className="flex items-center gap-1 text-xs font-black text-green-500">
                        <Check className="w-4 h-4" /> Added
                      </span>
                    ) : isThisSuccess ? (
                      <Check className="w-5 h-5 text-green-500 animate-in zoom-in" />
                    ) : (
                      <span className="text-xs font-black text-muted-foreground group-hover:text-blue-500 uppercase tracking-widest transition-colors">
                        Add →
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Create New Collection */}
          {showCreate ? (
            <form onSubmit={handleCreateCollection} className="animate-in slide-in-from-bottom-2 duration-200">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Work Tools, Design Tools..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold mb-3 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !newCollectionName.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Folder
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-muted transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3.5 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> New Folder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
