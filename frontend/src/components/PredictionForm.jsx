import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertCircle, Sparkles, CheckCircle2, ChevronRight, Loader } from 'lucide-react';
import Card from './UI/Card';
import Button from './UI/Button';
import TeamSelect from './UI/TeamSelect';
import PlayerSelect from './UI/PlayerSelect';
import { TEAMS_LIST } from '../data/teams';
import { GOLDEN_BOOT_CANDIDATES, GOLDEN_BALL_CANDIDATES } from '../data/players';
import FootballIcon from './UI/FootballIcon';

const PredictionForm = ({ user, setPage, backendUrl, onPredictionSuccess }) => {
  const [champion, setChampion] = useState('');
  const [runnerUp, setRunnerUp] = useState('');
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [goldenBoot, setGoldenBoot] = useState('');
  const [customGoldenBoot, setCustomGoldenBoot] = useState('');
  const [goldenBall, setGoldenBall] = useState('');
  const [customGoldenBall, setCustomGoldenBall] = useState('');
  const [mostGoalsTeam, setMostGoalsTeam] = useState('');
  const [biggestDisappointment, setBiggestDisappointment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check if this user has already predicted on component mount
  useEffect(() => {
    const checkPredictions = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${backendUrl}/api/predictions/user/${user._id}`);
        const prediction = await response.json();
        
        if (prediction && prediction._id) {
          setSuccess(true);
          localStorage.setItem(`has_predicted_${user._id}`, 'true');
        } else {
          setSuccess(false);
          localStorage.removeItem(`has_predicted_${user._id}`);
        }
      } catch (err) {
        console.error('Error checking predictions from server:', err);
        // Fallback to localStorage on network error
        const hasPredictedLocal = localStorage.getItem(`has_predicted_${user._id}`);
        if (hasPredictedLocal) {
          setSuccess(true);
        }
      } finally {
        setCheckingExisting(false);
      }
    };
    checkPredictions();
  }, [user, backendUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalGoldenBoot = goldenBoot === 'Other Player' ? customGoldenBoot.trim() : goldenBoot;
    const finalGoldenBall = goldenBall === 'Other Player' ? customGoldenBall.trim() : goldenBall;

    // Field check
    if (
      !champion ||
      !runnerUp ||
      !finalGoldenBoot ||
      !finalGoldenBall ||
      !mostGoalsTeam ||
      !biggestDisappointment
    ) {
      setError('Please answer all questions before submitting. Make sure to enter player names when "Other Player" is selected.');
      return;
    }

    if (champion === runnerUp) {
      setError('Champion and Runner-up cannot be the same team.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          champion,
          runnerUp,
          finalScore: {
            homeGoals,
            awayGoals
          },
          goldenBoot: finalGoldenBoot,
          goldenBall: finalGoldenBall,
          mostGoalsTeam,
          biggestDisappointment
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit predictions.');
      }

      localStorage.setItem(`has_predicted_${user._id}`, 'true');
      setSuccess(true);
      if (onPredictionSuccess) {
        onPredictionSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adjustGoals = (team, amount) => {
    if (team === 'home') {
      setHomeGoals(prev => Math.max(0, prev + amount));
    } else {
      setAwayGoals(prev => Math.max(0, prev + amount));
    }
  };

  if (checkingExisting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader className="h-6 w-6 text-fifa-gold animate-spin" />
        <span className="text-slate-400 font-medium">Verifying prediction status...</span>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto px-4 py-12"
      >
        <Card className="p-8 text-center border-emerald-500/20 bg-gradient-to-b from-fifa-navy to-slate-900">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Predictions Lock In!</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Your predictions have been submitted. Let's see how they stack up against the rest of the community!
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button onClick={() => setPage('stats')} variant="gold" className="w-full">
              View Community Stats <ChevronRight className="h-4 w-4" />
            </Button>
            <Button onClick={() => setPage('fan-club')} variant="secondary" className="w-full">
              Return to Fan Club
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl w-full mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <span className="text-xs uppercase font-extrabold tracking-widest text-fifa-gold px-3 py-1 rounded-full bg-fifa-gold/10 border border-fifa-gold/20 flex items-center gap-1.5 w-fit mx-auto">
          <FootballIcon className="h-3.5 w-3.5" /> Trionda Predictor
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight mt-2.5">
          Submit Your World Cup Predictions
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 max-w-lg mx-auto">
          Test your soccer knowledge. Locked-in choices are shared with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Champion & Runner Up */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-fifa-gold" />
            1. The Finalists
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                🏆 Who will win the FIFA World Cup?
              </label>
              <TeamSelect
                options={TEAMS_LIST}
                value={champion}
                onChange={setChampion}
                placeholder="Select Champion..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                🥈 Which team will finish as the runner-up?
              </label>
              <TeamSelect
                options={TEAMS_LIST}
                value={runnerUp}
                onChange={setRunnerUp}
                placeholder="Select Runner-up..."
              />
            </div>
          </div>
        </Card>

        {/* 2. Final Score */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            ⚽ 2. World Cup Final Score
          </h2>
          <p className="text-xs text-slate-400 -mt-2">
            Predict the scoreline at the end of regular/extra time.
          </p>

          <div className="flex justify-center items-center gap-8 md:gap-16 max-w-sm mx-auto py-2">
            {/* Home score */}
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase font-extrabold text-slate-400 mb-2 tracking-wider">Champion</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustGoals('home', -1)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-lg border border-white/10 select-none"
                >
                  -
                </button>
                <span className="text-3xl font-black text-white w-8 text-center">{homeGoals}</span>
                <button
                  type="button"
                  onClick={() => adjustGoals('home', 1)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-lg border border-white/10 select-none"
                >
                  +
                </button>
              </div>
            </div>

            <span className="text-2xl font-bold text-slate-500 mt-6 select-none">:</span>

            {/* Away score */}
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase font-extrabold text-slate-400 mb-2 tracking-wider">Runner-up</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustGoals('away', -1)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-lg border border-white/10 select-none"
                >
                  -
                </button>
                <span className="text-3xl font-black text-white w-8 text-center">{awayGoals}</span>
                <button
                  type="button"
                  onClick={() => adjustGoals('away', 1)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-lg border border-white/10 select-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Player Awards */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🏅 3. Individual Awards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                👟 Who will win the Golden Boot (Top Scorer)?
              </label>
              <PlayerSelect
                options={GOLDEN_BOOT_CANDIDATES}
                value={goldenBoot}
                onChange={(val) => {
                  setGoldenBoot(val);
                  if (val !== 'Other Player') {
                    setCustomGoldenBoot('');
                  }
                }}
                placeholder="Select Golden Boot Candidate..."
              />
              <AnimatePresence>
                {goldenBoot === 'Other Player' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Enter Player Name"
                      value={customGoldenBoot}
                      onChange={(e) => setCustomGoldenBoot(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-fifa-gold transition-colors duration-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                ⭐ Who will win the Golden Ball (Best Player)?
              </label>
              <PlayerSelect
                options={GOLDEN_BALL_CANDIDATES}
                value={goldenBall}
                onChange={(val) => {
                  setGoldenBall(val);
                  if (val !== 'Other Player') {
                    setCustomGoldenBall('');
                  }
                }}
                placeholder="Select Golden Ball Candidate..."
              />
              <AnimatePresence>
                {goldenBall === 'Other Player' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Enter Player Name"
                      value={customGoldenBall}
                      onChange={(e) => setCustomGoldenBall(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-fifa-gold transition-colors duration-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* 4. Team Metrics */}
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            🔥 4. Team Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                ⚽ Which team will score the most goals?
              </label>
              <TeamSelect
                options={TEAMS_LIST}
                value={mostGoalsTeam}
                onChange={setMostGoalsTeam}
                placeholder="Select Team..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                🤯 Which team will be the biggest disappointment?
              </label>
              <TeamSelect
                options={TEAMS_LIST}
                value={biggestDisappointment}
                onChange={setBiggestDisappointment}
                placeholder="Select Team..."
              />
            </div>
          </div>
        </Card>

        {/* Errors Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="gold"
          loading={loading}
          className="w-full py-4 text-base font-extrabold uppercase tracking-wide border-t border-white/5"
        >
          Submit Prediction
        </Button>
      </form>
    </motion.div>
  );
};

export default PredictionForm;
