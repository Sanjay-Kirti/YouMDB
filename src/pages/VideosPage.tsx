import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, Star, Calendar, User } from 'lucide-react';
import { getVideos, getYouTubers, Video, YouTuber } from '@/services/supabaseService';

export default function VideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [youtubers, setYoutubers] = useState<YouTuber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosData, youtubersData] = await Promise.all([
          getVideos(),
          getYouTubers()
        ]);
        setVideos(videosData);
        setYoutubers(youtubersData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getYouTuberName = (youtuberId: string) => {
    const youtuber = youtubers.find(y => y.id === youtuberId);
    return youtuber?.name || 'Unknown Creator';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-100 rounded-xl overflow-hidden animate-pulse shadow">
              <div className="w-full h-48 bg-neutral-200"></div>
              <div className="p-4">
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#141414] mb-4">
          Discover Amazing Videos
        </h1>
        <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
          Explore the best content from talented creators worldwide, watch videos, and share your thoughts
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => navigate(`/video/${video.id}`)}
            className="bg-white rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-neutral-200 shadow"
          >
            <div className="relative">
              <img
                src={video.thumbnail_url || 'https://placehold.co/480x360/1e293b/ffffff?text=Video'}
                alt={video.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/480x360/1e293b/ffffff?text=Video';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <Play className="w-12 h-12 text-neutral-700" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#141414] text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                {video.title}
              </h3>
              <div className="flex items-center text-neutral-400 text-sm mb-3">
                <User className="w-4 h-4 mr-1" />
                <span>{getYouTuberName(video.youtuber_id)}</span>
              </div>
              <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                {video.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-neutral-400 text-sm">
                  <Eye className="w-4 h-4 mr-1 text-neutral-400" />
                  <span>{formatNumber(video.views)} views</span>
                </div>
                <div className="flex items-center text-neutral-400 text-sm">
                  <Calendar className="w-4 h-4 mr-1 text-neutral-400" />
                  <span>{video.publish_date || 'Unknown date'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {renderStars(Math.round(video.average_rating))}
                  <span className="text-neutral-400 text-sm">
                    {video.average_rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-blue-600 text-sm font-semibold">
                  Watch Now
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {videos.length === 0 && !loading && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">No Videos Found</h3>
          <p className="text-neutral-400">Check back later for amazing content!</p>
        </div>
      )}
    </div>
  );
}
