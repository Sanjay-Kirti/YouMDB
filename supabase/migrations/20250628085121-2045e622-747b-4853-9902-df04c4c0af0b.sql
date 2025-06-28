
-- Create profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'normal' CHECK (role IN ('guest', 'normal', 'creator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create YouTubers table
CREATE TABLE public.youtubers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  genre TEXT,
  country TEXT,
  state TEXT,
  profile_picture_url TEXT,
  subscriber_count BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  owner_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtuber_id UUID REFERENCES public.youtubers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  publish_date TIMESTAMP WITH TIME ZONE,
  views BIGINT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('youtuber', 'video')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  likes UUID[] DEFAULT '{}',
  dislikes UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtubers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- YouTubers policies (public read, owner write)
CREATE POLICY "Anyone can view youtubers" ON public.youtubers FOR SELECT USING (true);
CREATE POLICY "Creators can insert youtubers" ON public.youtubers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners can update their youtubers" ON public.youtubers FOR UPDATE USING (auth.uid() = owner_user_id);

-- Videos policies (public read, owner write)
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Creators can insert videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners can update their videos" ON public.videos 
FOR UPDATE USING (
  auth.uid() IN (
    SELECT owner_user_id FROM public.youtubers WHERE id = videos.youtuber_id
  )
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data
INSERT INTO public.youtubers (name, bio, genre, country, state, profile_picture_url, subscriber_count, total_views, average_rating)
VALUES 
  ('TechGuru', 'Technology reviews and tutorials', 'Technology', 'USA', 'California', 'https://placehold.co/150x150/7c3aed/ffffff?text=TG', 1200000, 50000000, 4.5),
  ('CookingMaster', 'Delicious recipes from around the world', 'Cooking', 'Italy', 'Tuscany', 'https://placehold.co/150x150/e11d48/ffffff?text=CM', 800000, 30000000, 4.8),
  ('GameStreamer', 'Live gaming streams and reviews', 'Gaming', 'Canada', 'Ontario', 'https://placehold.co/150x150/059669/ffffff?text=GS', 2500000, 120000000, 4.2),
  ('FitnessCoach', 'Health and fitness motivation', 'Fitness', 'Australia', 'New South Wales', 'https://placehold.co/150x150/dc2626/ffffff?text=FC', 950000, 25000000, 4.6),
  ('MusicProducer', 'Music production tutorials and beats', 'Music', 'UK', 'London', 'https://placehold.co/150x150/7c2d12/ffffff?text=MP', 1500000, 75000000, 4.4);

INSERT INTO public.videos (youtuber_id, title, description, thumbnail_url, video_url, publish_date, views, average_rating)
SELECT 
  y.id,
  CASE 
    WHEN y.name = 'TechGuru' THEN 'iPhone 15 Pro Review'
    WHEN y.name = 'CookingMaster' THEN 'Perfect Pasta Carbonara'
    WHEN y.name = 'GameStreamer' THEN 'Call of Duty Warzone Gameplay'
    WHEN y.name = 'FitnessCoach' THEN '30-Minute Full Body Workout'
    ELSE 'Lo-Fi Beats Tutorial'
  END,
  CASE 
    WHEN y.name = 'TechGuru' THEN 'In-depth review of Apple latest flagship phone'
    WHEN y.name = 'CookingMaster' THEN 'Traditional Italian recipe with modern twists'
    WHEN y.name = 'GameStreamer' THEN 'Epic wins and fails in battle royale'
    WHEN y.name = 'FitnessCoach' THEN 'No equipment needed home workout'
    ELSE 'Creating chill beats for studying'
  END,
  'https://placehold.co/400x225/374151/ffffff?text=Video',
  'https://youtube.com/watch?v=example',
  NOW() - INTERVAL '7 days',
  FLOOR(RANDOM() * 1000000 + 100000),
  ROUND((RANDOM() * 2 + 3)::numeric, 1)
FROM public.youtubers y;
