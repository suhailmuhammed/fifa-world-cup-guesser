import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, ShieldAlert, AlertTriangle, Loader } from 'lucide-react';
import Card from './UI/Card';
import ProgressBar from './UI/ProgressBar';
import { getTeamEmoji } from './Navbar';

const CommunityStats = ({ backendUrl }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/api/predictions/stats`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch community predictions.');
      }
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader className="h-6 w-6 text-fifa-gold animate-spin" />
        <span className="text-slate-400 font-medium">Crunching community statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <Card className="p-6 border-red-500/20 bg-red-500/5 text-center text-red-400">
          <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  const hasData = stats && stats.totalPredictions > 0;

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto px-4 py-12"
      >
        <Card className="p-8 text-center border-white/5">
          <Trophy className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">No Predictions Yet</h2>
          <p className="text-sm text-slate-400 mt-2">
            Be the very first supporter to lock in predictions and kickstart community metrics!
          </p>
        </Card>
      </motion.div>
    );
  }

  // Display top 4 choices per category
  const renderCategoryStats = (items, color = 'azure', isTeam = false) => {
    if (!items || items.length === 0) {
      return <p className="text-slate-500 text-sm italic">No votes cast yet.</p>;
    }

    return (
      <div className="space-y-4">
        {items.slice(0, 4).map((item, idx) => {
          const emoji = isTeam ? getTeamEmoji(item.name) : '';
          const label = isTeam ? `${emoji} ${item.name}` : item.name;
          return (
            <ProgressBar
              key={idx}
              label={label}
              percentage={item.percentage}
              color={color}
              sublabel={`${item.count} fan${item.count > 1 ? 's' : ''}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl w-full mx-auto px-4 py-8 space-y-8"
    >
      {/* Header Banner */}
      <div className="text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-fifa-gold px-3 py-1 rounded-full bg-fifa-gold/10 border border-fifa-gold/20">
          World Cup Insights
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight mt-2.5">
          Community Predictions
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5 justify-center">
          Aggregated analytics from {stats.totalPredictions} locked-in prediction ballot{stats.totalPredictions > 1 ? 's' : ''}.
        </p>
      </div>

      {/* Grid Layout of predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Champion Stats */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🏆 World Cup Champion
          </h2>
          {renderCategoryStats(stats.championStats, 'gold', true)}
        </Card>

        {/* Runner-up Stats */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🥈 World Cup Runner-up
          </h2>
          {renderCategoryStats(stats.runnerUpStats, 'azure', true)}
        </Card>

        {/* Golden Boot */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            👟 Golden Boot (Top Scorer)
          </h2>
          {renderCategoryStats(stats.goldenBootStats, 'rose', false)}
        </Card>

        {/* Golden Ball */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            ⭐ Golden Ball (Best Player)
          </h2>
          {renderCategoryStats(stats.goldenBallStats, 'green', false)}
        </Card>

        {/* Most Goals Team */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🔥 Highest Scoring Team
          </h2>
          {renderCategoryStats(stats.mostGoalsTeamStats, 'rose', true)}
        </Card>

        {/* Biggest Disappointment */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🤯 Biggest Disappointment
          </h2>
          {renderCategoryStats(stats.biggestDisappointmentStats, 'azure', true)}
        </Card>
      </div>
    </motion.div>
  );
};

export default CommunityStats;
