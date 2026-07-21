import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Award, Star, CheckCircle2, XCircle, Loader, 
  AlertTriangle, Users, Flame, Shield, Check, Heart, Sparkles
} from 'lucide-react';
import Card from './UI/Card';
import Flag from './UI/Flag';
import FootballIcon from './UI/FootballIcon';
import Confetti from './UI/Confetti';

// Official Tournament Results Constants
const OFFICIAL_RESULTS = {
  champion: 'Spain',
  runnerUp: 'Argentina',
  goldenBoot: 'Kylian Mbappé',
  goldenBall: 'Rodri'
};

// String normalization helper for resilient comparison
const normalizeStr = (str) => {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents (e.g. Mbappé -> Mbappe)
    .trim()
    .toLowerCase();
};

const OfficialResults = ({ backendUrl }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalParticipants: 0,
    correctChampion: 0,
    correctRunnerUp: 0,
    correctGoldenBoot: 0,
    correctGoldenBall: 0,
    highestScore: 0
  });
  const [jointWinners, setJointWinners] = useState([]);

  useEffect(() => {
    fetchResultsData();
  }, [backendUrl]);

  const fetchResultsData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch community stats summary to obtain all distinct prediction values cast
      const statsRes = await fetch(`${backendUrl}/api/predictions/stats`);
      const statsData = await statsRes.json();
      
      if (!statsRes.ok) {
        throw new Error(statsData.error || 'Failed to fetch prediction statistics.');
      }

      if (!statsData || statsData.totalPredictions === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Collect all distinct values for each field
      const fields = [
        { key: 'champion', items: statsData.championStats || [] },
        { key: 'runnerUp', items: statsData.runnerUpStats || [] },
        { key: 'goldenBoot', items: statsData.goldenBootStats || [] },
        { key: 'goldenBall', items: statsData.goldenBallStats || [] }
      ];

      // Build fetch queries for all predictor options
      const queries = [];
      fields.forEach(({ key, items }) => {
        items.forEach((item) => {
          if (item && item.name) {
            queries.push({
              key,
              val: item.name,
              promise: fetch(`${backendUrl}/api/predictions/predictors?field=${key}&value=${encodeURIComponent(item.name)}`)
                .then(res => res.json())
                .catch(err => [])
            });
          }
        });
      });

      const results = await Promise.all(queries.map(q => q.promise));

      // Aggregate predictions per user
      const userMap = {};

      queries.forEach((q, idx) => {
        const predictors = results[idx];
        if (Array.isArray(predictors)) {
          predictors.forEach((p) => {
            if (!p || !p._id) return;
            const uid = p._id;
            if (!userMap[uid]) {
              userMap[uid] = {
                userId: uid,
                name: p.name || 'Anonymous Fan',
                selectedTeam: p.selectedTeam || 'World',
                champion: '',
                runnerUp: '',
                goldenBoot: '',
                goldenBall: '',
                createdAt: p.createdAt || new Date().toISOString()
              };
            }
            userMap[uid][q.key] = q.val;
          });
        }
      });

      const rawUsers = Object.values(userMap);

      // Evaluate correctness and scores for each user
      const officialNorm = {
        champion: normalizeStr(OFFICIAL_RESULTS.champion),
        runnerUp: normalizeStr(OFFICIAL_RESULTS.runnerUp),
        goldenBoot: normalizeStr(OFFICIAL_RESULTS.goldenBoot),
        goldenBall: normalizeStr(OFFICIAL_RESULTS.goldenBall)
      };

      let countChampion = 0;
      let countRunnerUp = 0;
      let countGoldenBoot = 0;
      let countGoldenBall = 0;

      const scoredLeaderboard = rawUsers.map((user) => {
        const isChampionCorrect = normalizeStr(user.champion) === officialNorm.champion;
        const isRunnerUpCorrect = normalizeStr(user.runnerUp) === officialNorm.runnerUp;
        // Accept Mbappé or Mbappe or Kylian Mbappé
        const userBootNorm = normalizeStr(user.goldenBoot);
        const isGoldenBootCorrect = userBootNorm === officialNorm.goldenBoot || userBootNorm === 'kylian mbappe' || userBootNorm === 'mbappe';
        
        const isGoldenBallCorrect = normalizeStr(user.goldenBall) === officialNorm.goldenBall;

        let totalScore = 0;
        if (isChampionCorrect) {
          totalScore += 1;
          countChampion++;
        }
        if (isRunnerUpCorrect) {
          totalScore += 1;
          countRunnerUp++;
        }
        if (isGoldenBootCorrect) {
          totalScore += 1;
          countGoldenBoot++;
        }
        if (isGoldenBallCorrect) {
          totalScore += 1;
          countGoldenBall++;
        }

        return {
          ...user,
          isChampionCorrect,
          isRunnerUpCorrect,
          isGoldenBootCorrect,
          isGoldenBallCorrect,
          totalScore
        };
      });

      // Preserve original submission order as tie-breaker while sorting by totalScore descending
      // Standard JS Array.sort is stable
      scoredLeaderboard.sort((a, b) => b.totalScore - a.totalScore);

      const maxScore = scoredLeaderboard.length > 0 
        ? Math.max(...scoredLeaderboard.map(u => u.totalScore)) 
        : 0;

      const topPredictors = scoredLeaderboard.filter(u => u.totalScore === maxScore);

      setLeaderboard(scoredLeaderboard);
      setStats({
        totalParticipants: scoredLeaderboard.length,
        correctChampion: countChampion,
        correctRunnerUp: countRunnerUp,
        correctGoldenBoot: countGoldenBoot,
        correctGoldenBall: countGoldenBall,
        highestScore: maxScore
      });
      setJointWinners(topPredictors);
    } catch (err) {
      console.error('Error loading official results:', err);
      setError(err.message || 'Failed to load prediction results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl w-full mx-auto px-4 py-8 space-y-12 relative"
    >
      {/* Confetti Animation Background */}
      <Confetti count={40} />

      {/* Hero Section */}
      <div className="relative text-center py-10 md:py-16 px-4 rounded-3xl overflow-hidden glass-card border border-fifa-gold/30 bg-gradient-to-b from-fifa-dark/90 via-slate-900/80 to-fifa-dark/95 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-fifa-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fifa-gold/10 border border-fifa-gold/30 shadow-lg text-fifa-gold text-xs sm:text-sm font-extrabold uppercase tracking-widest"
          >
            <Trophy className="h-4 w-4 animate-bounce text-fifa-gold" />
            <span>Official Tournament Standings</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none">
            🏆 FIFA WORLD CUP 2026
            <span className="block text-gradient-gold mt-2 text-3xl sm:text-5xl md:text-6xl">
              Official Prediction Results
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Thank you to every football fan who participated in the Trionda Prediction League.
          </p>
        </div>
      </div>

      {/* Official Tournament Results (Premium Cards with Gold Glow) */}
      <div className="space-y-6">
        <div className="text-center md:text-left flex items-center gap-3 border-b border-white/10 pb-4">
          <Sparkles className="h-6 w-6 text-fifa-gold" />
          <h2 className="text-2xl font-black text-white tracking-tight">
            Official Tournament Winners
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Champion */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-6 text-center border-fifa-gold/50 shadow-[0_0_25px_rgba(245,184,46,0.2)] bg-gradient-to-b from-fifa-gold/10 via-slate-900/90 to-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-15 font-black text-6xl text-fifa-gold select-none">
                1
              </div>
              <div className="w-12 h-12 rounded-2xl bg-fifa-gold/20 border border-fifa-gold/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Trophy className="h-6 w-6 text-fifa-gold" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-fifa-gold block mb-1">
                World Cup Champion
              </span>
              <div className="flex items-center justify-center gap-2 text-xl font-black text-white mt-1">
                <Flag teamName={OFFICIAL_RESULTS.champion} className="w-8 h-5 object-cover rounded shadow-md" />
                <span>{OFFICIAL_RESULTS.champion}</span>
              </div>
            </Card>
          </motion.div>

          {/* Runner-Up */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-6 text-center border-slate-400/40 shadow-[0_0_20px_rgba(203,213,225,0.15)] bg-gradient-to-b from-slate-400/10 via-slate-900/90 to-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-15 font-black text-6xl text-slate-300 select-none">
                2
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-400/20 border border-slate-400/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Award className="h-6 w-6 text-slate-300" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-300 block mb-1">
                Runner-Up
              </span>
              <div className="flex items-center justify-center gap-2 text-xl font-black text-white mt-1">
                <Flag teamName={OFFICIAL_RESULTS.runnerUp} className="w-8 h-5 object-cover rounded shadow-md" />
                <span>{OFFICIAL_RESULTS.runnerUp}</span>
              </div>
            </Card>
          </motion.div>

          {/* Golden Boot */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-6 text-center border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-gradient-to-b from-rose-500/10 via-slate-900/90 to-slate-900 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <FootballIcon className="h-6 w-6 text-rose-400" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400 block mb-1">
                Golden Boot
              </span>
              <div className="text-xl font-black text-white mt-1 flex items-center justify-center gap-1.5">
                <span>⚽</span>
                <span>{OFFICIAL_RESULTS.goldenBoot}</span>
              </div>
            </Card>
          </motion.div>

          {/* Golden Ball */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-6 text-center border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-gradient-to-b from-emerald-500/10 via-slate-900/90 to-slate-900 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Star className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block mb-1">
                Golden Ball
              </span>
              <div className="text-xl font-black text-white mt-1 flex items-center justify-center gap-1.5">
                <span>⭐</span>
                <span>{OFFICIAL_RESULTS.goldenBall}</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recognition Section (🏆 Joint Top Predictors) */}
      <div className="space-y-6">
        <div className="text-center md:text-left flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-fifa-gold" />
            <h2 className="text-2xl font-black text-white tracking-tight">
              🏆 Joint Top Predictors
            </h2>
          </div>
          {jointWinners.length > 0 && (
            <span className="text-xs font-extrabold text-fifa-gold bg-fifa-gold/10 border border-fifa-gold/20 px-3 py-1 rounded-full">
              Highest Score: {stats.highestScore} / 4
            </span>
          )}
        </div>

        {loading ? (
          <Card className="p-8 text-center border-white/10">
            <Loader className="h-6 w-6 text-fifa-gold animate-spin mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Calculating top predictors...</p>
          </Card>
        ) : jointWinners.length === 0 ? (
          <Card className="p-8 text-center border-white/10">
            <p className="text-slate-400 text-sm">No predictions submitted yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {jointWinners.map((winner, idx) => (
              <motion.div
                key={winner.userId || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className="p-5 flex items-center justify-between border-fifa-gold/40 bg-gradient-to-r from-fifa-gold/15 to-slate-900/80 shadow-[0_0_20px_rgba(245,184,46,0.15)] hover:border-fifa-gold/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {winner.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Flag teamName={winner.selectedTeam} />
                        <span>{winner.selectedTeam}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-fifa-gold block">
                      Score
                    </span>
                    <span className="text-lg font-black text-white">
                      {winner.totalScore} / 4
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Prediction Leaderboard Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-fifa-azure" />
            <h2 className="text-2xl font-black text-white tracking-tight">
              Prediction Leaderboard
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {leaderboard.length} Participant{leaderboard.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <Card className="p-12 text-center border-white/10">
            <Loader className="h-8 w-8 text-fifa-gold animate-spin mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-base">Fetching and scoring live predictions...</p>
            <p className="text-slate-500 text-xs mt-1">Comparing user ballots against official World Cup 2026 outcomes.</p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center border-red-500/20 bg-red-500/5 text-red-400">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-400 mb-2" />
            <p className="text-sm">{error}</p>
          </Card>
        ) : leaderboard.length === 0 ? (
          <Card className="p-12 text-center border-white/10">
            <Trophy className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Predictions Found</h3>
            <p className="text-slate-400 text-sm mt-1">Be the first to submit predictions and appear on the official leaderboard!</p>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden border-white/10 shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] font-extrabold border-b border-white/10">
                    <th className="py-4 px-4 text-center">Rank</th>
                    <th className="py-4 px-4">User Name</th>
                    <th className="py-4 px-4">Fan Club</th>
                    <th className="py-4 px-4">Champion Pick</th>
                    <th className="py-4 px-4">Runner-Up Pick</th>
                    <th className="py-4 px-4">Golden Boot Pick</th>
                    <th className="py-4 px-4">Golden Ball Pick</th>
                    <th className="py-4 px-3 text-center" title="Champion Correct (Spain)">🏆</th>
                    <th className="py-4 px-3 text-center" title="Runner-Up Correct (Argentina)">🥈</th>
                    <th className="py-4 px-3 text-center" title="Golden Boot Correct (Kylian Mbappé)">⚽</th>
                    <th className="py-4 px-3 text-center" title="Golden Ball Correct (Rodri)">⭐</th>
                    <th className="py-4 px-5 text-right font-black text-fifa-gold">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((user, idx) => {
                    const rank = idx + 1;
                    const isTopThree = rank <= 3;
                    const rankBg = rank === 1 ? 'text-amber-300' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-slate-400';

                    return (
                      <tr
                        key={user.userId || idx}
                        className="hover:bg-slate-800/50 transition-colors duration-200 group"
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center font-bold">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${isTopThree ? 'bg-white/5 border border-white/10 font-extrabold' : ''} ${rankBg}`}>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                          </span>
                        </td>

                        {/* User Name */}
                        <td className="py-4 px-4 font-bold text-white group-hover:text-fifa-gold transition-colors whitespace-nowrap">
                          {user.name}
                        </td>

                        {/* Fan Club */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                            <Flag teamName={user.selectedTeam} />
                            <span>{user.selectedTeam}</span>
                          </span>
                        </td>

                        {/* Champion Pick */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 ${user.isChampionCorrect ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            <Flag teamName={user.champion} />
                            <span>{user.champion || '-'}</span>
                          </span>
                        </td>

                        {/* Runner-Up Pick */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 ${user.isRunnerUpCorrect ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            <Flag teamName={user.runnerUp} />
                            <span>{user.runnerUp || '-'}</span>
                          </span>
                        </td>

                        {/* Golden Boot Pick */}
                        <td className={`py-4 px-4 whitespace-nowrap ${user.isGoldenBootCorrect ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          {user.goldenBoot || '-'}
                        </td>

                        {/* Golden Ball Pick */}
                        <td className={`py-4 px-4 whitespace-nowrap ${user.isGoldenBallCorrect ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          {user.goldenBall || '-'}
                        </td>

                        {/* Champion Correct */}
                        <td className="py-4 px-3 text-center">
                          {user.isChampionCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 inline-block" title="Correct (+1)" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500/70 inline-block" title="Incorrect (0)" />
                          )}
                        </td>

                        {/* Runner-Up Correct */}
                        <td className="py-4 px-3 text-center">
                          {user.isRunnerUpCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 inline-block" title="Correct (+1)" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500/70 inline-block" title="Incorrect (0)" />
                          )}
                        </td>

                        {/* Golden Boot Correct */}
                        <td className="py-4 px-3 text-center">
                          {user.isGoldenBootCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 inline-block" title="Correct (+1)" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500/70 inline-block" title="Incorrect (0)" />
                          )}
                        </td>

                        {/* Golden Ball Correct */}
                        <td className="py-4 px-3 text-center">
                          {user.isGoldenBallCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 inline-block" title="Correct (+1)" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500/70 inline-block" title="Incorrect (0)" />
                          )}
                        </td>

                        {/* Total Score */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-fifa-gold/15 border border-fifa-gold/40 text-fifa-gold font-black text-sm shadow-md">
                            {user.totalScore} / 4
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Statistics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Flame className="h-6 w-6 text-fifa-gold" />
          <h2 className="text-2xl font-black text-white tracking-tight">
            League Statistics
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Participants */}
          <Card className="p-4 text-center border-white/10 bg-slate-900/70">
            <Users className="h-5 w-5 text-fifa-azure mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Total Participants
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {stats.totalParticipants}
            </span>
          </Card>

          {/* Correct Champion */}
          <Card className="p-4 text-center border-white/10 bg-slate-900/70">
            <Trophy className="h-5 w-5 text-fifa-gold mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Spain Pickers
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {stats.correctChampion}
            </span>
          </Card>

          {/* Correct Runner-Up */}
          <Card className="p-4 text-center border-white/10 bg-slate-900/70">
            <Award className="h-5 w-5 text-slate-300 mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Argentina Pickers
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {stats.correctRunnerUp}
            </span>
          </Card>

          {/* Correct Golden Boot */}
          <Card className="p-4 text-center border-white/10 bg-slate-900/70">
            <FootballIcon className="h-5 w-5 text-rose-400 mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Mbappé Pickers
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {stats.correctGoldenBoot}
            </span>
          </Card>

          {/* Correct Golden Ball */}
          <Card className="p-4 text-center border-white/10 bg-slate-900/70">
            <Star className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Rodri Pickers
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {stats.correctGoldenBall}
            </span>
          </Card>

          {/* Highest Score */}
          <Card className="p-4 text-center border-fifa-gold/30 bg-fifa-gold/5">
            <Sparkles className="h-5 w-5 text-fifa-gold mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-fifa-gold block">
              Top Score
            </span>
            <span className="text-2xl font-black text-fifa-gold mt-1 block">
              {stats.highestScore} / 4
            </span>
          </Card>
        </div>
      </div>

      {/* Thank-You Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 sm:p-12 text-center border-fifa-gold/30 bg-gradient-to-b from-slate-900/90 via-fifa-dark to-slate-900/90 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-fifa-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-fifa-gold/10 border border-fifa-gold/30 flex items-center justify-center mx-auto shadow-lg">
              <Heart className="h-8 w-8 text-fifa-gold fill-fifa-gold/30" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Thank You Football Fans!
            </h3>

            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
              Thank you to everyone who joined the Trionda FIFA World Cup 2026 Prediction League.
              Your passion made this event unforgettable.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3 text-fifa-gold font-black text-lg sm:text-xl uppercase tracking-widest">
              <span>Predict.</span>
              <span>•</span>
              <span>Play.</span>
              <span>•</span>
              <span>Celebrate.</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default OfficialResults;
