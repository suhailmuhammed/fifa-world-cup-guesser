import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Users, Trophy, Award, RefreshCw, Sparkles, 
  AlertTriangle, Loader, Lock, LogOut, Search, Trash2, 
  Globe, Calendar, Eye, EyeOff, CheckCircle2, ChevronDown, ChevronUp, X,
  BarChart3, FileSpreadsheet, Download, ArrowUpDown, Activity
} from 'lucide-react';
import Card from './UI/Card';
import Flag from './UI/Flag';
import FootballIcon from './UI/FootballIcon';
import { TEAMS_LIST } from '../data/teams';

const AdminDashboard = ({ backendUrl }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'countries', 'users', 'reports', 'logs'

  // Analytics stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // User list
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Logs
  const [adminLogs, setAdminLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  // PIN reveal state
  const [revealedPins, setRevealedPins] = useState({});

  // UI States
  const [expandedCountries, setExpandedCountries] = useState({});
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Reports tab state
  const [reportSearchName, setReportSearchName] = useState('');
  const [reportSearchCountry, setReportSearchCountry] = useState('');
  const [reportSortKey, setReportSortKey] = useState('date');
  const [reportSortDir, setReportSortDir] = useState('desc');
  const [selectedReportPrediction, setSelectedReportPrediction] = useState(null);

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
      fetchAdminLogs(adminPassword);
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

  const fetchAdminLogs = async (pwd = adminPassword) => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const response = await fetch(`${backendUrl}/api/admin/logs`, {
        headers: { 'x-admin-password': pwd }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logs.');
      }
      setAdminLogs(data);
    } catch (err) {
      setLogsError(err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRevealPin = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/reveal-pin`, {
        method: 'POST',
        headers: { 'x-admin-password': adminPassword }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reveal PIN.');
      }
      setRevealedPins(prev => ({
        ...prev,
        [userId]: data.pin
      }));
      fetchAdminLogs(adminPassword);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPin = async (user) => {
    if (!confirm(`Are you sure you want to reset the PIN for user "${user.name}"?`)) {
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${user._id}/reset-pin`, {
        method: 'POST',
        headers: { 'x-admin-password': adminPassword }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset PIN.');
      }
      
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, hasPin: false } : u));
      setRevealedPins(prev => {
        const copy = { ...prev };
        delete copy[user._id];
        return copy;
      });
      
      alert('PIN reset successfully!');
      fetchAdminLogs(adminPassword);
    } catch (err) {
      alert(err.message);
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
    fetchAdminLogs(adminPassword);
  };

  // Setup Countries Fan Directory
  const getCountriesFanData = () => {
    const countryFansMap = {};
    
    // Initialize all teams with empty fans list
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

  // Analytics aggregation helper
  const getAnalyticsSummary = () => {
    const predictors = users.filter(u => u.prediction);
    const totalPredictions = predictors.length;

    const getMostFrequent = (items) => {
      if (!items || items.length === 0) return { name: 'N/A', count: 0, percentage: 0 };
      const counts = {};
      items.forEach(item => {
        if (item) {
          const key = String(item).trim();
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) return { name: 'N/A', count: 0, percentage: 0 };
      const [name, count] = sorted[0];
      const percentage = Math.round((count / items.length) * 100);
      return { name, count, percentage };
    };

    const champions = predictors.map(u => u.prediction.champion);
    const runnerUps = predictors.map(u => u.prediction.runnerUp);
    const goldenBoots = predictors.map(u => u.prediction.goldenBoot);
    const goldenBalls = predictors.map(u => u.prediction.goldenBall);
    const mostGoals = predictors.map(u => u.prediction.mostGoalsTeam);
    const disappointments = predictors.map(u => u.prediction.biggestDisappointment);
    const fanClubs = users.map(u => u.selectedTeam);

    return {
      totalPredictions,
      mostChampion: getMostFrequent(champions),
      mostRunnerUp: getMostFrequent(runnerUps),
      mostGoldenBoot: getMostFrequent(goldenBoots),
      mostGoldenBall: getMostFrequent(goldenBalls),
      mostGoalsTeam: getMostFrequent(mostGoals),
      mostDisappointment: getMostFrequent(disappointments),
      mostSupportedClub: getMostFrequent(fanClubs),
    };
  };

  // Filtered and sorted predictions list for Reports table
  const getFilteredPredictions = () => {
    const predictors = users.filter(u => u.prediction);
    
    // Apply filters
    const filtered = predictors.filter(u => {
      const matchesName = u.name.toLowerCase().includes(reportSearchName.toLowerCase());
      const matchesCountry = u.selectedTeam.toLowerCase().includes(reportSearchCountry.toLowerCase());
      return matchesName && matchesCountry;
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let valA, valB;
      if (reportSortKey === 'date') {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (reportSortKey === 'champion') {
        valA = a.prediction.champion || '';
        valB = b.prediction.champion || '';
      }

      if (valA < valB) return reportSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return reportSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Sort toggle handler
  const handleReportSort = (key) => {
    if (reportSortKey === key) {
      setReportSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setReportSortKey(key);
      setReportSortDir('desc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const predictors = users.filter(u => u.prediction);
    const headers = [
      "User Name",
      "Fan Club Country",
      "Champion",
      "Runner-up",
      "Final Score",
      "Golden Boot",
      "Golden Ball",
      "Highest Scoring Team",
      "Biggest Disappointment",
      "Submission Date"
    ];

    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '';
      const text = String(str);
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows = predictors.map(u => [
      u.name,
      u.selectedTeam,
      u.prediction.champion,
      u.prediction.runnerUp,
      `${u.prediction.finalScore.homeGoals} : ${u.prediction.finalScore.awayGoals}`,
      u.prediction.goldenBoot,
      u.prediction.goldenBall,
      u.prediction.mostGoalsTeam,
      u.prediction.biggestDisappointment,
      u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trionda_predictions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel (MS-Excel HTML Table format)
  const handleExportExcel = () => {
    const predictors = users.filter(u => u.prediction);
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Trionda Predictions</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table border="1">
          <tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">
            <th>User Name</th>
            <th>Fan Club Country</th>
            <th>Champion</th>
            <th>Runner-up</th>
            <th>Final Score</th>
            <th>Golden Boot</th>
            <th>Golden Ball</th>
            <th>Highest Scoring Team</th>
            <th>Biggest Disappointment</th>
            <th>Submission Date</th>
          </tr>
    `;

    predictors.forEach(u => {
      html += `
        <tr>
          <td>${u.name}</td>
          <td>${u.selectedTeam}</td>
          <td>${u.prediction.champion}</td>
          <td>${u.prediction.runnerUp}</td>
          <td>${u.prediction.finalScore.homeGoals} : ${u.prediction.finalScore.awayGoals}</td>
          <td>${u.prediction.goldenBoot}</td>
          <td>${u.prediction.goldenBall}</td>
          <td>${u.prediction.mostGoalsTeam}</td>
          <td>${u.prediction.biggestDisappointment}</td>
          <td>${u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}</td>
        </tr>
      `;
    });

    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trionda_predictions_${new Date().toISOString().slice(0,10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-3xl font-black text-white tracking-tight mt-3 flex items-center gap-2.5">
            <FootballIcon className="h-8 w-8 animate-pulse shrink-0" />
            <span>Trionda Admin Console</span>
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

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Prediction Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Admin Logs ({adminLogs.length})</span>
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
                <p className="text-xs text-slate-400">Showing all qualified nations and their pledge rosters.</p>
              </div>
              <span className="text-xs text-slate-400 font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                Active Countries: {countriesFanData.filter(c => c.fans.length > 0).length} / {TEAMS_LIST.length}
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
                      <th className="py-4 px-6">Security PIN</th>
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

                        {/* Security PIN */}
                        <td className="py-4.5 px-6">
                          {user.hasPin ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm tracking-wider font-bold">
                                {revealedPins[user._id] ? (
                                  <span className="text-fifa-gold bg-fifa-gold/10 border border-fifa-gold/20 px-2 py-0.5 rounded font-mono font-bold text-xs">
                                    {revealedPins[user._id]}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-bold">••••</span>
                                )}
                              </span>
                              {!revealedPins[user._id] ? (
                                <button
                                  onClick={() => handleRevealPin(user._id)}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                  title="Reveal PIN"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setRevealedPins(prev => {
                                    const copy = { ...prev };
                                    delete copy[user._id];
                                    return copy;
                                  })}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                  title="Hide PIN"
                                >
                                  <EyeOff className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleResetPin(user)}
                                className="px-2 py-0.5 text-[9px] font-bold text-red-400 hover:text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded transition-colors ml-1"
                                title="Reset PIN"
                              >
                                Reset
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-semibold italic text-[11px]">No PIN set</span>
                          )}
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

        {/* TAB 4: PREDICTION REPORTS */}
        {activeTab === 'reports' && (() => {
          const summary = getAnalyticsSummary();
          const filteredPredictions = getFilteredPredictions();

          return (
            <motion.div
              key="tab-reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 animate-in fade-in duration-300"
            >
              {/* Analytics Section - Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Predictions */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-fifa-blue/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Total Predictions</span>
                  <span className="text-3xl font-black text-white mt-1.5">{summary.totalPredictions}</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1"><Activity className="h-3 w-3 text-fifa-blue" /> Cumulative ballot counts</span>
                </Card>

                {/* Most Supported Fan Club */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-fifa-gold/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Most Supported Fan Club</span>
                  <span className="text-sm font-black text-white mt-1.5 flex items-center gap-1.5 truncate">
                    {summary.mostSupportedClub.name !== 'N/A' && (
                      <span className="inline-flex shrink-0"><Flag teamName={summary.mostSupportedClub.name} /></span>
                    )}
                    <span className="truncate">{summary.mostSupportedClub.name}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1">
                    <span className="text-fifa-gold font-bold">{summary.mostSupportedClub.count} fans</span> ({summary.mostSupportedClub.percentage}%)
                  </span>
                </Card>

                {/* Most Predicted Champion */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Most Predicted Champion</span>
                  <span className="text-sm font-black text-white mt-1.5 flex items-center gap-1.5 truncate">
                    {summary.mostChampion.name !== 'N/A' && (
                      <span className="inline-flex shrink-0"><Flag teamName={summary.mostChampion.name} /></span>
                    )}
                    <span className="truncate">{summary.mostChampion.name}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1">
                    <span className="text-fifa-gold font-bold">{summary.mostChampion.count} votes</span> ({summary.mostChampion.percentage}%)
                  </span>
                </Card>

                {/* Most Predicted Runner-up */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Most Predicted Runner-up</span>
                  <span className="text-sm font-black text-white mt-1.5 flex items-center gap-1.5 truncate">
                    {summary.mostRunnerUp.name !== 'N/A' && (
                      <span className="inline-flex shrink-0"><Flag teamName={summary.mostRunnerUp.name} /></span>
                    )}
                    <span className="truncate">{summary.mostRunnerUp.name}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1">
                    <span className="text-fifa-gold font-bold">{summary.mostRunnerUp.count} votes</span> ({summary.mostRunnerUp.percentage}%)
                  </span>
                </Card>

                {/* Most Predicted Golden Boot */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Most Predicted Golden Boot</span>
                  <span className="text-sm font-black text-white mt-1.5 truncate text-slate-200">
                    👟 {summary.mostGoldenBoot.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1">
                    <span className="text-fifa-gold font-bold">{summary.mostGoldenBoot.count} votes</span> ({summary.mostGoldenBoot.percentage}%)
                  </span>
                </Card>

                {/* Most Predicted Golden Ball */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Most Predicted Golden Ball</span>
                  <span className="text-sm font-black text-white mt-1.5 truncate text-slate-200">
                    ⭐ {summary.mostGoldenBall.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1">
                    <span className="text-fifa-gold font-bold">{summary.mostGoldenBall.count} votes</span> ({summary.mostGoldenBall.percentage}%)
                  </span>
                </Card>

                {/* Most Predicted Highest Scoring Team */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Most Predicted Top Scorer Team</span>
                  <span className="text-sm font-black text-white mt-1.5 flex items-center gap-1.5 truncate">
                    {summary.mostGoalsTeam.name !== 'N/A' && (
                      <span className="inline-flex shrink-0"><Flag teamName={summary.mostGoalsTeam.name} /></span>
                    )}
                    <span className="truncate">{summary.mostGoalsTeam.name}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1">
                    <span className="text-fifa-gold font-bold">{summary.mostGoalsTeam.count} votes</span> ({summary.mostGoalsTeam.percentage}%)
                  </span>
                </Card>

                {/* Most Predicted Biggest Disappointment */}
                <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-fifa-gold/30 transition-all duration-300">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Most Predicted Disappointment</span>
                  <span className="text-sm font-black text-white mt-1.5 flex items-center gap-1.5 truncate">
                    {summary.mostDisappointment.name !== 'N/A' && (
                      <span className="inline-flex shrink-0"><Flag teamName={summary.mostDisappointment.name} /></span>
                    )}
                    <span className="truncate">{summary.mostDisappointment.name}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-auto flex items-center gap-1">
                    <span className="text-fifa-gold font-bold">{summary.mostDisappointment.count} votes</span> ({summary.mostDisappointment.percentage}%)
                  </span>
                </Card>
              </div>

              {/* Toolbar & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Fields */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search by User Name..."
                      value={reportSearchName}
                      onChange={(e) => setReportSearchName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search by Fan Club Country..."
                      value={reportSearchCountry}
                      onChange={(e) => setReportSearchCountry(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleExportCSV}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-805 transition-all duration-200 flex items-center gap-2 text-xs font-bold"
                  >
                    <Download className="h-4 w-4 text-fifa-gold" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-805 transition-all duration-200 flex items-center gap-2 text-xs font-bold"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              {filteredPredictions.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/25">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-slate-950/30 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-5">User Name</th>
                        <th className="py-4 px-5">Fan Club Country</th>
                        <th 
                          onClick={() => handleReportSort('champion')}
                          className="py-4 px-5 cursor-pointer hover:text-white transition-colors"
                        >
                          <span className="flex items-center gap-1">
                            Champion <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </th>
                        <th className="py-4 px-5">Runner-up</th>
                        <th className="py-4 px-5 text-center">Final Score</th>
                        <th className="py-4 px-5">Golden Boot</th>
                        <th className="py-4 px-5">Golden Ball</th>
                        <th className="py-4 px-5">Highest Scoring Team</th>
                        <th className="py-4 px-5">Biggest Disappointment</th>
                        <th 
                          onClick={() => handleReportSort('date')}
                          className="py-4 px-5 cursor-pointer hover:text-white transition-colors"
                        >
                          <span className="flex items-center gap-1">
                            Submission Date <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </th>
                        <th className="py-4 px-5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {filteredPredictions.map((u) => (
                        <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                          {/* User name */}
                          <td className="py-4 px-5 font-bold text-white max-w-[150px] truncate">{u.name}</td>
                          
                          {/* Country allegiance */}
                          <td className="py-4 px-5 font-semibold text-slate-200">
                            <span className="inline-flex items-center gap-1.5">
                              <Flag teamName={u.selectedTeam} />
                              <span className="truncate">{u.selectedTeam}</span>
                            </span>
                          </td>

                          {/* Champion */}
                          <td className="py-4 px-5 text-fifa-gold font-bold">
                            <span className="inline-flex items-center gap-1.5">
                              <Flag teamName={u.prediction.champion} />
                              <span className="truncate">{u.prediction.champion}</span>
                            </span>
                          </td>

                          {/* Runner-up */}
                          <td className="py-4 px-5 text-slate-300 font-semibold">
                            <span className="inline-flex items-center gap-1.5">
                              <Flag teamName={u.prediction.runnerUp} />
                              <span className="truncate">{u.prediction.runnerUp}</span>
                            </span>
                          </td>

                          {/* Final Score */}
                          <td className="py-4 px-5 text-center font-bold font-mono text-slate-200">
                            {u.prediction.finalScore.homeGoals} : {u.prediction.finalScore.awayGoals}
                          </td>

                          {/* Golden Boot */}
                          <td className="py-4 px-5 text-slate-400 font-medium truncate max-w-[140px]">{u.prediction.goldenBoot}</td>

                          {/* Golden Ball */}
                          <td className="py-4 px-5 text-slate-400 font-medium truncate max-w-[140px]">{u.prediction.goldenBall}</td>

                          {/* Highest Scoring Team */}
                          <td className="py-4 px-5 text-slate-300 font-semibold">
                            <span className="inline-flex items-center gap-1.5">
                              <Flag teamName={u.prediction.mostGoalsTeam} />
                              <span className="truncate">{u.prediction.mostGoalsTeam}</span>
                            </span>
                          </td>

                          {/* Biggest Disappointment */}
                          <td className="py-4 px-5 text-slate-300 font-semibold">
                            <span className="inline-flex items-center gap-1.5">
                              <Flag teamName={u.prediction.biggestDisappointment} />
                              <span className="truncate">{u.prediction.biggestDisappointment}</span>
                            </span>
                          </td>

                          {/* Submission Date */}
                          <td className="py-4 px-5 text-slate-500 font-medium">{formatDate(u.createdAt)}</td>

                          {/* Action detail */}
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => setSelectedReportPrediction(u)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-fifa-gold hover:text-white border border-white/5 transition-all text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ml-auto"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
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
                  <h3 className="font-bold text-slate-400 text-sm">No Predictions Found</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">We couldn't find any results matching your search filters.</p>
                </div>
              )}
            </motion.div>
          );
        })()}

        {activeTab === 'logs' && (
          <motion.div
            key="tab-logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-white">Administrator Activity Logs</h2>
                <p className="text-xs text-slate-400">Audit trail of secure administrative actions (e.g. Reveal PIN, Reset PIN).</p>
              </div>
              <span className="text-xs text-slate-400 font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                Total Logs: {adminLogs.length}
              </span>
            </div>

            {logsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-slate-900/10 rounded-2xl border border-white/5">
                <Loader className="h-6 w-6 text-red-500 animate-spin" />
                <span className="text-slate-400 text-xs">Loading activity logs...</span>
              </div>
            ) : adminLogs.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/25">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-950/30 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Action</th>
                      <th className="py-4 px-6">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-mono">
                    {adminLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-6 text-slate-400 font-semibold whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                            log.action === 'REVEAL_PIN' 
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                              : 'bg-red-500/10 border border-red-500/20 text-red-400'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-200">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-white/5 space-y-2">
                <Activity className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
                <h3 className="font-bold text-slate-400 text-sm">No Audit Logs</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Administrative actions will appear here once executed.</p>
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

      {/* --- DETAIL VIEW MODAL FOR USER PREDICTIONS --- */}
      {selectedReportPrediction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl w-full bg-slate-900 border border-fifa-gold/20 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden"
          >
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-fifa-gold" />

            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-black text-slate-300">
                  {selectedReportPrediction.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedReportPrediction.name}'s Ballot</h3>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    Fan Club: 
                    <span className="inline-flex items-center"><Flag teamName={selectedReportPrediction.selectedTeam} /></span>
                    <span className="text-slate-200">{selectedReportPrediction.selectedTeam}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportPrediction(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ballot Q&A Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* Champion */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 hover:border-fifa-gold/20 transition-colors">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">🏆 World Cup Champion</span>
                <span className="text-xs text-slate-400 font-medium block">Who will win the FIFA World Cup?</span>
                <div className="flex items-center gap-2 pt-1 font-bold text-fifa-gold text-sm">
                  <Flag teamName={selectedReportPrediction.prediction.champion} />
                  <span>{selectedReportPrediction.prediction.champion}</span>
                </div>
              </div>

              {/* Runner-up */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 hover:border-fifa-gold/20 transition-colors">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">🥈 World Cup Runner-up</span>
                <span className="text-xs text-slate-400 font-medium block">Which team will finish as the runner-up?</span>
                <div className="flex items-center gap-2 pt-1 font-bold text-slate-200 text-sm">
                  <Flag teamName={selectedReportPrediction.prediction.runnerUp} />
                  <span>{selectedReportPrediction.prediction.runnerUp}</span>
                </div>
              </div>

              {/* Final Score */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 md:col-span-2 hover:border-fifa-gold/20 transition-colors">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">⚽ Final Score Prediction</span>
                <span className="text-xs text-slate-400 font-medium block">World Cup Final Score</span>
                <div className="flex items-center gap-4 pt-1 font-bold text-lg text-white font-mono justify-center">
                  <div className="flex items-center gap-2">
                    <Flag teamName={selectedReportPrediction.prediction.champion} />
                    <span>{selectedReportPrediction.prediction.champion}</span>
                  </div>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-fifa-gold">
                    {selectedReportPrediction.prediction.finalScore.homeGoals} : {selectedReportPrediction.prediction.finalScore.awayGoals}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{selectedReportPrediction.prediction.runnerUp}</span>
                    <Flag teamName={selectedReportPrediction.prediction.runnerUp} />
                  </div>
                </div>
              </div>

              {/* Golden Boot */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 hover:border-fifa-gold/20 transition-colors">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">👟 Golden Boot</span>
                <span className="text-xs text-slate-400 font-medium block">Who will win the Golden Boot?</span>
                <div className="text-sm font-bold text-slate-200 pt-1">
                  {selectedReportPrediction.prediction.goldenBoot}
                </div>
              </div>

              {/* Golden Ball */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 hover:border-fifa-gold/20 transition-colors">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">⭐ Golden Ball</span>
                <span className="text-xs text-slate-400 font-medium block">Who will win the Golden Ball?</span>
                <div className="text-sm font-bold text-slate-200 pt-1">
                  {selectedReportPrediction.prediction.goldenBall}
                </div>
              </div>

              {/* Highest Scoring Team */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 hover:border-fifa-gold/20 transition-colors">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">🔥 Highest Scoring Team</span>
                <span className="text-xs text-slate-400 font-medium block">Which team will score the most goals?</span>
                <div className="flex items-center gap-2 pt-1 font-bold text-slate-200 text-sm">
                  <Flag teamName={selectedReportPrediction.prediction.mostGoalsTeam} />
                  <span>{selectedReportPrediction.prediction.mostGoalsTeam}</span>
                </div>
              </div>

              {/* Biggest Disappointment */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 hover:border-fifa-gold/20 transition-colors">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">🤯 Biggest Disappointment</span>
                <span className="text-xs text-slate-400 font-medium block">Which team will be the biggest disappointment?</span>
                <div className="flex items-center gap-2 pt-1 font-bold text-slate-200 text-sm">
                  <Flag teamName={selectedReportPrediction.prediction.biggestDisappointment} />
                  <span>{selectedReportPrediction.prediction.biggestDisappointment}</span>
                </div>
              </div>

            </div>

            {/* Footer / Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
              <span className="text-[10px] text-slate-500 font-semibold font-mono">
                Submitted on: {selectedReportPrediction.createdAt ? new Date(selectedReportPrediction.createdAt).toLocaleString() : 'N/A'}
              </span>
              <button
                onClick={() => setSelectedReportPrediction(null)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors border border-white/5"
              >
                Close Ballot
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default AdminDashboard;

