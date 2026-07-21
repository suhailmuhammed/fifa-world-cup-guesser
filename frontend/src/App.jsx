import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import JoinForm from './components/JoinForm';
import FanClub from './components/FanClub';
import PredictionForm from './components/PredictionForm';
import CommunityStats from './components/CommunityStats';
import AdminDashboard from './components/AdminDashboard';
import OfficialResults from './components/OfficialResults';
import NationsOverview from './components/NationsOverview';
import Games from './components/Games';
import Button from './components/UI/Button';
import { Trophy, Percent, ShieldAlert } from 'lucide-react';

import FootballIcon from './components/UI/FootballIcon';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';



const App = () => {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fifa_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
      }
    }
  }, []);

  const handleJoinSuccess = (userData) => {
    localStorage.setItem('fifa_user', JSON.stringify(userData));
    setUser(userData);
    setPage('fan-club');
  };

  const handleLogout = () => {
    localStorage.removeItem('fifa_user');
    setUser(null);
    setPage('landing');
  };


  const handlePredictionSuccess = () => {
    setPage('stats');
  };

  // Render active page component
  const renderPageContent = () => {
    switch (page) {
      case 'landing':
        return (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-4xl mx-auto space-y-8 flex-grow"
          >
            {/* Ambient gold glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:w-[500px] bg-fifa-blue/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-tight flex items-center justify-center gap-3 md:gap-5">
                <FootballIcon className="h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 animate-pulse" />
                <span className="text-gradient-gold">Trionda</span>
              </h1>
              <p className="text-fifa-gold text-lg sm:text-2xl max-w-2xl mx-auto font-black uppercase tracking-widest mt-2">
                Predict. Play. Celebrate
              </p>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto font-semibold mt-1.5">
                Join your FIFA 2026 nation's fan club, lock in predictions, compete in mini-games, and climb the leaderboards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {user ? (
                <Button onClick={() => setPage('fan-club')} variant="gold" className="w-full sm:w-auto px-8 py-4 text-base">
                  Go to Fan Club
                </Button>
              ) : (
                <Button onClick={() => setPage('join')} variant="gold" className="w-full sm:w-auto px-8 py-4 text-base">
                  Join Now
                </Button>
              )}
              <Button onClick={() => setPage('stats')} variant="secondary" className="w-full sm:w-auto px-8 py-4 text-base">
                View Live Stats
              </Button>
            </div>
          </motion.div>
        );
      case 'join':
        return <JoinForm key="join" onJoinSuccess={handleJoinSuccess} backendUrl={BACKEND_URL} />;
      case 'fan-club':
        return <FanClub key="fan-club" user={user} setPage={setPage} backendUrl={BACKEND_URL} />;
      case 'prediction':
        return (
          <PredictionForm
            key="prediction"
            user={user}
            setPage={setPage}
            backendUrl={BACKEND_URL}
            onPredictionSuccess={handlePredictionSuccess}
          />
        );
      case 'stats':
        return <CommunityStats key="stats" backendUrl={BACKEND_URL} />;
      case 'official-results':
        return <OfficialResults key="official-results" backendUrl={BACKEND_URL} />;
      case 'nations':
        return <NationsOverview key="nations" backendUrl={BACKEND_URL} />;
      case 'admin':
        return <AdminDashboard key="admin" backendUrl={BACKEND_URL} />;
      case 'games':
        return <Games key="games" />;
      default:
        setPage('landing');
        return null;
    }
  };

  return (
    <div className="stadium-overlay flex flex-col min-h-screen">
      <Navbar activePage={page} setPage={setPage} user={user} onLogout={handleLogout} />
      
      <main className="flex-grow flex items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {renderPageContent()}
        </AnimatePresence>
      </main>

      <footer className="w-full border-t border-white/5 bg-fifa-dark/80 backdrop-blur-md py-6 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <FootballIcon className="h-4 w-4 shrink-0" />
          <span>© 2026 Trionda | Developed by <a href="https://github.com/suhailmuhammed" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors font-bold text-slate-400">Suhail Muhammed</a></span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setPage('nations')} className="hover:text-slate-300 transition-colors">
            Nations
          </button>
          <button onClick={() => setPage('stats')} className="hover:text-slate-300 transition-colors">
            Stats
          </button>
          <button onClick={() => setPage('official-results')} className="hover:text-fifa-gold font-semibold transition-colors">
            🏆 Official Results
          </button>
          <button onClick={() => setPage('games')} className="hover:text-slate-300 transition-colors">
            Games
          </button>
          <button onClick={() => setPage('admin')} className="hover:text-slate-300 transition-colors flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-red-500/80" /> Admin Console
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
