
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogIn, LogOut, Search, Home, Video, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signOut, canInteract } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/youtubers', label: 'YouTubers', icon: Users },
    { path: '/videos', label: 'Videos', icon: Video },
    { path: '/search', label: 'Search', icon: Search },
  ];

  const handleAuthClick = () => {
    if (user && !user.isAnonymous) {
      signOut();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <header className="bg-youmdb-secondary border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-youmdb-accent to-youmdb-purple-light rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold youmdb-text-gradient">YouMDB</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === path
                      ? 'bg-youmdb-accent text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* User ID Display */}
              {user && (
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">
                    {user.isAnonymous ? 'Guest' : user.uid?.substring(0, 8)}...
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    userRole === 'guest' 
                      ? 'bg-slate-600 text-slate-300'
                      : userRole === 'creator'
                      ? 'bg-youmdb-purple-dark text-purple-200'
                      : 'bg-youmdb-accent text-white'
                  }`}>
                    {userRole}
                  </span>
                </div>
              )}

              {/* Auth Button */}
              <button
                onClick={handleAuthClick}
                className="flex items-center space-x-2 youmdb-button"
              >
                {user && !user.isAnonymous ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Navigation Button */}
            <button className="md:hidden text-slate-300 hover:text-white">
              <Users className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
