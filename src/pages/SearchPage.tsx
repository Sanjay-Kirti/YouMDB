import React, { useState, useEffect } from 'react';
import { getYouTubers, getUniqueCountries, getUniqueStates, searchYouTubersByName, YouTuber } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { ReviewSection } from '@/components/Reviews/ReviewSection';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [minSubs, setMinSubs] = useState('');
  const [maxSubs, setMaxSubs] = useState('');
  const [creators, setCreators] = useState<YouTuber[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all genres from youtubers table
    getYouTubers().then(data => {
      const uniqueGenres = Array.from(new Set(data.map(y => y.genre).filter(Boolean)));
      setGenres(uniqueGenres);
    });
  }, []);

  const handleSearch = async () => {
    // Form validation
    if (minSubs && isNaN(Number(minSubs))) {
      toast({ title: 'Invalid Input', description: 'Min Subs must be a number.', variant: 'destructive' });
      return;
    }
    if (maxSubs && isNaN(Number(maxSubs))) {
      toast({ title: 'Invalid Input', description: 'Max Subs must be a number.', variant: 'destructive' });
      return;
    }
    if (minSubs && maxSubs && Number(minSubs) > Number(maxSubs)) {
      toast({ title: 'Invalid Input', description: 'Min Subs cannot be greater than Max Subs.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      let results: YouTuber[] = [];
      if (searchTerm.trim()) {
        results = await searchYouTubersByName(searchTerm.trim());
      } else {
        results = await getYouTubers();
      }
      if (genre) {
        results = results.filter(y => y.genre === genre);
      }
      if (minSubs) {
        results = results.filter(y => y.subscriber_count >= parseInt(minSubs, 10));
      }
      if (maxSubs) {
        results = results.filter(y => y.subscriber_count <= parseInt(maxSubs, 10));
      }
      setCreators(results);
      toast({ title: 'Search Complete', description: `${results.length} creators found.` });
    } catch (err) {
      setError('Failed to search. Please try again.');
      toast({ title: 'Search Error', description: 'Failed to search. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-neutral-50">
      <h2 className="text-[#141414] tracking-light text-3xl font-bold text-center pb-6">Search YouTubers</h2>
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
        <input
          type="text"
          placeholder="Search by name"
          className="border border-neutral-200 rounded-lg p-2 w-full md:w-64"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-neutral-200 rounded-lg p-2 w-full md:w-48"
          value={genre}
          onChange={e => setGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          placeholder="Min Subs"
          className="border border-neutral-200 rounded-lg p-2 w-24"
          value={minSubs}
          onChange={e => setMinSubs(e.target.value)}
        />
        <input
          type="number"
          min="0"
          placeholder="Max Subs"
          className="border border-neutral-200 rounded-lg p-2 w-24"
          value={maxSubs}
          onChange={e => setMaxSubs(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white rounded-lg px-6 py-2 font-bold hover:bg-blue-700 transition-colors"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((youtuber) => (
            <div
              key={youtuber.id}
              className="bg-white rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-neutral-200 shadow flex flex-col items-center"
            >
              <img
                src={youtuber.profile_picture_url || `https://placehold.co/100x100/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`}
                alt={youtuber.name}
                className="w-20 h-20 rounded-full border-4 border-neutral-200 object-cover mb-2"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/100x100/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`;
                }}
              />
              <h3 className="text-lg font-bold text-[#141414] text-center mb-1">{youtuber.name}</h3>
              <span className="bg-neutral-100 text-[#141414] px-3 py-1 rounded-full text-sm border border-neutral-200 mb-1">{youtuber.genre || 'General'}</span>
              <div className="text-blue-600 font-semibold mb-1">{youtuber.subscriber_count.toLocaleString()} subscribers</div>
              <div className="text-neutral-400 text-sm mb-1">{youtuber.country}</div>
              {/* ReviewSection for this youtuber */}
              <div className="w-full mt-4">
                <ReviewSection entityId={youtuber.id} entityType="youtuber" entityName={youtuber.name} starColor="#141414" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && creators.length === 0 && (
        <div className="text-center py-8 text-neutral-400">No creators found.</div>
      )}
    </div>
  );
}
