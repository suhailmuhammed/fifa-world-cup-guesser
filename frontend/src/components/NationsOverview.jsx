import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Search, AlertTriangle, Loader, RefreshCw } from 'lucide-react';
import Card from './UI/Card';
import Flag from './UI/Flag';
import { TEAMS_LIST } from '../data/teams';

const NationsOverview = ({ backendUrl }) => {
  const [clubsData, setClubsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'inactive'
  const [selectedNation, setSelectedNation] = useState(null);

  const fetchClubsData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/api/clubs`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch nations directory.');
      }
      setClubsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubsData();
  }, [backendUrl]);

  // Build the list of nations with their fans
  const getNationsList = () => {
    return TEAMS_LIST.map(team => {
      // Find fans in clubsData (case-insensitive selection matching)
      const matchedKey = Object.keys(clubsData).find(
        key => key.toLowerCase() === team.name.toLowerCase()
      );
      const fans = matchedKey ? clubsData[matchedKey] : [];
      return {
        ...team,
        fans
      };
    });
  };

  const allNations = getNationsList();

  // Calculate total fans in the community
  const totalFans = Object.values(clubsData).reduce((sum, fans) => sum + (fans?.length || 0), 0);

  // Filter nations
  const filteredNations = allNations.filter(nation => {
    const matchesSearch = nation.name.toLowerCase().includes(searchQuery.toLowerCase());
    const hasFans = nation.fans.length > 0;

    if (!matchesSearch) return false;
    if (filterMode === 'active') return hasFans;
    if (filterMode === 'inactive') return !hasFans;
    return true;
  });

  // Sort nations: countries with fans first, then alphabetical
  const sortedNations = [...filteredNations].sort((a, b) => {
    if (a.fans.length !== b.fans.length) {
      return b.fans.length - a.fans.length;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl w-full mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300"
    >
      {/* Title Header */}
      <div className="relative glass-card p-8 rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-fifa-blue/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div className="p-4 bg-fifa-azure/10 border border-fifa-azure/20 rounded-2xl text-fifa-azure">
            <Globe className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              World Nations Fan Directory
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 flex items-center gap-1.5 justify-center md:justify-start">
              See which countries have pledged fans and who is supporting each team.
            </p>
          </div>
        </div>

        <button
          onClick={fetchClubsData}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-2 text-xs font-semibold shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fifa-gold transition-colors duration-200"
          />
          <Search className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
        </div>

        {/* Filter buttons */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 gap-1 w-fit">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'all' 
                ? 'bg-fifa-gold text-slate-950 font-extrabold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Teams ({allNations.length})
          </button>
          <button
            onClick={() => setFilterMode('active')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'active' 
                ? 'bg-fifa-gold text-slate-950 font-extrabold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            With Fans ({allNations.filter(n => n.fans.length > 0).length})
          </button>
          <button
            onClick={() => setFilterMode('inactive')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'inactive' 
                ? 'bg-fifa-gold text-slate-950 font-extrabold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            No Fans ({allNations.filter(n => n.fans.length === 0).length})
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader className="h-8 w-8 text-fifa-gold animate-spin" />
          <span className="text-slate-400 font-semibold text-sm">Loading nations directory...</span>
        </div>
      ) : error ? (
        <Card className="p-6 border-red-500/20 bg-red-500/5 text-center text-red-400">
          <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
          <p>{error}</p>
          <button 
            onClick={fetchClubsData}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl transition duration-200 text-xs flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </button>
        </Card>
      ) : sortedNations.length === 0 ? (
        <div className="p-16 glass-card rounded-3xl text-center border border-white/5">
          <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 font-semibold">No countries found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedNations.map((nation) => {
            const hasFans = nation.fans.length > 0;
            const fanPercentage = totalFans > 0 ? Math.round((nation.fans.length / totalFans) * 100) : 0;

            return (
              <div
                key={nation.name}
                onClick={() => hasFans && setSelectedNation(nation)}
                className={`rounded-xl border transition-all duration-200 p-3.5 flex items-center justify-between relative group ${
                  hasFans
                    ? 'cursor-pointer bg-slate-900/50 border-fifa-gold/20 hover:border-fifa-gold/50 shadow-md shadow-fifa-gold/5 hover:bg-slate-800/40 hover:scale-[1.01]'
                    : 'bg-slate-950/10 border-white/5 opacity-50'
                }`}
              >
                {/* FIFA style subtle hover glow */}
                {hasFans && (
                  <div className="absolute inset-0 bg-gradient-to-r from-fifa-gold/0 to-fifa-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center select-none shrink-0">
                    <Flag teamName={nation.name} className="w-8 h-6 object-cover rounded shadow-sm border border-white/5" />
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-100 block truncate group-hover:text-fifa-gold transition-colors">{nation.name}</span>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{nation.confederation || "World Cup Team"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                      hasFans
                        ? 'bg-fifa-gold/15 text-fifa-gold border border-fifa-gold/25'
                        : 'bg-white/5 text-slate-600'
                    }`}
                  >
                    {nation.fans.length} Fan{nation.fans.length !== 1 ? 's' : ''}
                  </span>
                  {hasFans && (
                    <span className="text-[10px] text-slate-400 font-bold min-w-[24px] text-right">
                      {fanPercentage}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supporter Modal */}
      <AnimatePresence>
        {selectedNation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNation(null)}
              className="absolute inset-0 bg-fifa-dark/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md glass-card rounded-3xl overflow-hidden border border-fifa-gold/30 shadow-2xl flex flex-col max-h-[80vh] z-10 bg-slate-900"
            >
              {/* Gold Top Light Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-fifa-gold" />

              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <Flag teamName={selectedNation.name} className="w-10 h-7 object-cover rounded-md shadow-md border border-white/10" />
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      🏆 {selectedNation.name} Supporters
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNation(null)}
                  className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3 flex-grow custom-scrollbar">
                {selectedNation.fans.map((fanName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 bg-slate-800/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fifa-blue to-fifa-azure flex items-center justify-center font-bold text-white text-xs">
                      👤
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{fanName}</h4>
                      <span className="text-[10px] text-fifa-gold/80 font-semibold tracking-wider uppercase">Verified Fan</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-white/10 bg-slate-950/40 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">
                  Total Fans: <span className="font-black text-fifa-gold text-sm">{selectedNation.fans.length}</span>
                </span>
                <button
                  onClick={() => setSelectedNation(null)}
                  className="text-[10px] font-extrabold text-slate-300 hover:text-white uppercase tracking-widest px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
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

export default NationsOverview;
