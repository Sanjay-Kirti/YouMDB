
import { supabase } from '@/integrations/supabase/client';

// Type definitions
export interface YouTuber {
  id: string;
  name: string;
  bio?: string;
  genre?: string;
  country?: string;
  state?: string;
  profile_picture_url?: string;
  subscriber_count: number;
  total_views: number;
  average_rating: number;
  owner_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  youtuber_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  publish_date?: string;
  views: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  entity_id: string;
  entity_type: 'youtuber' | 'video';
  user_id: string;
  rating?: number;
  review_text?: string;
  likes: string[];
  dislikes: string[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'guest' | 'normal' | 'creator';
  created_at: string;
  updated_at: string;
}

// YouTuber operations
export async function getYouTubers(): Promise<YouTuber[]> {
  try {
    const { data, error } = await supabase
      .from('youtubers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching YouTubers:', error);
    return [];
  }
}

export async function getYouTuberById(id: string): Promise<YouTuber | null> {
  try {
    const { data, error } = await supabase
      .from('youtubers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching YouTuber:', error);
    return null;
  }
}

// Video operations
export async function getVideos(): Promise<Video[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

export async function getVideosByYouTuberId(youtuberId: string): Promise<Video[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('youtuber_id', youtuberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching videos by YouTuber:', error);
    return [];
  }
}

export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

// Review operations
export async function getReviews(entityId: string, entityType: 'youtuber' | 'video'): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Cast the entity_type to match our Review interface
    return (data || []).map(review => ({
      ...review,
      entity_type: review.entity_type as 'youtuber' | 'video'
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function addReview(review: Omit<Review, 'id' | 'likes' | 'dislikes' | 'created_at' | 'updated_at'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}

// Search operations
export async function searchYouTubersByName(searchTerm: string): Promise<YouTuber[]> {
  try {
    const { data, error } = await supabase
      .from('youtubers')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching YouTubers:', error);
    return [];
  }
}

export async function getYouTubersByCountry(country: string): Promise<YouTuber[]> {
  try {
    const { data, error } = await supabase
      .from('youtubers')
      .select('*')
      .eq('country', country)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching YouTubers by country:', error);
    return [];
  }
}

export async function getUniqueCountries(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('youtubers')
      .select('country')
      .not('country', 'is', null);

    if (error) throw error;
    
    const countries = [...new Set(data?.map(item => item.country).filter(Boolean))];
    return countries.sort();
  } catch (error) {
    console.error('Error getting unique countries:', error);
    return [];
  }
}
