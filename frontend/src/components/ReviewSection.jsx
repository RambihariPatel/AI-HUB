import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Star, MessageSquare, Send, User, Trash2 } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';

const ReviewSection = ({ toolId, onReviewAdded }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [toolId]);

  const fetchReviews = async () => {
    try {
      setFetching(true);
      const { data } = await api.get(`/api/reviews/${toolId}`);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/api/reviews/${id}`);
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      alert('Error deleting review');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await api.post('/api/reviews', { toolId, rating, comment });
      setComment('');
      setRating(5);
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Review Form */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" /> Share Your Experience
        </h3>

        <SignedIn>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground mr-2">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      (hoveredStar || rating) >= star 
                        ? 'fill-amber-500 text-amber-500' 
                        : 'text-muted-foreground/30'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here... How did this tool help you?"
                className="w-full h-32 p-4 bg-secondary/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {loading ? 'Posting...' : <><Send className="w-4 h-4" /> Post Review</>}
            </button>
          </form>
        </SignedIn>

        <SignedOut>
          <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground font-medium mb-4">You need to be logged in to leave a review.</p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                Sign In to Review
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          User Reviews <span className="text-sm font-medium text-muted-foreground">({reviews.length})</span>
        </h3>

        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white overflow-hidden shadow-md">
                      {rev.user?.imageUrl ? (
                        <img src={rev.user.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{rev.user?.name || 'Anonymous'}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} 
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-2 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Button for own reviews */}
                  {user && rev.user && (rev.user._id === user._id || rev.user === user._id) && (
                    <button 
                      onClick={() => handleDeleteReview(rev._id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete your review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border border-dashed rounded-[3rem]">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-muted-foreground">No reviews yet</h4>
            <p className="text-sm text-muted-foreground/60">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
