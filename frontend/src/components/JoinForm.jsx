import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './UI/Card';
import Button from './UI/Button';
import TeamSelect from './UI/TeamSelect';
import { Users, AlertCircle } from 'lucide-react';

export const TEAMS_LIST = [
  { name: 'Argentina', code: 'AR', flag: 'https://flagcdn.com/ar.svg' },
  { name: 'Australia', code: 'AU', flag: 'https://flagcdn.com/au.svg' },
  { name: 'Belgium', code: 'BE', flag: 'https://flagcdn.com/be.svg' },
  { name: 'Brazil', code: 'BR', flag: 'https://flagcdn.com/br.svg' },
  { name: 'Cameroon', code: 'CM', flag: 'https://flagcdn.com/cm.svg' },
  { name: 'Canada', code: 'CA', flag: 'https://flagcdn.com/ca.svg' },
  { name: 'Costa Rica', code: 'CR', flag: 'https://flagcdn.com/cr.svg' },
  { name: 'Croatia', code: 'HR', flag: 'https://flagcdn.com/hr.svg' },
  { name: 'Denmark', code: 'DK', flag: 'https://flagcdn.com/dk.svg' },
  { name: 'Ecuador', code: 'EC', flag: 'https://flagcdn.com/ec.svg' },
  { name: 'England', code: 'GB-ENG', flag: 'https://flagcdn.com/gb-eng.svg' },
  { name: 'France', code: 'FR', flag: 'https://flagcdn.com/fr.svg' },
  { name: 'Germany', code: 'DE', flag: 'https://flagcdn.com/de.svg' },
  { name: 'Ghana', code: 'GH', flag: 'https://flagcdn.com/gh.svg' },
  { name: 'Iran', code: 'IR', flag: 'https://flagcdn.com/ir.svg' },
  { name: 'Japan', code: 'JP', flag: 'https://flagcdn.com/jp.svg' },
  { name: 'Mexico', code: 'MX', flag: 'https://flagcdn.com/mx.svg' },
  { name: 'Morocco', code: 'MA', flag: 'https://flagcdn.com/ma.svg' },
  { name: 'Netherlands', code: 'NL', flag: 'https://flagcdn.com/nl.svg' },
  { name: 'Poland', code: 'PL', flag: 'https://flagcdn.com/pl.svg' },
  { name: 'Portugal', code: 'PT', flag: 'https://flagcdn.com/pt.svg' },
  { name: 'Qatar', code: 'QA', flag: 'https://flagcdn.com/qa.svg' },
  { name: 'Saudi Arabia', code: 'SA', flag: 'https://flagcdn.com/sa.svg' },
  { name: 'Senegal', code: 'SN', flag: 'https://flagcdn.com/sn.svg' },
  { name: 'Serbia', code: 'RS', flag: 'https://flagcdn.com/rs.svg' },
  { name: 'South Korea', code: 'KR', flag: 'https://flagcdn.com/kr.svg' },
  { name: 'Spain', code: 'ES', flag: 'https://flagcdn.com/es.svg' },
  { name: 'Switzerland', code: 'CH', flag: 'https://flagcdn.com/ch.svg' },
  { name: 'Tunisia', code: 'TN', flag: 'https://flagcdn.com/tn.svg' },
  { name: 'USA', code: 'US', flag: 'https://flagcdn.com/us.svg' },
  { name: 'Uruguay', code: 'UY', flag: 'https://flagcdn.com/uy.svg' },
  { name: 'Wales', code: 'GB-WLS', flag: 'https://flagcdn.com/gb-wls.svg' }
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
      <Card className="p-8 shadow-2xl relative">
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
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Favorite World Cup Team
            </label>
            <TeamSelect
              options={TEAMS_LIST}
              value={team}
              onChange={setTeam}
              placeholder="Select Team..."
              id="team-select"
            />
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
