import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getReviews, addReview, Review } from '@/services/supabaseService';
import { toast } from 'sonner';

interface ReviewSectionProps {
  entityId: string;
  entityType: 'youtuber' | 'video';
  entityName: string;
  starColor?: string;
}

export function ReviewSection({ entityId, entityType, entityName, starColor = '#141414' }: ReviewSectionProps) {
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
            style={{ color: star <= rating ? starColor : '#d1d5db' }}
            className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''}`}
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
        <h3 className="text-2xl font-bold text-[#141414] flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
          Reviews for {entityName}
        </h3>
        {canInteract && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Write Review
          </button>
        )}
      </div>
      {/* Review Form */}
      {showReviewForm && canInteract && (
        <form onSubmit={handleSubmitReview} className="bg-white rounded-xl p-6 shadow border border-neutral-200 mb-4">
          <div className="mb-4">
            <label className="block text-neutral-500 text-sm font-medium mb-2">
              Rating
            </label>
            {renderStars(rating, true, setRating)}
          </div>
          <div className="mb-4">
            <label className="block text-neutral-500 text-sm font-medium mb-2">
              Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full h-32 resize-none border border-neutral-200 rounded-lg p-2 text-[#141414] bg-neutral-50"
              placeholder="Share your thoughts about this creator/video..."
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting || !reviewText.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 border border-neutral-200 text-neutral-500 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {/* Access Notice for Guests */}
      {!canInteract && (
        <div className="bg-neutral-100 rounded-xl p-4 border border-blue-600 mb-4">
          <p className="text-center text-neutral-500">
            <span className="text-blue-600 font-semibold">Sign in</span> to write reviews and interact with content
          </p>
        </div>
      )}
      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-100 rounded-xl p-6 animate-pulse shadow">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-neutral-200 rounded-full mr-3"></div>
                <div className="h-4 bg-neutral-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-neutral-200 rounded mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow border border-neutral-200">
              {/* Review Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {((review as any).user_name || review.user_id || 'U').charAt(0)}
                  </div>
                  <span className="text-[#141414] font-semibold">{(review as any).user_name || (review.user_id ? review.user_id.substring(0, 8) : 'User')}</span>
                  <span className="text-neutral-400 text-xs">{formatTimestamp(review.created_at)}</span>
                </div>
                {renderStars(review.rating)}
              </div>
              <div className="text-neutral-500 mb-2">{review.review_text}</div>
              {/* Like/Dislike (future) */}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-400">No reviews yet. Be the first to write one!</div>
      )}
    </div>
  );
}
