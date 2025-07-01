import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getYouTubers, getAllReviews, YouTuber, Review } from '@/services/supabaseService';

const Index = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<YouTuber[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [creatorsData, reviewsData] = await Promise.all([
          getYouTubers(),
          getAllReviews()
        ]);
        setCreators(creatorsData);
        setReviews(reviewsData);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const trendingCreators = creators
    .sort((a, b) => b.subscriber_count - a.subscriber_count)
    .slice(0, 5);

  const totalCreators = creators.length;
  const totalReviews = reviews.length;
  const randomReview = reviews.length > 0 ? reviews[Math.floor(Math.random() * reviews.length)] : null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
          <div className="@container">
            <div className="@[480px]:px-4 @[480px]:py-3">
              <div
                className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-neutral-50 @[480px]:rounded-xl min-h-80"
                style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUBkDPd3V_2kkZzt5f1vTBQnSKbJ3yAPGe2O7GPJVTwSCKczPwj6k5JXoGph25xLUgER_gVTv_bvYW40NorwVWpJLFAVotcRcDKYqAucatLHqXF-Gy8ti1pVsXBrwZR8QHCNhe0obva-OYjp2yxhm-qioFqpVd0TC5pQQQ3WOmy7wqt_e83OndvHAecGU_xFxtyiuirMGZRlfehh6tGjMs2A3c8AZAJTQMVSpbcj0EaiZdMJVxnMGa9CUHgYtGJmgC1zFRUM6IQ6HE')"}}
              ></div>
            </div>
          </div>
          <h2 className="text-[#141414] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Welcome to YouMDB</h2>
          <p className="text-[#141414] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Discover detailed information about your favorite YouTube channels and videos. From trending content to creator insights, YouMDB provides a comprehensive view of the YouTube landscape.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center my-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center min-w-[160px]">
              <span className="text-3xl font-bold text-blue-600 animate-pulse">{loading ? '...' : totalCreators}</span>
              <span className="text-neutral-500 mt-1">Total Creators</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center min-w-[160px]">
              <span className="text-3xl font-bold text-blue-600 animate-pulse">{loading ? '...' : totalReviews}</span>
              <span className="text-neutral-500 mt-1">Total Reviews</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/youtubers')}
            className="mt-2 mb-4 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
          >
            Explore Creators
          </button>
          <button
            onClick={() => navigate('/youtubers')}
            className="mb-8 px-8 py-3 bg-neutral-100 text-blue-600 rounded-xl font-bold text-base hover:bg-blue-200 transition-colors border border-blue-200"
          >
            Suggest a Channel
          </button>
          <h3 className="text-xl font-bold text-[#141414] text-center mb-4">Trending Creators</h3>
          <div className="flex overflow-x-auto gap-6 pb-4 md:grid md:grid-cols-5 md:overflow-visible">
            {trendingCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-xl p-4 shadow flex flex-col items-center min-w-[180px] max-w-[200px] cursor-pointer hover:scale-105 transition-transform border border-neutral-200"
                onClick={() => navigate(`/youtuber/${creator.id}`)}
              >
                <img
                  src={creator.profile_picture_url || `https://placehold.co/100x100/7c3aed/ffffff?text=${creator.name.charAt(0)}`}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full border-4 border-neutral-200 object-cover mb-2"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/100x100/7c3aed/ffffff?text=${creator.name.charAt(0)}`;
                  }}
                />
                <div className="font-bold text-[#141414] text-center">{creator.name}</div>
                <div className="text-neutral-500 text-sm text-center mb-1">{creator.genre || 'General'}</div>
                <div className="text-blue-600 font-semibold text-sm">{creator.subscriber_count.toLocaleString()} subs</div>
              </div>
            ))}
          </div>
          {randomReview && (
            <div className="mt-10 flex flex-col items-center">
              <h3 className="text-lg font-bold text-[#141414] mb-2">What users are saying</h3>
              <div className="bg-white rounded-xl shadow p-6 max-w-xl w-full text-center">
                <div className="text-neutral-600 italic mb-2">"{randomReview.review_text}"</div>
                <div className="text-neutral-500 text-sm">- {randomReview.user_id.substring(0, 8)} on {randomReview.entity_type === 'youtuber' ? 'a creator' : 'a video'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
