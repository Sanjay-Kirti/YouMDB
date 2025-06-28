
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Eye, 
  Star, 
  Sparkles,
  Play,
  Calendar 
} from 'lucide-react';
import { 
  getYouTuberById, 
  getVideosByYouTuberId, 
  YouTuber, 
  Video 
} from '@/services/dataService';
import { generateCreatorInsights } from '@/services/aiService';
import { InteractiveSphere } from '@/components/3D/InteractiveSphere';
import { ReviewSection } from '@/components/Reviews/ReviewSection';
import { toast } from 'sonner';

export default function YouTuberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [youtuber, setYoutuber] = useState<YouTuber | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    if (id) {
      fetchYouTuberData(id);
    }
  }, [id]);

  const fetchYouTuberData = async (youtuberId: string) => {
    try {
      const [youtuberData, videosData] = await Promise.all([
        getYouTuberById(youtuberId),
        getVideosByYouTuberId(youtuberId)
      ]);
      
      setYoutuber(youtuberData);
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching YouTuber data:', error);
      toast.error('Failed to load YouTuber data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!youtuber) return;
    
    setGeneratingInsights(true);
    try {
      const insights = await generateCreatorInsights(youtuber);
      setAiInsights(insights);
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setGeneratingInsights(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="youmdb-card p-8 animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-32 h-32 bg-slate-700 rounded-full mr-8"></div>
            <div className="flex-1">
              <div className="h-8 bg-slate-700 rounded mb-4 w-64"></div>
              <div className="h-4 bg-slate-700 rounded mb-2 w-48"></div>
              <div className="h-4 bg-slate-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!youtuber) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">YouTuber Not Found</h1>
        <button
          onClick={() => navigate('/youtubers')}
          className="youmdb-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to YouTubers
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/youtubers')}
        className="flex items-center text-youmdb-accent hover:text-youmdb-purple-light mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to YouTubers
      </button>

      {/* YouTuber Profile */}
      <div className="youmdb-card p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Profile Image */}
          <img
            src={youtuber.profilePictureUrl}
            alt={youtuber.name}
            className="w-32 h-32 rounded-full border-4 border-youmdb-accent object-cover mx-auto lg:mx-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/200x200/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`;
            }}
          />

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">{youtuber.name}</h1>
            <div className="flex items-center justify-center lg:justify-start text-slate-400 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{youtuber.state}, {youtuber.country}</span>
            </div>
            <p className="text-slate-300 text-lg mb-6 max-w-2xl">{youtuber.bio}</p>
            
            {/* Genre Badge */}
            <div className="mb-6">
              <span className="bg-youmdb-accent text-white px-4 py-2 rounded-full text-sm font-medium">
                {youtuber.genre}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="flex items-center justify-center text-youmdb-accent mb-2">
                  <Users className="w-6 h-6 mr-1" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(youtuber.subscriberCount)}
                </div>
                <div className="text-slate-400 text-sm">Subscribers</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center text-youmdb-highlight mb-2">
                  <Eye className="w-6 h-6 mr-1" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(youtuber.totalViews)}
                </div>
                <div className="text-slate-400 text-sm">Total Views</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center text-youmdb-success mb-2">
                  <Star className="w-6 h-6 mr-1" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {youtuber.averageRating.toFixed(1)}
                </div>
                <div className="text-slate-400 text-sm">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Interactive Element */}
      <div className="youmdb-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Interactive Experience</h2>
        <InteractiveSphere />
      </div>

      {/* AI Insights Section */}
      <div className="youmdb-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-youmdb-accent" />
            AI Creator Insights
          </h2>
          <button
            onClick={handleGenerateInsights}
            disabled={generatingInsights}
            className="youmdb-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingInsights ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>

        {generatingInsights && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-youmdb-accent"></div>
            <span className="ml-3 text-slate-300">AI is analyzing the creator...</span>
          </div>
        )}

        {aiInsights && (
          <div className="bg-slate-800 rounded-lg p-4 border border-youmdb-accent">
            <p className="text-slate-300 leading-relaxed">{aiInsights}</p>
          </div>
        )}

        {!aiInsights && !generatingInsights && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Click "Generate Insights" to get AI-powered analysis of this creator</p>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="youmdb-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Play className="w-6 h-6 mr-2 text-youmdb-accent" />
          Videos by {youtuber.name}
        </h2>

        {videos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => navigate(`/video/${video.id}`)}
                className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/480x360/1e293b/ffffff?text=Video';
                  }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {formatNumber(video.views)} views
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {video.publishDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Play className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No videos available for this creator yet.</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="youmdb-card p-6">
        <ReviewSection 
          entityId={youtuber.id} 
          entityType="youtuber" 
          entityName={youtuber.name}
        />
      </div>
    </div>
  );
}
