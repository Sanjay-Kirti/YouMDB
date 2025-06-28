
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, Filter } from 'lucide-react';
import { 
  searchYouTubersByName,
  getYouTubersByCountry,
  getYouTubersByCountryAndState,
  getUniqueCountries,
  getUniqueStates,
  YouTuber 
} from '@/services/dataService';
import { EarthGlobe } from '@/components/3D/EarthGlobe';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<YouTuber[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Load countries on component mount
    const loadCountries = async () => {
      const countryList = await getUniqueCountries();
      setCountries(countryList);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    // Load states when country changes
    const loadStates = async () => {
      if (selectedCountry) {
        const stateList = await getUniqueStates(selectedCountry);
        setStates(stateList);
        setSelectedState(''); // Reset state selection
      } else {
        setStates([]);
        setSelectedState('');
      }
    };
    loadStates();
  }, [selectedCountry]);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      let results: YouTuber[] = [];
      
      if (searchTerm.trim()) {
        // Search by name
        results = await searchYouTubersByName(searchTerm.trim());
        
        // Filter by location if specified
        if (selectedCountry) {
          results = results.filter(youtuber => youtuber.country === selectedCountry);
          if (selectedState) {
            results = results.filter(youtuber => youtuber.state === selectedState);
          }
        }
      } else if (selectedCountry) {
        // Search by location only
        if (selectedState) {
          results = await getYouTubersByCountryAndState(selectedCountry, selectedState);
        } else {
          results = await getYouTubersByCountry(selectedCountry);
        }
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching YouTubers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedState('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Search Creators Worldwide
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Discover talented YouTubers and streamers from around the globe using our interactive search
        </p>
      </div>

      {/* 3D Earth Globe */}
      <div className="youmdb-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Explore the World of Creators
        </h2>
        <EarthGlobe />
      </div>

      {/* Search Controls */}
      <div className="youmdb-card p-6 mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Name Search */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Creator Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="youmdb-input pl-10 w-full"
                placeholder="Search by name..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Country Dropdown */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="youmdb-input w-full"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              State/Province
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="youmdb-input w-full"
              disabled={!selectedCountry}
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex flex-col justify-end">
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="youmdb-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Summary */}
        {hasSearched && (
          <div className="text-center text-slate-400">
            {loading ? (
              <p>Searching for creators...</p>
            ) : (
              <p>
                Found {searchResults.length} creator{searchResults.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedCountry && ` in ${selectedState ? `${selectedState}, ` : ''}${selectedCountry}`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="youmdb-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-youmdb-accent" />
            Search Results
          </h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse">
                  <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded mb-4 w-3/4 mx-auto"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((youtuber) => (
                <div
                  key={youtuber.id}
                  onClick={() => navigate(`/youtuber/${youtuber.id}`)}
                  className="bg-slate-800 rounded-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Profile Picture */}
                  <div className="text-center mb-4">
                    <img
                      src={youtuber.profilePictureUrl}
                      alt={youtuber.name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-youmdb-accent object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/100x100/7c3aed/ffffff?text=${youtuber.name.charAt(0)}`;
                      }}
                    />
                  </div>

                  {/* Name and Genre */}
                  <h3 className="text-lg font-bold text-white text-center mb-2">
                    {youtuber.name}
                  </h3>
                  <div className="text-center mb-3">
                    <span className="bg-youmdb-accent text-white px-3 py-1 rounded-full text-sm">
                      {youtuber.genre}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-center text-slate-400 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{youtuber.state}, {youtuber.country}</span>
                  </div>

                  {/* Stats */}
                  <div className="text-center">
                    <div className="text-youmdb-highlight font-semibold">
                      {formatNumber(youtuber.subscriberCount)} subscribers
                    </div>
                    <div className="text-slate-400 text-sm">
                      {youtuber.averageRating.toFixed(1)} ⭐ rating
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Results Found</h3>
              <p className="text-slate-400 mb-4">
                Try adjusting your search criteria or exploring different locations
              </p>
              <button
                onClick={handleReset}
                className="youmdb-button"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Ready to Explore?</h3>
          <p className="text-slate-400">
            Use the search controls above to discover amazing creators from around the world
          </p>
        </div>
      )}
    </div>
  );
}
