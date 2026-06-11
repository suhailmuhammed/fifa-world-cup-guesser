import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Search, ChevronDown, ChevronUp, Loader, AlertTriangle, RefreshCw } from 'lucide-react';
import Card from './UI/Card';
import { getTeamEmoji } from './Navbar';
import { TEAMS_LIST } from './JoinForm';

const NationsOverview = ({ backendUrl }) => {
  const [clubsData, setClubsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'inactive'
  const [expandedNations, setExpandedNations] = useState({});

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

  const toggleNationExpand = (nationName) => {
    setExpandedNations(prev => ({
      ...prev,
      [nationName]: !prev[nationName]
    }));
  };

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
      className="max-w-6xl w-full mx-auto px-4 py-8 space-y-8"
    >
      {/* Title Header */}
      <div className="relative glass-card p-8 rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-fifa-blue/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div className="p-4 bg-fifa-azure/10 border border-fifa-azure/20 rounded-2xl text-fifa-azure">
            <Globe className="h-8 w-8" />
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
            const isExpanded = !!expandedNations[nation.name];

            return (
              <div
                key={nation.name}
                className={`rounded-2xl border transition-all duration-300 h-fit overflow-hidden ${
                  hasFans
                    ? 'bg-slate-900/60 border-fifa-gold/20 hover:border-fifa-gold/45 shadow-lg shadow-fifa-gold/5'
                    : 'bg-slate-950/20 border-white/5 opacity-60'
                }`}
              >
                {/* Nation Card Header */}
                <div
                  onClick={() => hasFans && toggleNationExpand(nation.name)}
                  className={`p-4.5 flex justify-between items-center ${
                    hasFans ? 'cursor-pointer select-none hover:bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none" role="img" aria-label="Flag">
                      {nation.flag}
                    </span>
                    <div>
                      <span className="font-extrabold text-sm text-slate-100 block">{nation.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">World Cup Team</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        hasFans
                          ? 'bg-fifa-gold/15 text-fifa-gold border border-fifa-gold/25'
                          : 'bg-white/5 text-slate-600'
                      }`}
                    >
                      {nation.fans.length} fan{nation.fans.length !== 1 ? 's' : ''}
                    </span>
                    {hasFans && (
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Roster list */}
                {hasFans && isExpanded && (
                  <div className="bg-slate-950/70 border-t border-white/5 p-3.5 space-y-2 max-h-48 overflow-y-auto animate-in slide-in-from-top duration-250">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                      <Users className="h-3 w-3 text-fifa-gold" /> Registered Supporters:
                    </span>
                    {nation.fans.map((fanName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-2 px-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="font-bold text-slate-200">{fanName}</span>
                        <span className="text-[9px] text-fifa-gold font-extrabold bg-fifa-gold/10 px-2 py-0.5 rounded-md">Supporter</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default NationsOverview;
