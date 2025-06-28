
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, Star, Calendar, User } from 'lucide-react';
import { getVideos, getYouTubers, Video, YouTuber } from '@/services/dataService';

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
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
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
            <div key={i} className="youmdb-card overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-slate-700"></div>
              <div className="p-4">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
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
          Discover Amazing Videos
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Explore the best content from talented creators worldwide, watch videos, and share your thoughts
        </p>
      </div>

      {/* Videos Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => navigate(`/video/${video.id}`)}
            className="youmdb-card overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/480x360/1e293b/ffffff?text=Video';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 hover:text-youmdb-accent transition-colors">
                {video.title}
              </h3>

              {/* Creator */}
              <div className="flex items-center text-slate-400 text-sm mb-3">
                <User className="w-4 h-4 mr-1" />
                <span>{getYouTuberName(video.youtuberId)}</span>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                {video.description}
              </p>

              {/* Stats Row 1 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-slate-400 text-sm">
                  <Eye className="w-4 h-4 mr-1 text-youmdb-highlight" />
                  <span>{formatNumber(video.views)} views</span>
                </div>
                <div className="flex items-center text-slate-400 text-sm">
                  <Calendar className="w-4 h-4 mr-1 text-youmdb-accent" />
                  <span>{video.publishDate}</span>
                </div>
              </div>

              {/* Stats Row 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {renderStars(Math.round(video.averageRating))}
                  <span className="text-slate-400 text-sm">
                    {video.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-youmdb-success text-sm font-semibold">
                  Watch Now
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {videos.length === 0 && !loading && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No Videos Found</h3>
          <p className="text-slate-400">Check back later for amazing content!</p>
        </div>
      )}
    </div>
  );
}
