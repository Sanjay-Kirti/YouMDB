
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, Star, Eye } from 'lucide-react';
import { getYouTubers, YouTuber } from '@/services/dataService';

export default function YouTubersPage() {
  const navigate = useNavigate();
  const [youtubers, setYouTubers] = useState<YouTuber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYouTubers = async () => {
      try {
        const data = await getYouTubers();
        setYouTubers(data);
      } catch (error) {
        console.error('Error fetching YouTubers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubers();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="youmdb-card p-6 animate-pulse">
              <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-700 rounded mb-4"></div>
              <div className="h-3 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Discover Amazing YouTubers
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Explore talented creators from around the world, read reviews, and discover your next favorite channel
        </p>
      </div>

      {/* YouTubers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {youtubers.map((youtuber) => (
          <div
            key={youtuber.id}
            onClick={() => navigate(`/youtuber/${youtuber.id}`)}
            className="youmdb-card p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            {/* Profile Picture */}
            <div className="text-center mb-4">
              <img
                src={youtuber.profilePictureUrl}
                alt={youtuber.name}
                className="w-24 h-24 rounded-full mx-auto border-4 border-youmdb-accent object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/150x150/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`;
                }}
              />
            </div>

            {/* Name and Genre */}
            <h3 className="text-xl font-bold text-white text-center mb-2">
              {youtuber.name}
            </h3>
            <div className="text-center mb-3">
              <span className="bg-youmdb-accent text-white px-3 py-1 rounded-full text-sm">
                {youtuber.genre}
              </span>
            </div>

            {/* Bio */}
            <p className="text-slate-300 text-sm text-center mb-4 line-clamp-2">
              {youtuber.bio}
            </p>

            {/* Location */}
            <div className="flex items-center justify-center text-slate-400 text-sm mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{youtuber.state}, {youtuber.country}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center text-youmdb-accent mb-1">
                  <Users className="w-4 h-4 mr-1" />
                </div>
                <div className="text-white font-semibold text-sm">
                  {formatNumber(youtuber.subscriberCount)}
                </div>
                <div className="text-slate-400 text-xs">Subscribers</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center text-youmdb-highlight mb-1">
                  <Eye className="w-4 h-4 mr-1" />
                </div>
                <div className="text-white font-semibold text-sm">
                  {formatNumber(youtuber.totalViews)}
                </div>
                <div className="text-slate-400 text-xs">Total Views</div>
              </div>

              <div>
                <div className="flex items-center justify-center text-youmdb-success mb-1">
                  <Star className="w-4 h-4 mr-1" />
                </div>
                <div className="text-white font-semibold text-sm">
                  {youtuber.averageRating.toFixed(1)}
                </div>
                <div className="text-slate-400 text-xs">Rating</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {youtubers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No YouTubers Found</h3>
          <p className="text-slate-400">Check back later for more amazing creators!</p>
        </div>
      )}
    </div>
  );
}
