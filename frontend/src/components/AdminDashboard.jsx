import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Users, Trophy, Award, RefreshCw, Sparkles, 
  AlertTriangle, Loader, Lock, LogOut, Search, Trash2, 
  Globe, Calendar, Eye, EyeOff, CheckCircle2, ChevronDown, ChevronUp, X 
} from 'lucide-react';
import Card from './UI/Card';
import Flag from './UI/Flag';
import { TEAMS_LIST } from './JoinForm';

const AdminDashboard = ({ backendUrl }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'countries', 'users'

  // Analytics stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // User list
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [expandedCountries, setExpandedCountries] = useState({});
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Check sessionStorage for existing authentication on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      setAdminPassword(savedPassword);
      setIsAuthenticated(true);
    } else {
      setStatsLoading(false);
    }
  }, []);

  // Fetch stats and users when authenticated
  useEffect(() => {
    if (isAuthenticated && adminPassword) {
      fetchAdminStats(adminPassword);
      fetchAdminUsers(adminPassword);
    }
  }, [isAuthenticated, adminPassword, backendUrl]);

  const fetchAdminStats = async (pwd = adminPassword) => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const response = await fetch(`${backendUrl}/api/admin/stats`, {
        headers: { 'x-admin-password': pwd }
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.error || 'Failed to fetch statistics.');
      }
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAdminUsers = async (pwd = adminPassword) => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        headers: { 'x-admin-password': pwd }
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.error || 'Failed to fetch users.');
      }
      setUsers(data);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid admin password.');
      }

      sessionStorage.setItem('admin_password', password);
      setAdminPassword(password);
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_password');
    setAdminPassword('');
    setIsAuthenticated(false);
    setPassword('');
    setStats(null);
    setUsers([]);
    setActiveTab('analytics');
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${deleteConfirmUser._id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user.');
      }

      // Refresh data
      await Promise.all([
        fetchAdminStats(adminPassword),
        fetchAdminUsers(adminPassword)
      ]);
      setDeleteConfirmUser(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleCountryExpand = (countryName) => {
    setExpandedCountries(prev => ({
      ...prev,
      [countryName]: !prev[countryName]
    }));
  };

  const reloadAllData = () => {
    fetchAdminStats(adminPassword);
    fetchAdminUsers(adminPassword);
  };

  // Setup Countries Fan Directory
  const getCountriesFanData = () => {
    const countryFansMap = {};
    
    // Initialize all 32 teams with empty fans list
    TEAMS_LIST.forEach(team => {
      countryFansMap[team.name.toLowerCase()] = {
        teamName: team.name,
        flag: team.flag,
        fans: []
      };
    });

    // Map users to countries
    users.forEach(user => {
      const teamKey = user.selectedTeam.toLowerCase();
      if (countryFansMap[teamKey]) {
        countryFansMap[teamKey].fans.push(user);
      } else {
        // Fallback for custom teams not in TEAMS_LIST
        countryFansMap[teamKey] = {
          teamName: user.selectedTeam,
          flag: '⚽',
          fans: [user]
        };
      }
    });

    return Object.values(countryFansMap).sort((a, b) => b.fans.length - a.fans.length || a.teamName.localeCompare(b.teamName));
  };

  // Filter users based on query
  const getFilteredUsers = () => {
    return users.filter(user => {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.selectedTeam.toLowerCase().includes(query) ||
        (user.prediction && user.prediction.champion.toLowerCase().includes(query))
      );
    });
  };

  // Format date utility
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  // --- RENDERING LOCK SCREEN ---
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="max-w-md w-full mx-auto px-4 py-12"
      >
        <Card className="p-8 shadow-2xl relative overflow-hidden border-red-500/20">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-fifa-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 mb-4 animate-pulse">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight text-center">
              Admin Console Locked
            </h2>
            <p className="text-slate-400 text-xs mt-1 text-center font-medium max-w-[280px]">
              Please enter the local admin password to gain access to database actions.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPasswordText ? "text" : "password"}
                  placeholder="Enter administrator password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-4 pr-11 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all duration-200"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPasswordText ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-red-500/10 active:scale-[0.98] transition-all duration-200 text-sm flex items-center justify-center gap-2 border border-red-500/35"
            >
              {loginLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  <span>Unlock Console</span>
                </>
              )}
            </button>
          </form>
        </Card>
      </motion.div>
    );
  }

  // --- RENDERING LOADING OR GENERAL ERRORS ---
  if (statsLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader className="h-8 w-8 text-red-500 animate-spin" />
        <span className="text-slate-400 font-semibold text-sm">Loading admin dashboard console...</span>
      </div>
    );
  }

  const countriesFanData = getCountriesFanData();
  const filteredUsers = getFilteredUsers();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl w-full mx-auto px-4 py-8 space-y-8"
    >
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
        
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-red-400 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1.5 w-fit">
            <ShieldAlert className="h-3.5 w-3.5" /> Administrator Mode
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-3">
            FIFA Fan Guesser Console
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Realtime database aggregates, full country fan rosters, and user management.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={reloadAllData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500/20 transition-all duration-200 flex items-center gap-2 text-xs font-bold"
          >
            <LogOut className="h-4 w-4" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/5 gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Analytics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('countries')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'countries'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Countries & Fans ({TEAMS_LIST.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Manage Users ({users.length})</span>
        </button>
      </div>

      {/* ERROR MESSAGE (Stats or Users fetch failed) */}
      {(statsError || usersError) && (
        <Card className="p-5 border-red-500/20 bg-red-500/5 text-red-400 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Dashboard Data Out of Sync</h3>
            <p className="text-xs text-slate-400 mt-1">{statsError || usersError}</p>
          </div>
        </Card>
      )}

      {/* --- CONTENT TABS RENDERING --- */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && stats && (
          <motion.div
            key="tab-analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Registered Fans</span>
                    <span className="block text-4xl font-black text-white mt-2">{stats.totalUsers}</span>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ballots Submitted</span>
                    <span className="block text-4xl font-black text-white mt-2">{stats.totalPredictions}</span>
                  </div>
                  <div className="p-3 bg-fifa-gold/10 border border-fifa-gold/20 rounded-2xl text-fifa-gold">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Community Favorite</span>
                    <span className="block text-lg font-black text-white mt-2.5 flex items-center gap-2">
                      {stats.topChampion ? (
                        <>
                          <span className="inline-flex items-center"><Flag teamName={stats.topChampion.name} /></span>
                          <span className="truncate">{stats.topChampion.name}</span>
                          <span className="text-xs font-semibold text-fifa-gold">({stats.topChampion.percentage}%)</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-slate-500 italic">No votes yet</span>
                      )}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Popular Fan Clubs */}
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    📊 Fan Club Memberships
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Ranking of teams with registered fans.</p>
                </div>

                {stats.teamPopularity && stats.teamPopularity.length > 0 ? (
                  <div className="divide-y divide-white/5 max-h-[320px] overflow-y-auto pr-2">
                    {stats.teamPopularity.map((item, idx) => (
                      <div key={idx} className="py-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <span className="inline-flex items-center select-none"><Flag teamName={item.team} /></span>
                            <span>{item.team}</span>
                          </span>
                          <span className="text-xs font-bold text-fifa-gold bg-fifa-gold/10 border border-fifa-gold/15 px-2.5 py-1 rounded-lg">
                            {item.count} fan{item.count > 1 ? 's' : ''}
                          </span>
                        </div>
                        {item.members && item.members.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pl-7">
                            {item.members.map((name, mIdx) => (
                              <span 
                                key={mIdx} 
                                className="text-[10px] font-bold text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic text-center py-8">No fan activity yet.</p>
                )}
              </Card>

              {/* Top Community Picks */}
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    🔥 Leading Community Picks
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Leading candidate predictions for individual awards.</p>
                </div>

                <div className="space-y-4">
                  {/* Top Golden Boot */}
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">Top Golden Boot Vote</span>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="h-4.5 w-4.5 text-rose-500" />
                        {stats.topGoldenBoot ? stats.topGoldenBoot.name : 'No votes yet'}
                      </span>
                      {stats.topGoldenBoot && (
                        <span className="text-xs text-fifa-gold font-bold">{stats.topGoldenBoot.percentage}% of votes</span>
                      )}
                    </div>
                  </div>

                  {/* Top Golden Ball */}
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">Top Golden Ball Vote</span>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="h-4.5 w-4.5 text-amber-500" />
                        {stats.topGoldenBall ? stats.topGoldenBall.name : 'No votes yet'}
                      </span>
                      {stats.topGoldenBall && (
                        <span className="text-xs text-fifa-gold font-bold">{stats.topGoldenBall.percentage}% of votes</span>
                      )}
                    </div>
                  </div>

                  {/* Top Champion Pick */}
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">Top Champion Vote</span>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Trophy className="h-4.5 w-4.5 text-fifa-gold" />
                        {stats.topChampion ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Flag teamName={stats.topChampion.name} />
                            <span>{stats.topChampion.name}</span>
                          </span>
                        ) : 'No votes yet'}
                      </span>
                      {stats.topChampion && (
                        <span className="text-xs text-fifa-gold font-bold">{stats.topChampion.percentage}% of votes</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 2: COUNTRIES & FANS */}
        {activeTab === 'countries' && (
          <motion.div
            key="tab-countries"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-white">World Cup Countries Fan Directory</h2>
                <p className="text-xs text-slate-400">Showing all 32 qualified nations and their pledge rosters.</p>
              </div>
              <span className="text-xs text-slate-400 font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                Active Countries: {countriesFanData.filter(c => c.fans.length > 0).length} / 32
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {countriesFanData.map((country) => {
                const hasFans = country.fans.length > 0;
                const isExpanded = !!expandedCountries[country.teamName];
                
                return (
                  <div 
                    key={country.teamName}
                    className={`rounded-xl border transition-all duration-200 h-fit overflow-hidden ${
                      hasFans 
                        ? 'bg-slate-900/60 border-fifa-gold/20 hover:border-fifa-gold/40 shadow-md shadow-fifa-gold/5' 
                        : 'bg-slate-950/20 border-white/5 opacity-60'
                    }`}
                  >
                    {/* Header */}
                    <div 
                      onClick={() => hasFans && toggleCountryExpand(country.teamName)}
                      className={`p-4 flex justify-between items-center ${hasFans ? 'cursor-pointer select-none hover:bg-white/5' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center select-none"><Flag teamName={country.teamName} /></span>
                        <div>
                          <span className="font-extrabold text-sm text-slate-100 block">{country.teamName}</span>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Qualified Nation</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          hasFans 
                            ? 'bg-fifa-gold/15 text-fifa-gold border border-fifa-gold/25' 
                            : 'bg-white/5 text-slate-600'
                        }`}>
                          {country.fans.length} fan{country.fans.length !== 1 ? 's' : ''}
                        </span>
                        {hasFans && (
                          <span className="text-slate-400">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expandable Fan list */}
                    {hasFans && isExpanded && (
                      <div className="bg-slate-950/80 border-t border-white/5 p-3 space-y-2 max-h-48 overflow-y-auto animate-in slide-in-from-top duration-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Fan Roster:</span>
                        {country.fans.map((fan) => (
                          <div key={fan._id} className="flex justify-between items-center text-xs py-1.5 px-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                            <span className="font-bold text-slate-200">{fan.name}</span>
                            <span className="text-[9px] text-slate-500 font-semibold">{formatDate(fan.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: MANAGE USERS */}
        {activeTab === 'users' && (
          <motion.div
            key="tab-users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-white">Registered Fan Accounts</h2>
                <p className="text-xs text-slate-400">Search, view prediction ballots, and remove users.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by fan name, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Users List Container */}
            {usersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-slate-900/10 rounded-2xl border border-white/5">
                <Loader className="h-6 w-6 text-red-500 animate-spin" />
                <span className="text-slate-400 text-xs">Reloading users database...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/25">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-950/30 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Fan Profile</th>
                      <th className="py-4 px-6">Allegiance</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6">Ballot Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                        {/* Profile name */}
                        <td className="py-4.5 px-6 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-[9px] text-slate-500 font-medium font-mono">ID: {user._id}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Allegiance country */}
                        <td className="py-4.5 px-6">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span className="inline-flex items-center select-none"><Flag teamName={user.selectedTeam} /></span>
                            <span>{user.selectedTeam}</span>
                          </span>
                        </td>

                        {/* Created timestamp */}
                        <td className="py-4.5 px-6 text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </td>

                        {/* Ballot status */}
                        <td className="py-4.5 px-6">
                          {user.prediction ? (
                            <div className="flex flex-col gap-1">
                              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md w-fit flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Submitted
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Champion Pick: <span className="font-extrabold text-slate-200 inline-flex items-center gap-1.5"><Flag teamName={user.prediction.champion} /> {user.prediction.champion}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold bg-slate-500/10 border border-white/10 text-slate-500 rounded-md w-fit flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Empty Ballot
                            </span>
                          )}
                        </td>

                        {/* Actions (Delete button) */}
                        <td className="py-4.5 px-6 text-right">
                          <button
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/15 border border-transparent hover:border-red-500/25 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete Fan Account"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-white/5 space-y-2">
                <AlertTriangle className="h-8 w-8 text-slate-600 mx-auto" />
                <h3 className="font-bold text-slate-400 text-sm">No Fan Accounts Found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">We couldn't find any results matching "{searchQuery}". Try refining your query.</p>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden"
          >
            {/* Warning light bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />

            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">Confirm Deletion</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Are you sure you want to delete fan account <span className="text-white font-extrabold">"{deleteConfirmUser.name}"</span>?
                </p>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4.5 rounded-xl border border-white/5 text-xs space-y-3 font-semibold">
              <div className="flex justify-between items-center text-slate-400">
                <span>Nation Allegiance:</span>
                <span className="text-slate-200 flex items-center gap-1">
                  <span className="inline-flex items-center"><Flag teamName={deleteConfirmUser.selectedTeam} /></span>
                  <span>{deleteConfirmUser.selectedTeam}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                <span>Prediction Ballot:</span>
                <span>
                  {deleteConfirmUser.prediction ? (
                    <span className="text-emerald-400">Will be deleted</span>
                  ) : (
                    <span className="text-slate-500">None submitted</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                <span>Cascade Action:</span>
                <span className="text-red-400 font-extrabold">Permanent data removal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                disabled={deleting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors border border-red-500/35 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default AdminDashboard;

