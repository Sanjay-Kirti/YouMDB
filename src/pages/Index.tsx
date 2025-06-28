
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Play, Star, Users, Video } from 'lucide-react';
import { HomeScene } from '@/components/3D/HomeScene';
import { initializeDummyData } from '@/services/dataService';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize dummy data on app load
    initializeDummyData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 youmdb-text-gradient">
            Welcome to YouMDB
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The ultimate platform for discovering, rating, and reviewing your favorite YouTubers and streamers from around the world
          </p>
          
          {/* 3D Scene */}
          <div className="mb-12">
            <HomeScene />
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/youtubers')}
            className="youmdb-button text-lg px-8 py-4 animate-pulse-glow"
          >
            <Play className="w-6 h-6 mr-2" />
            Explore Creators
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="youmdb-card p-8 text-center transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-youmdb-accent to-youmdb-purple-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Discover Creators</h3>
            <p className="text-slate-300">
              Explore thousands of talented YouTubers and streamers across different genres and countries
            </p>
          </div>

          <div className="youmdb-card p-8 text-center transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-youmdb-highlight to-youmdb-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Rate & Review</h3>
            <p className="text-slate-300">
              Share your thoughts and help others discover amazing content through ratings and detailed reviews
            </p>
          </div>

          <div className="youmdb-card p-8 text-center transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-youmdb-success to-youmdb-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">AI Insights</h3>
            <p className="text-slate-300">
              Get AI-powered summaries and insights about your favorite creators and their content
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-youmdb-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold youmdb-text-gradient mb-2">1M+</div>
              <div className="text-slate-300">Creators</div>
            </div>
            <div>
              <div className="text-4xl font-bold youmdb-text-gradient mb-2">5M+</div>
              <div className="text-slate-300">Reviews</div>
            </div>
            <div>
              <div className="text-4xl font-bold youmdb-text-gradient mb-2">50+</div>
              <div className="text-slate-300">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold youmdb-text-gradient mb-2">24/7</div>
              <div className="text-slate-300">AI Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
