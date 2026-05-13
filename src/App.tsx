import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError } from './components/Toast';
import DiaryPage from './pages/DiaryPage';
import CalendarPage from './pages/CalendarPage';
import { FaBars, FaTimes as FaTimesIcon, FaSignOutAlt, FaGoogle, FaStar, FaBrain, FaHeart, FaCalendarAlt, FaLock } from 'react-icons/fa';

const LoadingSpin: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
  </div>
);

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'diary' | 'calendar'>('diary');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    checkUser();
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setCurrentPage('diary');
      setSidebarOpen(false);
      localStorage.removeItem('supabase.auth.token');
      showSuccess('Successfully signed out');
    } catch (err: any) {
      showError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpin />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 relative overflow-hidden">
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes shootingStar {
            0% {
              transform: translateX(0) translateY(0);
              opacity: 0.8;
            }
            100% {
              transform: translateX(-250px) translateY(120px);
              opacity: 0;
            }
          }
        `}</style>

        <div className="absolute inset-0">
          {[...Array(400)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full"
              style={{
                width: `${Math.random() * 2 + 0.5}px`,
                height: `${Math.random() * 2 + 0.5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0">
          {[...Array(120)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full"
              style={{
                width: `${Math.random() * 3 + 1.5}px`,
                height: `${Math.random() * 3 + 1.5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              animation: `shootingStar ${15 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 20}s`
            }}
          />
        ))}

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
                <div className="relative w-28 h-28 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl border border-yellow-400/30 transform group-hover:scale-105 transition-transform duration-500">
                  <FaStar className="w-14 h-14 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Starla's Diary
              </h1>
              <p className="text-gray-400 mt-2 text-sm">Your AI-powered emotional wellness companion</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 text-center border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 group">
                <FaBrain className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300">AI Emotion Detection</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 text-center border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group">
                <FaHeart className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300">Sentiment Tracking</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 text-center border border-green-500/20 hover:border-green-500/50 transition-all duration-300 group">
                <FaCalendarAlt className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300">Mood Calendar</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 text-center border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 group">
                <FaLock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300">Private & Secure</p>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700/30">
              <button onClick={handleLogin}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3.5 rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-yellow-500/20 transform hover:scale-[1.02]">
                <FaGoogle className="w-5 h-5" />
                Continue with Google
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">⭐ Powered by Groq AI</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 relative overflow-hidden">
      {/* Global Star Background - Covers everything including sidebar */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0">
          {[...Array(300)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full"
              style={{
                width: `${Math.random() * 2 + 0.5}px`,
                height: `${Math.random() * 2 + 0.5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0">
          {[...Array(80)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.2,
                animation: `twinkleStar ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              animation: `shootingStarBg ${20 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 30}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkleStar {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shootingStarBg {
          0% { transform: translateX(0) translateY(0); opacity: 0.8; }
          100% { transform: translateX(-200px) translateY(100px); opacity: 0; }
        }
      `}</style>

      <Toaster />
      
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg shadow-lg"
      >
        <FaBars className="text-gray-300" />
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation with slight transparency to show stars */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900/80 backdrop-blur-sm shadow-xl z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <FaStar className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Menu</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-200">
              <FaTimesIcon />
            </button>
          </div>
          
          <nav className="space-y-2 flex-1">
            <button onClick={() => { setCurrentPage('diary'); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-3 ${
                currentPage === 'diary'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}>
              <span className="text-xl">📝</span> Write Entry
            </button>
            <button onClick={() => { setCurrentPage('calendar'); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-3 ${
                currentPage === 'calendar'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}>
              <span className="text-xl">📅</span> Calendar View
            </button>
          </nav>

          <div className="pt-4 border-t border-gray-700">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-400 mb-3 break-all">
                {user.user_metadata?.full_name || user.email}
              </div>
              <button onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium">
                <FaSignOutAlt className="text-sm" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 relative z-10">
        {currentPage === 'diary' ? <DiaryPage user={user} /> : <CalendarPage onNavigateToDiary={() => setCurrentPage('diary')} />}
      </div>
    </div>
  );
}

export default App;