
import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getReviews, addReview, Review } from '@/services/supabaseService';
import { toast } from 'sonner';

interface ReviewSectionProps {
  entityId: string;
  entityType: 'youtuber' | 'video';
  entityName: string;
}

export function ReviewSection({ entityId, entityType, entityName }: ReviewSectionProps) {
  const { user, canInteract } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [entityId, entityType]);

  const fetchReviews = async () => {
    try {
      const data = await getReviews(entityId, entityType);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInteract || !user) {
      toast.error('Please sign in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      await addReview({
        entity_id: entityId,
        entity_type: entityType,
        user_id: user.id,
        rating,
        review_text: reviewText
      });
      
      toast.success('Review submitted successfully!');
      setRating(5);
      setReviewText('');
      setShowReviewForm(false);
      await fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeToggle = async (reviewId: string, isLike: boolean) => {
    if (!canInteract || !user) {
      toast.error('Please sign in to interact with reviews');
      return;
    }

    try {
      // This would need to be implemented in supabaseService
      // await toggleReviewLike(reviewId, user.id, isLike);
      await fetchReviews(); // Refresh to show updated counts
      toast.success(isLike ? 'Liked!' : 'Disliked!');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-youmdb-accent" />
          Reviews for {entityName}
        </h3>
        
        {canInteract && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="youmdb-button"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && canInteract && (
        <form onSubmit={handleSubmitReview} className="youmdb-card p-6">
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Rating
            </label>
            {renderStars(rating, true, setRating)}
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="youmdb-input w-full h-32 resize-none"
              placeholder="Share your thoughts about this creator/video..."
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting || !reviewText.trim()}
              className="youmdb-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Access Notice for Guests */}
      {!canInteract && (
        <div className="youmdb-card p-4 border border-youmdb-accent">
          <p className="text-center text-slate-300">
            <span className="text-youmdb-accent font-semibold">Sign in</span> to write reviews and interact with content
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="youmdb-card p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-slate-700 rounded-full mr-3"></div>
                <div className="h-4 bg-slate-700 rounded w-24"></div>
              </div>
              <div className="h-4 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="youmdb-card p-6">
              {/* Review Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-youmdb-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {review.user_id?.substring(0, 1).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="text-slate-300 text-sm">
                      {review.user_id?.substring(0, 8) || 'Anonymous'}...
                    </div>
                    <div className="text-slate-500 text-xs">
                      {formatTimestamp(review.created_at)}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating || 0)}
              </div>

              {/* Review Text */}
              <p className="text-slate-300 mb-4">{review.review_text}</p>

              {/* Like/Dislike Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLikeToggle(review.id, true)}
                  disabled={!canInteract}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                    canInteract
                      ? user && review.likes?.includes(user.id)
                        ? 'bg-youmdb-success text-white'
                        : 'text-slate-400 hover:text-youmdb-success hover:bg-slate-700'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => handleLikeToggle(review.id, false)}
                  disabled={!canInteract}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                    canInteract
                      ? user && review.dislikes?.includes(user.id)
                        ? 'bg-red-600 text-white'
                        : 'text-slate-400 hover:text-red-400 hover:bg-slate-700'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{review.dislikes?.length || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-slate-300 mb-2">No Reviews Yet</h4>
          <p className="text-slate-400">
            Be the first to share your thoughts about this {entityType}!
          </p>
        </div>
      )}
    </div>
  );
}
