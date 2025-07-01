import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Eye, 
  Star, 
  Calendar,
  User,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { 
  getVideoById, 
  getYouTuberById, 
  Video, 
  YouTuber 
} from '@/services/supabaseService';
import { generateVideoSummary } from '@/services/aiService';
import { ReviewSection } from '@/components/Reviews/ReviewSection';
import { toast } from 'sonner';

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [youtuber, setYoutuber] = useState<YouTuber | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideoData(id);
    }
  }, [id]);

  const fetchVideoData = async (videoId: string) => {
    try {
      const videoData = await getVideoById(videoId);
      setVideo(videoData);
      
      if (videoData) {
        const youtuberData = await getYouTuberById(videoData.youtuber_id);
        setYoutuber(youtuberData);
        
        // Note: AI summary is not stored in Supabase, so we don't set it here
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      toast.error('Failed to load video data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!video) return;
    
    setGeneratingSummary(true);
    try {
      const summary = await generateVideoSummary({
        ...video,
        youtuberName: youtuber?.name
      });
      setAiSummary(summary);
      toast.success('AI summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate AI summary');
    } finally {
      setGeneratingSummary(false);
    }
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
            className={`w-5 h-5 ${
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
        <div className="bg-neutral-100 rounded-xl p-8 animate-pulse shadow">
          <div className="w-full h-64 bg-neutral-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-neutral-200 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-[#141414] mb-4">Video Not Found</h1>
        <button
          onClick={() => navigate('/videos')}
          className="bg-neutral-200 text-[#141414] px-4 py-2 rounded-lg mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Videos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/videos')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Videos
      </button>

      {/* Video Player Placeholder */}
      <div className="youmdb-card p-6 mb-8">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-96 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/800x400/1e293b/ffffff?text=Video+Player';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-20 h-20 text-white mb-4 mx-auto" />
              <p className="text-white text-lg mb-4">Video Player Placeholder</p>
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="youmdb-button inline-flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="youmdb-card p-6 mb-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">{video.title}</h1>

        {/* Creator Info */}
        {youtuber && (
          <div className="flex items-center mb-4">
            <img
              src={youtuber.profile_picture_url}
              alt={youtuber.name}
              className="w-12 h-12 rounded-full border-2 border-youmdb-accent mr-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/50x50/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`;
              }}
            />
            <div>
              <button
                onClick={() => navigate(`/youtuber/${youtuber.id}`)}
                className="text-youmdb-accent hover:text-youmdb-purple-light font-semibold transition-colors"
              >
                {youtuber.name}
              </button>
              <div className="text-slate-400 text-sm">
                {formatNumber(youtuber.subscriber_count)} subscribers
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center text-slate-300">
            <Eye className="w-5 h-5 mr-2 text-youmdb-highlight" />
            <span>{formatNumber(video.views)} views</span>
          </div>
          <div className="flex items-center text-slate-300">
            <Calendar className="w-5 h-5 mr-2 text-youmdb-accent" />
            <span>{video.publish_date}</span>
          </div>
          <div className="flex items-center space-x-2">
            {renderStars(Math.round(video.average_rating))}
            <span className="text-slate-300">
              {video.average_rating.toFixed(1)} rating
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
          <p className="text-slate-300 leading-relaxed">{video.description}</p>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="youmdb-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-youmdb-accent" />
            AI Video Summary
          </h2>
          <button
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
            className="youmdb-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingSummary ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>

        {generatingSummary && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-youmdb-accent"></div>
            <span className="ml-3 text-slate-300">AI is analyzing the video...</span>
          </div>
        )}

        {aiSummary && (
          <div className="bg-slate-800 rounded-lg p-4 border border-youmdb-accent">
            <p className="text-slate-300 leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {!aiSummary && !generatingSummary && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Click "Generate Summary" to get AI-powered analysis of this video</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="youmdb-card p-6">
        <ReviewSection 
          entityId={video.id} 
          entityType="video" 
          entityName={video.title}
        />
      </div>
    </div>
  );
}
