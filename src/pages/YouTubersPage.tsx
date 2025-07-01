import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, Star, Eye } from 'lucide-react';
import { getYouTubers, YouTuber } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
// TODO: For production, move the API key to a secure serverless function or backend
const YOUTUBE_API_KEY = 'AIzaSyCiBKeOQ2mMUuU2ZXaZ0MWwwh5OHVHLlkw';

function extractChannelIdOrHandle(input) {
  let channelId = '';
  let handle = '';
  if (input.includes('youtube.com')) {
    if (input.includes('/channel/')) {
      channelId = input.split('/channel/')[1].split(/[/?]/)[0];
    } else if (input.includes('@')) {
      handle = input.split('youtube.com/')[1].split(/[/?]/)[0];
    }
  } else if (input.startsWith('@')) {
    handle = input;
  } else {
    channelId = input;
  }
  return { channelId, handle };
}

async function resolveHandleToChannelId(handle) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle.replace('@', '')}&key=${YOUTUBE_API_KEY}`);
  const json = await res.json();
  if (json.items && json.items.length > 0) {
    return json.items[0].id;
  }
  throw new Error('Could not resolve channel handle.');
}

async function fetchChannelInfo(channelId) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.items && json.items.length > 0) {
    const c = json.items[0];
    return {
      youtube_channel_id: channelId,
      name: c.snippet.title,
      bio: c.snippet.description,
      country: c.snippet.country || 'Unknown',
      profile_picture_url: c.snippet.thumbnails.default.url,
      subscriber_count: parseInt(c.statistics.subscriberCount, 10),
      total_views: parseInt(c.statistics.viewCount, 10),
      average_rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  throw new Error('Channel not found.');
}

function SuggestChannelModal({ open, onClose, onSubmit }) {
  const [url, setUrl] = useState('');
  const [extra, setExtra] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
        <button className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#141414]">Suggest a Channel/Streamer</h2>
        <form
          className="space-y-4"
          onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            await onSubmit({ url, extra, notes, setUrl, setExtra, setNotes, setSubmitting, onClose });
          }}
        >
          <label className="block">
            <span className="text-sm font-medium text-[#141414]">YouTube Channel URL or Handle</span>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              className="mt-1 w-full border border-neutral-200 rounded-lg p-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#141414]">Additional Info (socials, real name, topics)</span>
            <textarea
              value={extra}
              onChange={e => setExtra(e.target.value)}
              className="mt-1 w-full border border-neutral-200 rounded-lg p-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#141414]">Notes/Corrections</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mt-1 w-full border border-neutral-200 rounded-lg p-2"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 transition-colors mt-2"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function YouTubersPage() {
  const navigate = useNavigate();
  const [youtubers, setYouTubers] = useState<YouTuber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const { user } = useAuth();

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

  const handleSuggestSubmit = async ({ url, extra, notes, setUrl, setExtra, setNotes, setSubmitting, onClose }) => {
    // 1. Store the suggestion
    // Temporary workaround: cast supabase to any for channel_suggestions until types are regenerated
    const suggestion = {
      url,
      extra_info: extra,
      notes,
      // user_id: user?.id || null,
    };
    let insertResult;
    try {
      insertResult = await (supabase as any).from('channel_suggestions').insert([suggestion]);
      if (insertResult.error) {
        console.error('Error inserting suggestion:', insertResult.error);
        alert('Failed to submit suggestion: ' + insertResult.error.message);
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Exception during suggestion insert:', err);
      alert('Failed to submit suggestion: ' + err.message);
      setSubmitting(false);
      return;
    }

    // 2. Extract channel ID or handle
    let { channelId, handle } = extractChannelIdOrHandle(url);

    // 3. If handle, resolve to channel ID
    if (!channelId && handle) {
      try {
        channelId = await resolveHandleToChannelId(handle);
      } catch (err) {
        console.error('Error resolving handle to channel ID:', err);
        alert('Suggestion received! However, we could not automatically import this channel. Our team will review your suggestion.');
        setUrl(''); setExtra(''); setNotes('');
        onClose();
        setSubmitting(false);
        return;
      }
    }

    // 4. Fetch channel info and insert into youtubers
    try {
      const channelData = await fetchChannelInfo(channelId);
      channelData.youtube_channel_id = channelId;
      const { error } = await supabase.from('youtubers').upsert([channelData]);
      if (error) throw error;
      alert('Channel imported successfully!');
      setUrl(''); setExtra(''); setNotes('');
      onClose();
    } catch (err) {
      console.error('Error importing channel:', err);
      alert('Failed to import channel: ' + err.message);
    } finally {
      setSubmitting(false);
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-100 rounded-xl p-6 animate-pulse shadow">
              <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded mb-2"></div>
              <div className="h-3 bg-neutral-200 rounded mb-4"></div>
              <div className="h-3 bg-neutral-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#141414] mb-2">Discover Amazing YouTubers</h1>
          <p className="text-neutral-500 text-lg max-w-2xl">Explore talented creators from around the world, read reviews, and discover your next favorite channel</p>
        </div>
        <button
          className="bg-blue-600 text-white rounded-lg px-6 py-2 font-bold hover:bg-blue-700 transition-colors"
          onClick={() => setShowSuggestModal(true)}
        >
          Suggest a Channel
        </button>
      </div>
      <SuggestChannelModal
        open={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        onSubmit={handleSuggestSubmit}
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {youtubers.map((youtuber) => (
          <div
            key={youtuber.id}
            onClick={() => navigate(`/youtuber/${youtuber.id}`)}
            className="bg-white rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-neutral-200 shadow"
          >
            <div className="text-center mb-4">
              <img
                src={youtuber.profile_picture_url || `https://placehold.co/150x150/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`}
                alt={youtuber.name}
                className="w-24 h-24 rounded-full mx-auto border-4 border-neutral-200 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/150x150/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`;
                }}
              />
            </div>
            <h3 className="text-xl font-bold text-[#141414] text-center mb-2">
              {youtuber.name}
            </h3>
            {youtuber.genre && (
              <div className="text-center mb-3">
                <span className="bg-neutral-100 text-[#141414] px-3 py-1 rounded-full text-sm border border-neutral-200">
                  {youtuber.genre}
                </span>
              </div>
            )}
            {youtuber.bio && (
              <p className="text-neutral-500 text-sm text-center mb-4 line-clamp-2">
                {youtuber.bio}
              </p>
            )}
            {youtuber.country && (
              <div className="flex items-center justify-center text-neutral-400 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{youtuber.state ? `${youtuber.state}, ` : ''}{youtuber.country}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center text-neutral-400 mb-1">
                  <Users className="w-4 h-4 mr-1" />
                </div>
                <div className="text-[#141414] font-semibold text-sm">
                  {formatNumber(youtuber.subscriber_count)}
                </div>
                <div className="text-neutral-400 text-xs">Subscribers</div>
              </div>
              <div>
                <div className="flex items-center justify-center text-neutral-400 mb-1">
                  <Eye className="w-4 h-4 mr-1" />
                </div>
                <div className="text-[#141414] font-semibold text-sm">
                  {formatNumber(youtuber.total_views)}
                </div>
                <div className="text-neutral-400 text-xs">Total Views</div>
              </div>
              <div>
                <div className="flex items-center justify-center text-neutral-400 mb-1">
                  <Star className="w-4 h-4 mr-1" />
                </div>
                <div className="text-[#141414] font-semibold text-sm">
                  {youtuber.average_rating.toFixed(1)}
                </div>
                <div className="text-neutral-400 text-xs">Rating</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {youtubers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">No YouTubers Found</h3>
          <p className="text-neutral-400">Check back later for more amazing creators!</p>
        </div>
      )}
    </div>
  );
}
