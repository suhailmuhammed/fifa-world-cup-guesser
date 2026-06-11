import React from 'react';
import { Trophy, Users, Percent, ShieldAlert, Menu, X, Globe, LogOut } from 'lucide-react';
import Flag from './UI/Flag';

const Navbar = ({ activePage, setPage, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (page) => {
    setPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 backdrop-blur-md bg-fifa-dark/70 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      {/* Logo */}
      <div 
        onClick={() => handleNavClick('landing')} 
        className="flex items-center gap-2.5 cursor-pointer select-none group"
      >
        <Trophy className="h-6 w-6 text-fifa-gold transition-transform duration-300 group-hover:rotate-12" />
        <span className="font-black text-lg md:text-xl tracking-wider text-gradient-gold">
          FIFA GUESSER
        </span>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {user && (
          <>
            <button
              onClick={() => handleNavClick('fan-club')}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ${
                activePage === 'fan-club' ? 'text-fifa-gold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Fan Club
            </button>
            <button
              onClick={() => handleNavClick('prediction')}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ${
                activePage === 'prediction' ? 'text-fifa-gold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Predictions
            </button>
          </>
        )}
        <button
          onClick={() => handleNavClick('nations')}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ${
            activePage === 'nations' ? 'text-fifa-gold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" />
          Nations Directory
        </button>
        <button
          onClick={() => handleNavClick('stats')}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ${
            activePage === 'stats' ? 'text-fifa-gold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Percent className="h-4 w-4" />
          Community Stats
        </button>
      </div>

      {/* User Info / Joining State */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-white/5 border border-white/10 shadow-inner">
              <span className="text-xs text-slate-400 font-medium select-none">Fan:</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                {user.name} 
                <span className="inline-flex items-center" title={user.selectedTeam}>
                  <Flag teamName={user.selectedTeam} />
                </span>
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all duration-200"
              title="Logout / Leave Club"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleNavClick('join')}
            className="text-sm font-bold text-fifa-gold hover:text-white transition-colors duration-200"
          >
            Join Fan Club
          </button>
        )}

        <button
          onClick={() => handleNavClick('admin')}
          className={`p-2 rounded-xl transition-all duration-200 ${
            activePage === 'admin' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
          title="Admin Dashboard"
        >
          <ShieldAlert className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => handleNavClick('admin')}
          className={`p-2 rounded-xl transition-all duration-200 ${
            activePage === 'admin' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'text-slate-500'
          }`}
        >
          <ShieldAlert className="h-5 w-5" />
        </button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[69px] left-0 w-full glass-card border-x-0 border-b border-white/10 z-40 py-6 px-8 flex flex-col gap-4 md:hidden animate-in slide-in-from-top duration-300">
          {user && (
            <div className="flex items-center justify-between py-2 border-b border-white/5 mb-2">
              <span className="text-xs text-slate-400 font-medium">Joined Fan:</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                {user.name} <span className="inline-flex items-center"><Flag teamName={user.selectedTeam} /></span>
              </span>
            </div>
          )}
          {user && (
            <>
              <button
                onClick={() => handleNavClick('fan-club')}
                className={`flex items-center gap-3 py-2 text-left font-semibold ${
                  activePage === 'fan-club' ? 'text-fifa-gold' : 'text-slate-300'
                }`}
              >
                <Users className="h-5 w-5" />
                Fan Club
              </button>
              <button
                onClick={() => handleNavClick('prediction')}
                className={`flex items-center gap-3 py-2 text-left font-semibold ${
                  activePage === 'prediction' ? 'text-fifa-gold' : 'text-slate-300'
                }`}
              >
                <Trophy className="h-5 w-5" />
                Predictions
              </button>
            </>
          )}
          <button
            onClick={() => handleNavClick('nations')}
            className={`flex items-center gap-3 py-2 text-left font-semibold ${
              activePage === 'nations' ? 'text-fifa-gold' : 'text-slate-300'
            }`}
          >
            <Globe className="h-5 w-5" />
            Nations Directory
          </button>
          <button
            onClick={() => handleNavClick('stats')}
            className={`flex items-center gap-3 py-2 text-left font-semibold ${
              activePage === 'stats' ? 'text-fifa-gold' : 'text-slate-300'
            }`}
          >
            <Percent className="h-5 w-5" />
            Community Stats
          </button>
          {!user && (
            <button
              onClick={() => handleNavClick('join')}
              className="mt-2 py-3 rounded-xl bg-fifa-blue text-white font-bold text-center"
            >
              Join Fan Club
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="mt-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold text-center flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Leave Fan Club</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export const getTeamEmoji = (teamName) => {
  return <Flag teamName={teamName} />;
};

export default Navbar;
