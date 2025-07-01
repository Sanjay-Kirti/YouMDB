import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserReviews, getUserSuggestions, Review } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    Promise.all([
      getUserReviews(user.id),
      getUserSuggestions(user.id)
    ])
      .then(([reviews, suggestions]) => {
        setReviews(reviews);
        setSuggestions(suggestions);
      })
      .catch((err) => {
        setError('Failed to load profile data.');
        toast({ title: 'Error', description: 'Failed to load profile data.', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#141414]">My Profile</h2>
      <div className="bg-white rounded-xl shadow p-6 mb-8 max-w-xl mx-auto flex flex-col items-center">
        <img
          src={`https://placehold.co/100x100/7c3aed/ffffff?text=${user.email?.charAt(0) || 'U'}`}
          alt={user.email || 'User'}
          className="w-20 h-20 rounded-full border-4 border-neutral-200 object-cover mb-2"
        />
        <div className="text-xl font-bold text-[#141414]">{user.email}</div>
        <div className="text-neutral-500">User ID: {user.id}</div>
      </div>
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-[#141414]">My Reviews</h3>
        {loading ? (
          <div className="text-center py-8 text-neutral-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">No reviews yet.</div>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-neutral-100 rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-[#141414]">{review.entity_type === 'youtuber' ? 'YouTuber' : 'Video'}: {review.entity_id}</div>
                  <div className="text-neutral-500 text-sm">{review.review_text}</div>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <span className="font-bold mr-2">Rating:</span>
                  <span className="text-[#141414]">{review.rating || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <h3 className="text-2xl font-bold mb-4 text-[#141414]">My Channel Suggestions</h3>
        {loading ? (
          <div className="text-center py-8 text-neutral-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">No suggestions yet.</div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-neutral-100 rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-[#141414]">URL: {s.url}</div>
                  <div className="text-neutral-500 text-sm">Extra Info: {s.extra_info}</div>
                  <div className="text-neutral-500 text-sm">Notes: {s.notes}</div>
                </div>
                <div className="text-neutral-400 text-xs mt-2 md:mt-0">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 