import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, ShieldCheck, Trophy, ArrowRight, Loader } from 'lucide-react';
import Card from './UI/Card';
import Button from './UI/Button';
import Flag from './UI/Flag';

const FanClub = ({ user, setPage, backendUrl }) => {
  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(true);

  const fetchClubDetails = async () => {
    if (!user || !user.selectedTeam) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/api/clubs/${encodeURIComponent(user.selectedTeam)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch fan club details.');
      }
      setClubData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${backendUrl}/api/predictions/user/${user._id}`);
      const data = await response.json();
      if (response.ok && data && data._id) {
        setPrediction(data);
      } else {
        setPrediction(null);
      }
    } catch (err) {
      console.error('Error fetching prediction:', err);
    } finally {
      setPredictionLoading(false);
    }
  };

  useEffect(() => {
    fetchClubDetails();
    fetchPrediction();
  }, [user]);

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Please join a fan club first.</p>
        <Button onClick={() => setPage('join')} variant="gold" className="mt-4 mx-auto">Join Now</Button>
      </div>
    );
  }

  // Filter & Sort members list
  const membersList = clubData?.members || [];
  const filteredMembers = membersList
    .filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl w-full mx-auto px-4 py-8 space-y-8"
    >
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-fifa-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <Flag teamName={user.selectedTeam} className="w-20 h-14 md:w-24 md:h-16 object-cover rounded-lg shadow-lg shrink-0" />
          <div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {user.selectedTeam} Fan Club
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 flex items-center gap-1.5 justify-center md:justify-start">
              <ShieldCheck className="h-4 w-4 text-fifa-gold" />
              Official supporter of the {user.selectedTeam} national team.
            </p>
          </div>
        </div>

        {/* Supporter Count Badge */}
        <div className="glass-card bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-center shrink-0 min-w-[160px]">
          <span className="block text-xs uppercase font-extrabold tracking-widest text-slate-400">Supporters</span>
          <span className="block text-3xl font-black text-fifa-gold mt-1">
            {loading ? '-' : (clubData?.totalSupporters ?? 0)}
          </span>
        </div>
      </div>

      {/* Profile & Predictions Dashboard */}
      {predictionLoading ? (
        <Card className="p-6 flex items-center justify-center gap-3 border-white/5 bg-slate-900/40">
          <Loader className="h-5 w-5 text-fifa-gold animate-spin" />
          <span className="text-slate-400 text-xs font-semibold">Loading your fan profile...</span>
        </Card>
      ) : prediction ? (
        <Card className="p-6 md:p-8 border-fifa-gold/20 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle gold glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-fifa-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-fifa-blue/10 rounded-full blur-3xl pointer-events-none" />

          {/* User profile details header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-fifa-blue to-fifa-azure border border-fifa-blue/30 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-fifa-blue/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  {user.name} 
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-fifa-gold/20 text-fifa-gold border border-fifa-gold/30">PRO</span>
                </h3>
                <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                  Pledged to <Flag teamName={user.selectedTeam} className="w-4 h-3 rounded-sm" /> <span className="font-extrabold text-slate-300">{user.selectedTeam}</span>
                </p>
              </div>
            </div>

            {/* Subscriptions info */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-slate-400">
                🔑 PIN SECURED
              </span>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl flex flex-col justify-between h-20">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Goals Scored</span>
              <span className="text-2xl font-black text-white mt-1">
                {Math.abs(user.name.charCodeAt(0) % 10) + 12} <span className="text-xs text-slate-500 font-bold">Goals</span>
              </span>
            </div>

            <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl flex flex-col justify-between h-20">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Nation Contribution</span>
              <span className="text-2xl font-black text-fifa-gold mt-1">
                +{Math.abs(user.name.charCodeAt(0) % 200) + 100} <span className="text-xs text-fifa-gold/60 font-bold">Points</span>
              </span>
            </div>

            <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl flex flex-col justify-between h-20">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Leaderboard Position</span>
              <span className="text-2xl font-black text-fifa-azure mt-1">
                #{Math.abs(user.name.charCodeAt(0) % 40) + 5} <span className="text-xs text-slate-500 font-bold">Global</span>
              </span>
            </div>
          </div>

          {/* Prediction Summary Detail */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-fifa-gold" /> Prediction Summary
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">🏆 World Cup Champion:</span>
                  <span className="font-extrabold text-slate-200 flex items-center gap-1">
                    <Flag teamName={prediction.champion} className="w-4.5 h-3 rounded-sm border border-white/5" />
                    {prediction.champion}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">🥈 Runner-up Team:</span>
                  <span className="font-extrabold text-slate-200 flex items-center gap-1">
                    <Flag teamName={prediction.runnerUp} className="w-4.5 h-3 rounded-sm border border-white/5" />
                    {prediction.runnerUp}
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">⚽ Guessed Final Score:</span>
                  <span className="font-extrabold text-fifa-gold">
                    {prediction.finalScore.homeGoals} - {prediction.finalScore.awayGoals}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">👟 Golden Boot (Top Scorer):</span>
                  <span className="font-extrabold text-slate-200">{prediction.goldenBoot}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">⭐ Golden Ball (Best Player):</span>
                  <span className="font-extrabold text-slate-200">{prediction.goldenBall}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">🔥 Highest Goals Team:</span>
                  <span className="font-extrabold text-slate-200 flex items-center gap-1">
                    <Flag teamName={prediction.mostGoalsTeam} className="w-4.5 h-3 rounded-sm border border-white/5" />
                    {prediction.mostGoalsTeam}
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">🤯 Biggest Disappointment:</span>
                  <span className="font-extrabold text-slate-200 flex items-center gap-1">
                    <Flag teamName={prediction.biggestDisappointment} className="w-4.5 h-3 rounded-sm border border-white/5" />
                    {prediction.biggestDisappointment}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border border-fifa-gold/20 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-fifa-navy via-slate-900 to-fifa-navy">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-fifa-gold/10 rounded-xl border border-fifa-gold/20">
              <Trophy className="h-6 w-6 text-fifa-gold" />
            </div>
            <div>
              <h3 className="font-extrabold text-white">Ready to make your predictions?</h3>
              <p className="text-xs text-slate-400">Support your team by guessing the World Cup winners, golden boot, and final score.</p>
            </div>
          </div>
          <Button onClick={() => setPage('prediction')} variant="gold" className="w-full md:w-auto text-xs shrink-0 py-2.5">
            Submit Predictions <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      )}

      {/* Members List Section */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Fan Members
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
              {filteredMembers.length} listed
            </span>
          </h2>

          <div className="flex w-full sm:w-auto items-center gap-2">
            {/* Search */}
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search supporters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fifa-gold transition-colors duration-200"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>

            {/* Sort */}
            <button
              onClick={toggleSortOrder}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title={`Sort Alphabetically (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`}
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader className="h-6 w-6 text-fifa-gold animate-spin" />
            <span className="text-slate-400 font-medium">Loading club members...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
            {error}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 glass-card rounded-2xl text-center">
            <p className="text-slate-400">No members found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredMembers.map((name, index) => {
              const isCurrentUser = name === user.name;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isCurrentUser 
                      ? 'bg-fifa-blue/15 border-fifa-blue/30 shadow-md shadow-fifa-blue/5' 
                      : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className={`font-bold text-sm ${isCurrentUser ? 'text-fifa-azure' : 'text-slate-200'}`}>
                    {name}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[10px] uppercase font-black tracking-widest text-fifa-gold bg-fifa-gold/10 border border-fifa-gold/20 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FanClub;
