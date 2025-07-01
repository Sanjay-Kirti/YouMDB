import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Replace with your Supabase project URL and anon key
const supabase = createClient('https://ggiqpulqdmoazuievppt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaXFwdWxxZG1vYXp1aWV2cHB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA5OTg3MiwiZXhwIjoyMDY2Njc1ODcyfQ.0B7j-CHGvB02-n6lCkIBUh9NLmsyG1Lunm4EX2_jVpE');

// Replace with your YouTube API key
const YOUTUBE_API_KEY = 'AIzaSyCiBKeOQ2mMUuU2ZXaZ0MWwwh5OHVHLlkw';

// List of channel IDs to import
const channelIds = [
  'UC_x5XG1OV2P6uZZ5FSM9Ttw',
  'UC-lHJZR3Gqxm24_Vd_AJ5Yw', 
  'UCWsDFcIhY2DBi3GB5uykGXA', 
  // Add more channel IDs here
];

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
      average_rating: 0, // You can update this later
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return null;
}

async function importChannels() {
  for (const channelId of channelIds) {
    const info = await fetchChannelInfo(channelId);
    if (info) {
      const { error } = await supabase.from('youtubers').upsert(info, { onConflict: ['youtube_channel_id'] });
      if (error) {
        console.error(`Failed to insert ${info.name}:`, error.message);
      } else {
        console.log(`Inserted/updated: ${info.name}`);
      }
    }
  }
}

importChannels();