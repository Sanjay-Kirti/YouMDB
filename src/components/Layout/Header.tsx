import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogIn, LogOut, Search, Home, Video, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/youtubers', label: 'Creators' },
    { path: '/search', label: 'Search' },
    { path: '/profile', label: 'Profile' },
  ];

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVideoClick = () => {
    navigate('/videos');
  };

  const handleBellClick = () => {
    // If notifications page exists, navigate to it. Otherwise, show alert.
    // navigate('/notifications');
    alert('Notifications coming soon!');
  };

  if (loading) {
    return (
      <header className="bg-youmdb-secondary border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-youmdb-accent to-youmdb-purple-light rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold youmdb-text-gradient">YouMDB</span>
            </div>
            <div className="w-20 h-10 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#ededed] px-10 py-3 bg-neutral-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-[#141414] cursor-pointer" onClick={() => navigate('/')}> 
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2183 14.2173 24 4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-[#141414] text-lg font-bold leading-tight tracking-[-0.015em]">YouMDB</h2>
          </div>
          <div className="flex items-center gap-9">
            {navigationItems.map(({ path, label }) => (
              <a
                key={path}
                className={`text-[#141414] text-sm font-medium leading-normal cursor-pointer ${location.pathname === path ? 'font-bold underline' : ''}`}
                onClick={() => navigate(path)}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <div className="text-neutral-500 flex border-none bg-[#ededed] items-center justify-center pl-4 rounded-l-xl border-r-0 cursor-pointer" onClick={handleSearch}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141414] focus:outline-0 focus:ring-0 border-none bg-[#ededed] focus:border-none h-full placeholder:text-neutral-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          </label>
          <div className="flex gap-2">
            <button onClick={handleVideoClick} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#ededed] text-[#141414] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <div className="text-[#141414]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"></path>
                </svg>
              </div>
            </button>
            <button onClick={handleBellClick} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#ededed] text-[#141414] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <div className="text-[#141414]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                </svg>
              </div>
            </button>
          </div>
          {user ? (
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: `url('${user.user_metadata?.avatar_url || 'https://placehold.co/40x40/7c3aed/ffffff?text=U'}')`}}></div>
          ) : null}
          <button
            onClick={handleAuthClick}
            className="ml-4 flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            {user ? 'Sign Out' : 'Sign In'}
          </button>
        </div>
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
