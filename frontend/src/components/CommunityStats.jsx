import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertTriangle, Loader } from 'lucide-react';
import Card from './UI/Card';
import ProgressBar from './UI/ProgressBar';
import Flag from './UI/Flag';

const CommunityStats = ({ backendUrl }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [predictors, setPredictors] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

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

  // Handle click on prediction item
  const handleOptionClick = async (field, value) => {
    setSelectedField(field);
    setSelectedValue(value);
    setModalOpen(true);
    setModalLoading(true);
    setModalError('');
    setPredictors([]);

    try {
      const response = await fetch(
        `${backendUrl}/api/predictions/predictors?field=${field}&value=${encodeURIComponent(value)}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load predictors.');
      }
      setPredictors(data);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'champion':
        return '🏆 World Cup Champion';
      case 'runnerUp':
        return '🥈 Runner-Up';
      case 'goldenBoot':
        return '👟 Golden Boot';
      case 'goldenBall':
        return '⭐ Golden Ball';
      case 'mostGoalsTeam':
        return '🔥 Highest Scoring Team';
      case 'biggestDisappointment':
        return '🤯 Biggest Disappointment';
      default:
        return 'Prediction';
    }
  };

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
  const renderCategoryStats = (items, color = 'azure', isTeam = false, field = '') => {
    if (!items || items.length === 0) {
      return <p className="text-slate-500 text-sm italic">No votes cast yet.</p>;
    }

    return (
      <div className="space-y-4">
        {items.slice(0, 4).map((item, idx) => {
          const label = isTeam ? (
            <span className="inline-flex items-center gap-1.5">
              <Flag teamName={item.name} />
              <span>{item.name}</span>
            </span>
          ) : (
            <span>{item.name}</span>
          );
          return (
            <div
              key={idx}
              onClick={() => handleOptionClick(field, item.name)}
              className="w-full text-left cursor-pointer group hover:bg-slate-800/40 p-2.5 -m-2.5 rounded-xl transition-all duration-200 select-none border border-transparent hover:border-white/5"
            >
              <ProgressBar
                label={label}
                percentage={item.percentage}
                color={color}
                sublabel={`${item.count} fan${item.count > 1 ? 's' : ''}`}
              />
            </div>
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
          {renderCategoryStats(stats.championStats, 'gold', true, 'champion')}
        </Card>

        {/* Runner-up Stats */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🥈 World Cup Runner-up
          </h2>
          {renderCategoryStats(stats.runnerUpStats, 'azure', true, 'runnerUp')}
        </Card>

        {/* Golden Boot */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            👟 Golden Boot (Top Scorer)
          </h2>
          {renderCategoryStats(stats.goldenBootStats, 'rose', false, 'goldenBoot')}
        </Card>

        {/* Golden Ball */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            ⭐ Golden Ball (Best Player)
          </h2>
          {renderCategoryStats(stats.goldenBallStats, 'green', false, 'goldenBall')}
        </Card>

        {/* Most Goals Team */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🔥 Highest Scoring Team
          </h2>
          {renderCategoryStats(stats.mostGoalsTeamStats, 'rose', true, 'mostGoalsTeam')}
        </Card>

        {/* Biggest Disappointment */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🤯 Biggest Disappointment
          </h2>
          {renderCategoryStats(stats.biggestDisappointmentStats, 'azure', true, 'biggestDisappointment')}
        </Card>
      </div>

      {/* Modern Modal Popup */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-fifa-dark/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden border border-fifa-gold/30 shadow-2xl flex flex-col max-h-[85vh] z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-fifa-gold">
                    {getFieldLabel(selectedField)} Predictors
                  </span>
                  <h3 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                    {selectedField === 'champion' || selectedField === 'runnerUp' || selectedField === 'mostGoalsTeam' || selectedField === 'biggestDisappointment' ? (
                      <>
                        <Flag teamName={selectedValue} />
                        <span>{selectedValue}</span>
                      </>
                    ) : (
                      <span>⚽ {selectedValue}</span>
                    )}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                {modalLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader className="h-8 w-8 text-fifa-gold animate-spin" />
                    <span className="text-slate-400 text-sm font-medium">Fetching predictions...</span>
                  </div>
                ) : modalError ? (
                  <div className="p-4 border border-red-500/20 bg-red-500/5 text-center rounded-xl">
                    <AlertTriangle className="h-8 w-8 mx-auto text-red-400 mb-2" />
                    <p className="text-red-400 text-sm">{modalError}</p>
                  </div>
                ) : predictors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">No predictors found for this option.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {predictors.map((predictor, index) => (
                      <motion.div
                        key={predictor._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/60 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fifa-blue to-fifa-azure flex items-center justify-center font-bold text-white shadow-md text-sm">
                            {predictor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-white group-hover:text-fifa-gold transition-colors">
                              {predictor.name}
                            </h4>
                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              Favorite Team: <Flag teamName={predictor.selectedTeam} /> {predictor.selectedTeam}
                            </span>
                          </div>
                        </div>
                        {predictor.createdAt && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Submitted</span>
                            <span className="text-xs text-slate-300 font-medium">
                              {new Date(predictor.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-slate-900/80 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Total Predictors: <span className="font-bold text-fifa-gold">{predictors.length}</span>
                </span>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommunityStats;

