
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

// Type definitions
export interface YouTuber {
  id: string;
  name: string;
  bio: string;
  genre: string;
  country: string;
  state: string;
  profilePictureUrl: string;
  subscriberCount: number;
  totalViews: number;
  averageRating: number;
  createdAt: any;
}

export interface Video {
  id: string;
  youtuberId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishDate: string;
  views: number;
  averageRating: number;
  createdAt: any;
  aiSummary?: string;
}

export interface Review {
  id: string;
  entityId: string;
  entityType: 'youtuber' | 'video';
  userId: string;
  rating: number;
  reviewText: string;
  timestamp: any;
  likes: string[];
  dislikes: string[];
}

// Dummy data generation
const generateDummyYouTubers = (): Omit<YouTuber, 'id'>[] => [
  {
    name: "TechGuru Alex",
    bio: "Exploring the latest in technology and gadgets with in-depth reviews and tutorials",
    genre: "Technology",
    country: "USA",
    state: "California",
    profilePictureUrl: "https://placehold.co/300x300/7c3aed/ffffff?text=TG",
    subscriberCount: 2500000,
    totalViews: 45000000,
    averageRating: 4.7,
    createdAt: serverTimestamp()
  },
  {
    name: "Chef Maria's Kitchen",
    bio: "Authentic recipes from around the world, bringing families together through food",
    genre: "Cooking",
    country: "Italy",
    state: "Tuscany",
    profilePictureUrl: "https://placehold.co/300x300/06b6d4/ffffff?text=CM",
    subscriberCount: 1800000,
    totalViews: 32000000,
    averageRating: 4.9,
    createdAt: serverTimestamp()
  },
  {
    name: "Gaming Legend Mike",
    bio: "Professional gamer sharing epic gameplay, reviews, and gaming tips",
    genre: "Gaming",
    country: "Canada",
    state: "Ontario",
    profilePictureUrl: "https://placehold.co/300x300/10b981/ffffff?text=GL",
    subscriberCount: 3200000,
    totalViews: 67000000,
    averageRating: 4.6,
    createdAt: serverTimestamp()
  },
  {
    name: "Fitness Focus Sarah",
    bio: "Helping you achieve your fitness goals with effective workouts and nutrition advice",
    genre: "Fitness",
    country: "Australia",
    state: "New South Wales",
    profilePictureUrl: "https://placehold.co/300x300/a855f7/ffffff?text=FF",
    subscriberCount: 1500000,
    totalViews: 28000000,
    averageRating: 4.8,
    createdAt: serverTimestamp()
  },
  {
    name: "Travel Tales Tom",
    bio: "Discovering hidden gems and sharing travel adventures from around the globe",
    genre: "Travel",
    country: "India",
    state: "Maharashtra",
    profilePictureUrl: "https://placehold.co/300x300/f59e0b/ffffff?text=TT",
    subscriberCount: 950000,
    totalViews: 18500000,
    averageRating: 4.5,
    createdAt: serverTimestamp()
  }
];

const generateDummyVideos = (youtubers: YouTuber[]): Omit<Video, 'id'>[] => {
  const videos: Omit<Video, 'id'>[] = [];
  
  youtubers.forEach(youtuber => {
    // Generate 2 videos per YouTuber
    videos.push(
      {
        youtuberId: youtuber.id,
        title: `${youtuber.name} - Latest Tech Review`,
        description: "In-depth review of the newest technology trends and products",
        thumbnailUrl: "https://placehold.co/480x360/7c3aed/ffffff?text=Video",
        videoUrl: "https://youtube.com/watch?v=example",
        publishDate: "2024-01-15",
        views: Math.floor(Math.random() * 1000000),
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        createdAt: serverTimestamp()
      },
      {
        youtuberId: youtuber.id,
        title: `${youtuber.name} - Behind the Scenes`,
        description: "Get an exclusive look behind the scenes of content creation",
        thumbnailUrl: "https://placehold.co/480x360/06b6d4/ffffff?text=BTS",
        videoUrl: "https://youtube.com/watch?v=example2",
        publishDate: "2024-02-01",
        views: Math.floor(Math.random() * 800000),
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        createdAt: serverTimestamp()
      }
    );
  });
  
  return videos;
};

