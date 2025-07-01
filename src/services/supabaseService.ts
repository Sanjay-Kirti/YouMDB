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

// --- DUMMY DATA REMOVED ---
// All data fetching below uses real Supabase queries only.

export async function getYouTubers(): Promise<YouTuber[]> {
  const { data, error } = await supabase.from('youtubers').select('*');
  if (error) throw error;
  return data || [];
}

export async function getYouTuberById(id: string): Promise<YouTuber | null> {
  const { data, error } = await supabase.from('youtubers').select('*').eq('id', id).single();
  if (error) throw error;
  return data || null;
}

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabase.from('videos').select('*');
  if (error) throw error;
  return data || [];
}

export async function getVideosByYouTuberId(youtuberId: string): Promise<Video[]> {
  const { data, error } = await supabase.from('videos').select('*').eq('youtuber_id', youtuberId);
  if (error) throw error;
  return data || [];
}

export async function getVideoById(id: string): Promise<Video | null> {
  const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
  if (error) throw error;
  return data || null;
}

export async function getReviews(entityId: string, entityType: 'youtuber' | 'video'): Promise<Review[]> {
  const { data, error } = await supabase.from('reviews').select('*').eq('entity_id', entityId).eq('entity_type', entityType);
  if (error) throw error;
  return (data || []).map((review: any) => ({
    ...review,
    entity_type: review.entity_type as 'youtuber' | 'video',
  }));
}

export async function addReview(review: Omit<Review, 'id' | 'likes' | 'dislikes' | 'created_at' | 'updated_at'>): Promise<string | null> {
  const { data, error } = await supabase.from('reviews').insert(review).select('id').single();
  if (error) throw error;
  return data?.id || null;
}

export async function searchYouTubersByName(searchTerm: string): Promise<YouTuber[]> {
  const { data, error } = await supabase.from('youtubers').select('*').ilike('name', `%${searchTerm}%`);
  if (error) throw error;
  return data || [];
}

export async function getYouTubersByCountry(country: string): Promise<YouTuber[]> {
  const { data, error } = await supabase.from('youtubers').select('*').eq('country', country);
  if (error) throw error;
  return data || [];
}

export async function getYouTubersByCountryAndState(country: string, state: string): Promise<YouTuber[]> {
  const { data, error } = await supabase.from('youtubers').select('*').eq('country', country).eq('state', state);
  if (error) throw error;
  return data || [];
}

export async function getUniqueCountries(): Promise<string[]> {
  const { data, error } = await supabase.from('youtubers').select('country').neq('country', '').neq('country', null);
  if (error) throw error;
  const unique = Array.from(new Set((data || []).map((row: any) => row.country)));
  return unique;
}

export async function getUniqueStates(country: string): Promise<string[]> {
  const { data, error } = await supabase.from('youtubers').select('state').eq('country', country).neq('state', '').neq('state', null);
  if (error) throw error;
  const unique = Array.from(new Set((data || []).map((row: any) => row.state)));
  return unique;
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const { data, error } = await supabase.from('reviews').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((review: any) => ({
    ...review,
    entity_type: review.entity_type as 'youtuber' | 'video',
  }));
}

export async function getUserSuggestions(userId: string): Promise<any[]> {
  const { data, error } = await supabase.from('channel_suggestions').select('*').eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase.from('reviews').select('*');
  if (error) throw error;
  return (data || []).map((review: any) => ({
    ...review,
    entity_type: review.entity_type as 'youtuber' | 'video',
  }));
}
