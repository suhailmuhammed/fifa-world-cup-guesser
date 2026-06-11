import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './UI/Card';
import Button from './UI/Button';
import { Users, AlertCircle } from 'lucide-react';

export const TEAMS_LIST = [
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Iran', flag: '🇮🇷' },
  { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { name: 'Poland', flag: '🇵🇱' },
  { name: 'Tunisia', flag: '🇹🇳' },
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Serbia', flag: '🇷🇸' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Costa Rica', flag: '🇨🇷' }
].sort((a, b) => a.name.localeCompare(b.name));

const JoinForm = ({ onJoinSuccess, backendUrl }) => {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!team) {
      setError('Please select your favorite team.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, selectedTeam: team })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join. Please try again.');
      }

      onJoinSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto px-4"
    >
      <Card className="p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-fifa-blue/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-fifa-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-fifa-gold/10 rounded-full border border-fifa-gold/25 mb-4">
            <Users className="h-8 w-8 text-fifa-gold" />
          </div>
          <h2 className="text-2xl font-extrabold text-white text-center">
            Join a Fan Club
          </h2>
          <p className="text-slate-400 text-sm mt-1 text-center">
            Enter your details below to pledge allegiance to your nation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Suhail"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-fifa-gold transition-colors duration-200"
            />
          </div>

          {/* Favorite Team Field */}
          <div>
            <label htmlFor="team" className="block text-sm font-semibold text-slate-300 mb-1.5">
              Favorite World Cup Team
            </label>
            <div className="relative">
              <select
                id="team"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-fifa-gold transition-colors duration-200 cursor-pointer"
              >
                <option value="" className="bg-slate-950 text-slate-500">Select Team...</option>
                {TEAMS_LIST.map((t) => (
                  <option key={t.name} value={t.name} className="bg-slate-950 text-white">
                    {t.flag} &nbsp; {t.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm"
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
            className="w-full mt-2"
          >
            Join Fan Club
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};

export default JoinForm;