// Initialize dummy data if collections are empty
export async function initializeDummyData() {
  try {
    console.log('Checking for existing data...');
    
    // Check if YouTubers collection has data
    const youtubersSnapshot = await getDocs(collection(db, COLLECTIONS.YOUTUBERS));
    
    if (youtubersSnapshot.empty) {
      console.log('No YouTubers found, creating dummy data...');
      
      const batch = writeBatch(db);
      const dummyYouTubers = generateDummyYouTubers();
      const youtuberIds: string[] = [];
      
      // Add YouTubers
      for (const youtuber of dummyYouTubers) {
        const docRef = doc(collection(db, COLLECTIONS.YOUTUBERS));
        batch.set(docRef, youtuber);
        youtuberIds.push(docRef.id);
      }
      
      await batch.commit();
      console.log('Dummy YouTubers created successfully');
      
      // Create videos for the YouTubers
      const youtubersWithIds = dummyYouTubers.map((youtuber, index) => ({
        ...youtuber,
        id: youtuberIds[index]
      }));
      
      const dummyVideos = generateDummyVideos(youtubersWithIds);
      const videoBatch = writeBatch(db);
      
      for (const video of dummyVideos) {
        const docRef = doc(collection(db, COLLECTIONS.VIDEOS));
        videoBatch.set(docRef, video);
      }
      
      await videoBatch.commit();
      console.log('Dummy videos created successfully');
    } else {
      console.log('Data already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing dummy data:', error);
  }
}

// YouTuber operations
export async function getYouTubers(): Promise<YouTuber[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.YOUTUBERS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as YouTuber[];
  } catch (error) {
    console.error('Error fetching YouTubers:', error);
    return [];
  }
}

export async function getYouTuberById(id: string): Promise<YouTuber | null> {
  try {
    const docRef = doc(db, COLLECTIONS.YOUTUBERS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as YouTuber;
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTuber:', error);
    return null;
  }
}

// Video operations
export async function getVideos(): Promise<Video[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.VIDEOS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

export async function getVideosByYouTuberId(youtuberId: string): Promise<Video[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      where('youtuberId', '==', youtuberId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];
  } catch (error) {
    console.error('Error fetching videos by YouTuber:', error);
    return [];
  }
}

export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const docRef = doc(db, COLLECTIONS.VIDEOS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Video;
    }
    return null;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

// Review operations
export async function getReviews(entityId: string, entityType: 'youtuber' | 'video'): Promise<Review[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('entityId', '==', entityId),
      where('entityType', '==', entityType)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function addReview(review: Omit<Review, 'id' | 'timestamp' | 'likes' | 'dislikes'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
      ...review,
      timestamp: serverTimestamp(),
      likes: [],
      dislikes: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}

export async function toggleReviewLike(reviewId: string, userId: string, isLike: boolean): Promise<void> {
  try {
    const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) return;
    
    const reviewData = reviewDoc.data() as Review;
    const likes = reviewData.likes || [];
    const dislikes = reviewData.dislikes || [];
    
    let newLikes = [...likes];
    let newDislikes = [...dislikes];
    
    if (isLike) {
      // Toggle like
      if (likes.includes(userId)) {
        newLikes = likes.filter(id => id !== userId);
      } else {
        newLikes.push(userId);
        // Remove from dislikes if present
        newDislikes = dislikes.filter(id => id !== userId);
      }
    } else {
      // Toggle dislike
      if (dislikes.includes(userId)) {
        newDislikes = dislikes.filter(id => id !== userId);
      } else {
        newDislikes.push(userId);
        // Remove from likes if present
        newLikes = likes.filter(id => id !== userId);
      }
    }
    
    await updateDoc(reviewRef, {
      likes: newLikes,
      dislikes: newDislikes
    });
  } catch (error) {
    console.error('Error toggling review like:', error);
    throw error;
  }
}

// Search operations
export async function searchYouTubersByName(searchTerm: string): Promise<YouTuber[]> {
  try {
    // Since Firestore doesn't support case-insensitive queries,
    // we'll fetch all and filter in JavaScript
    const allYouTubers = await getYouTubers();
    return allYouTubers.filter(youtuber => 
      youtuber.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching YouTubers:', error);
    return [];
  }
}

export async function getYouTubersByCountry(country: string): Promise<YouTuber[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.YOUTUBERS),
      where('country', '==', country)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as YouTuber[];
  } catch (error) {
    console.error('Error fetching YouTubers by country:', error);
    return [];
  }
}

export async function getYouTubersByCountryAndState(country: string, state: string): Promise<YouTuber[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.YOUTUBERS),
      where('country', '==', country),
      where('state', '==', state)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as YouTuber[];
  } catch (error) {
    console.error('Error fetching YouTubers by country and state:', error);
    return [];
  }
}

// Get unique countries and states
export async function getUniqueCountries(): Promise<string[]> {
  try {
    const youtubers = await getYouTubers();
    const countries = [...new Set(youtubers.map(y => y.country))];
    return countries.sort();
  } catch (error) {
    console.error('Error getting unique countries:', error);
    return [];
  }
}

export async function getUniqueStates(country: string): Promise<string[]> {
  try {
    const youtubers = await getYouTubersByCountry(country);
    const states = [...new Set(youtubers.map(y => y.state).filter(Boolean))];
    return states.sort();
  } catch (error) {
    console.error('Error getting unique states:', error);
    return [];
  }
}
