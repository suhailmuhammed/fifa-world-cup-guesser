import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Clock, Zap, Globe, Award, Trophy, Sparkles, 
  Bell, CheckCircle2, AlertCircle, ArrowRight 
} from 'lucide-react';
import Card from './UI/Card';
import Button from './UI/Button';

const Games = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleNotifyMe = () => {
    setToastMessage("Goal Rush Challenge is currently in development. Stay tuned!");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const upcomingGames = [
    { id: 1, title: '⚽ Goal Rush Challenge', status: 'Coming Soon', desc: 'Fast-paced goal scoring countdown challenge.' },
    { id: 2, title: '🧤 Goalkeeper Challenge', status: 'Coming Soon', desc: 'Test your reflexes guarding the net.' },
    { id: 3, title: '🧠 Football Quiz', status: 'Coming Soon', desc: 'Trivia showdown on World Cup history.' },
    { id: 4, title: '🎯 Crossbar Challenge', status: 'Coming Soon', desc: 'Aim precisely to hit the bar from distance.' },
    { id: 5, title: '🌍 Fan Club Cup', status: 'Coming Soon', desc: 'Live bracket tournament representing your country.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl w-full mx-auto px-4 py-8 space-y-10 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-fifa-gold/30 p-4 rounded-2xl shadow-2xl shadow-fifa-gold/5 backdrop-blur-xl"
          >
            <div className="p-2 bg-fifa-gold/10 rounded-xl border border-fifa-gold/25 text-fifa-gold">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <p className="text-white text-xs font-bold font-sans">Notification Saved</p>
              <p className="text-slate-400 text-[11px] mt-0.5 font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Hero */}
      <div className="text-center relative py-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-fifa-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        <span className="text-xs uppercase font-extrabold tracking-widest text-fifa-gold px-3.5 py-1.5 rounded-full bg-fifa-gold/10 border border-fifa-gold/20 inline-flex items-center gap-1.5">
          <Gamepad2 className="h-4 w-4" /> Gaming Arena
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mt-4">
          FIFA Fan Games
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2.5 max-w-xl mx-auto font-medium">
          Compete, score points, and help your nation climb the FIFA Fan Club Rankings.
        </p>
      </div>

      {/* Featured Game Card */}
      <Card className="p-6 md:p-10 relative overflow-hidden border-fifa-gold/20 bg-gradient-to-br from-fifa-navy via-slate-900 to-fifa-navy shadow-2xl">
        {/* Glowing Ambient gold circle */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-fifa-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fifa-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div className="space-y-5 flex-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-md bg-fifa-gold/20 text-fifa-gold border border-fifa-gold/30">
                🚧 COMING SOON
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Featured Game</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              ⚽ Goal Rush Challenge
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Score as many goals as possible within 30 seconds. Compete against football fans worldwide and earn points for your favorite nation.
            </p>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Clock className="h-4.5 w-4.5 text-fifa-gold shrink-0" />
                <span className="font-bold">30 Second Challenge</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Zap className="h-4.5 w-4.5 text-fifa-gold shrink-0" />
                <span className="font-bold">Fast-Paced Gameplay</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Globe className="h-4.5 w-4.5 text-fifa-gold shrink-0" />
                <span className="font-bold">Global Leaderboards</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Trophy className="h-4.5 w-4.5 text-fifa-gold shrink-0" />
                <span className="font-bold">Country Fan Club Points</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 sm:col-span-2">
                <Award className="h-4.5 w-4.5 text-fifa-gold shrink-0" />
                <span className="font-bold">Achievement Badges</span>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleNotifyMe} variant="gold" className="px-8 py-3 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 hover:scale-105 transition-transform duration-200">
                <Bell className="h-4 w-4" /> Notify Me
              </Button>
            </div>
          </div>

          {/* Graphical Mockup Element */}
          <div className="relative w-full lg:w-96 aspect-video lg:aspect-square rounded-2xl border border-white/5 bg-slate-950/60 overflow-hidden flex flex-col justify-center items-center gap-3.5 shadow-2xl p-6">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(13,110,253,0.05),rgba(229,193,88,0.05))]" />
            <div className="relative p-5 bg-fifa-gold/5 border border-fifa-gold/20 rounded-full text-fifa-gold animate-bounce duration-1000">
              <Sparkles className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1 z-10">
              <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Mini-Game Interactive Screen</h4>
              <p className="text-slate-500 text-xxs max-w-xs mx-auto">Vibrant gameplay interface design including score streaks, multipliers, and audio effects is under construction.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Roadmap Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            🔥 Upcoming Games
          </h2>
          <p className="text-xs text-slate-400 mt-1">Official gaming lineup roadmap slated for the World Cup launch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingGames.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl border border-white/5 bg-slate-900/35 hover:border-fifa-gold/25 hover:bg-slate-900/60 transition-all duration-300 relative group flex flex-col justify-between h-40"
            >
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-200 text-sm group-hover:text-fifa-gold transition-colors">{game.title}</h3>
                  <span className="text-[9px] font-black tracking-widest text-fifa-gold bg-fifa-gold/15 border border-fifa-gold/20 px-2 py-0.5 rounded uppercase">
                    {game.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">{game.desc}</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider group-hover:text-slate-300 transition-colors pt-2">
                <span>View roadmap details</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Banner */}
      <Card className="p-6 border border-white/5 bg-slate-900/20 text-center space-y-2.5 max-w-3xl mx-auto rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fifa-blue/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <p className="text-slate-300 text-sm font-semibold flex items-center justify-center gap-2">
          🚀 More football mini-games are currently under development.
        </p>
        <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed">
          Future updates will include leaderboards, fan club competitions, achievements, and exclusive rewards.
        </p>
      </Card>
    </motion.div>
  );
};

export default Games;
