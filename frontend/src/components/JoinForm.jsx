import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './UI/Card';
import Button from './UI/Button';
import TeamSelect from './UI/TeamSelect';
import { Users, AlertCircle } from 'lucide-react';
import { TEAMS_LIST } from '../data/teams';

const JoinForm = ({ onJoinSuccess, backendUrl }) => {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // PIN steps: 'form', 'setup-pin', 'verify-pin'
  const [step, setStep] = useState('form');
  const [existingUser, setExistingUser] = useState(null);
  const [pin, setPin] = useState('');

  const handlePinChange = (val) => {
    if (/^\d*$/.test(val) && val.length <= 4) {
      setPin(val);
    }
  };

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
      // Step 1: Check if prediction exists for this combination
      const checkResponse = await fetch(`${backendUrl}/api/users/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, selectedTeam: team })
      });

      const checkData = await checkResponse.json();
      if (!checkResponse.ok) {
        throw new Error(checkData.error || 'Validation failed. Please try again.');
      }

      if (checkData.exists) {
        // Existing user found!
        setExistingUser(checkData);
        setPin('');
        if (checkData.pinExists) {
          setStep('verify-pin');
        } else {
          setStep('setup-pin');
        }
      } else {
        // New user! Go to PIN creation step
        setPin('');
        setStep('create-pin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const trimmedName = name.trim();
      const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, selectedTeam: team, pin })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile. Please try again.');
      }

      onJoinSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/users/setup-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: existingUser.userId, pin })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set PIN. Please try again.');
      }

      onJoinSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/users/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: existingUser.userId, pin })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Incorrect PIN or verification failed.');
      }

      onJoinSuccess(data.user);
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

        {step === 'form' && (
          <>
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
          </>
        )}

        {step === 'create-pin' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-fifa-gold/10 rounded-full border border-fifa-gold/25 mb-4">
                <Users className="h-8 w-8 text-fifa-gold" />
              </div>
              <h2 className="text-2xl font-extrabold text-white text-center">
                Welcome to Trionda
              </h2>
              <p className="text-slate-400 text-sm mt-1 text-center">
                Create a 4-digit security PIN to establish your profile.
              </p>
            </div>

            <form onSubmit={handleCreatePinSubmit} className="space-y-5">
              <div>
                <label htmlFor="create-pin" className="block text-sm font-semibold text-slate-300 mb-2 text-center">
                  Create 4-Digit PIN
                </label>
                <input
                  type="password"
                  id="create-pin"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="w-48 mx-auto block bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-2xl tracking-[0.5em] focus:outline-none focus:border-fifa-gold transition-colors duration-200"
                  autoFocus
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
                disabled={pin.length !== 4}
              >
                Create Profile & Login
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setPin('');
                  setError('');
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors mt-2"
              >
                Back to Login / Registration
              </button>
            </form>
          </>
        )}

        {step === 'setup-pin' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-fifa-gold/10 rounded-full border border-fifa-gold/25 mb-4">
                <Users className="h-8 w-8 text-fifa-gold" />
              </div>
              <h2 className="text-2xl font-extrabold text-white text-center">
                👋 Welcome Back {existingUser.name}
              </h2>
              <p className="text-slate-400 text-sm mt-2 text-center">
                We found your existing prediction for: <span className="text-fifa-gold font-bold">{existingUser.selectedTeam}</span>
              </p>
              <p className="text-slate-400 text-xs mt-3 text-center">
                To secure your profile and future game progress, create a 4-digit PIN.
              </p>
            </div>

            <form onSubmit={handleSetupPinSubmit} className="space-y-5">
              <div>
                <label htmlFor="setup-pin" className="block text-sm font-semibold text-slate-300 mb-2 text-center">
                  Create 4-Digit PIN
                </label>
                <input
                  type="password"
                  id="setup-pin"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="w-48 mx-auto block bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-2xl tracking-[0.5em] focus:outline-none focus:border-fifa-gold transition-colors duration-200"
                  autoFocus
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
                disabled={pin.length !== 4}
              >
                Secure Account & Login
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setPin('');
                  setError('');
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors mt-2"
              >
                Back to Login / Registration
              </button>
            </form>
          </>
        )}

        {step === 'verify-pin' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-fifa-gold/10 rounded-full border border-fifa-gold/25 mb-4">
                <Users className="h-8 w-8 text-fifa-gold" />
              </div>
              <h2 className="text-2xl font-extrabold text-white text-center">
                Welcome Back {existingUser.name}
              </h2>
              <p className="text-slate-400 text-sm mt-1 text-center">
                Enter your 4-digit PIN.
              </p>
            </div>

            <form onSubmit={handleVerifyPinSubmit} className="space-y-5">
              <div>
                <label htmlFor="verify-pin" className="block text-sm font-semibold text-slate-300 mb-2 text-center">
                  PIN Validation
                </label>
                <input
                  type="password"
                  id="verify-pin"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="w-48 mx-auto block bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-2xl tracking-[0.5em] focus:outline-none focus:border-fifa-gold transition-colors duration-200"
                  autoFocus
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
                disabled={pin.length !== 4}
              >
                Validate PIN & Login
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setPin('');
                  setError('');
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors mt-2"
              >
                Back to Login / Registration
              </button>
            </form>
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default JoinForm;
