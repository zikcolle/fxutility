import React, { useState, useEffect } from 'react';
import { TrendingUp, User, LogOut, Menu, X, Coins, Moon, Sun, Settings, BarChart2, Zap, BookOpen } from 'lucide-react';
import { useLiveRates } from '../hooks/useLiveRates';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCredit } from '../context/CreditContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const Navbar = () => {
  const { credits } = useCredit();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const { getRate, loading: tickerLoading, error: tickerError } = useLiveRates();

  const navLinks = [
    { name: 'Home', path: '/', type: 'link' },
    { name: 'Features', path: '#features', type: 'anchor' },
    { name: 'Pricing', path: '/pricing', type: 'link' },
    { name: 'Prop Tracker', path: '/prop-tracker', type: 'link' },
    { name: 'About', path: '#about', type: 'anchor' },
    { name: 'Contact', path: '#contact', type: 'anchor' },
  ];

  return (
    <nav className={cn(
      "sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled || isMobileMenuOpen ? "bg-white/80 backdrop-blur-md py-3 border-gray-100" : "bg-transparent py-5 border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">FXUTILITY<span className="text-primary font-black">.</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {location.pathname === '/' ? (
            navLinks.map((link) => (
              link.type === 'link' ? (
                <Link key={link.name} to={link.path} className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">{link.name}</Link>
              ) : (
                <a key={link.name} href={link.path} className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">{link.name}</a>
              )
            ))
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Institutional Hub V1.2</span>
            </div>
          )}
          {user && location.pathname === '/' && (
            <Link to="/dashboard" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity">Tools Hub</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* User Credits - ONLY show in Dashboard */}
          {user && location.pathname.startsWith('/dashboard') && (
            <div className="hidden sm:flex bg-accent-blue dark:bg-blue-900/50 px-4 py-2 rounded-full border border-primary/10 items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">{credits} ⚡</span>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            location.pathname.startsWith('/dashboard') ? (
              <div className="hidden sm:flex items-center gap-3">
                <button 
                  onClick={signOut}
                  className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <Link to="/dashboard/settings" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:border-primary/20 transition-all">
                  <User className="w-5 h-5 text-text-secondary" />
                </Link>
              </div>
            ) : (
              <Link to="/dashboard" className="hidden sm:block btn-primary py-2 px-6 text-sm">Open Tools</Link>
            )
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-text-primary hover:text-primary transition-colors">Sign In</Link>
              <Link to="/signup" className="btn-primary py-2.5 px-6 text-sm font-bold shadow-lg shadow-primary/20">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-primary hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-text-secondary shadow-sm">
              <Zap className="w-4 h-4 text-primary" /> Live forex rates
            </div>
            <div className="flex-1 overflow-hidden rounded-full bg-white/90 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800">
              <div className="animate-marquee whitespace-nowrap py-2 text-sm font-semibold text-text-secondary min-w-full">
                {[...['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF', 'USD/CAD'], ...['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF', 'USD/CAD']].map((pair, idx) => {
                  const [from, to] = pair.split('/');
                  const rate = getRate(from, to);
                  return (
                    <span key={idx} className="inline-flex items-center gap-2 mr-8">
                      <span className="font-bold text-text-primary">{pair}</span>
                      <span className="font-mono text-primary">{rate ? rate.toFixed(to === 'JPY' ? 3 : 5) : '—'}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {location.pathname.startsWith('/dashboard') ? (
                <>
                  {/* Dashboard Specific Mobile Links */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-text-primary mb-6">Tools</h4>
                    <Link to="/dashboard" className="text-lg font-bold text-text-primary flex items-center gap-3"><TrendingUp className="w-5 h-5 text-primary" /> Tools Hub</Link>
                    <Link to="/dashboard/log" className="text-lg font-bold text-text-primary flex items-center gap-3"><BarChart2 className="w-5 h-5 text-primary" /> Trading Log</Link>
                    <Link to="/dashboard/affiliate" className="text-lg font-bold text-text-primary flex items-center gap-3"><Coins className="w-5 h-5 text-primary" /> Affiliate Portal</Link>
                    <Link to="/dashboard/alerts" className="text-lg font-bold text-text-primary flex items-center gap-3"><Zap className="w-5 h-5 text-primary" /> Alert Manager</Link>
                    <Link to="/dashboard/learn" className="text-lg font-bold text-text-primary flex items-center gap-3"><BookOpen className="w-5 h-5 text-primary" /> Education Lab</Link>
                    <Link to="/dashboard/settings" className="text-lg font-bold text-text-primary flex items-center gap-3"><Settings className="w-5 h-5 text-primary" /> Settings</Link>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-text-secondary uppercase">Balance</span>
                        <span className="text-xs font-black text-primary uppercase">Pro Plan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="text-xl font-bold text-text-primary">{credits} Credits</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-text-primary">{user?.user_metadata?.full_name || 'Isaac Ogunwale'}</div>
                        <Link to="/dashboard?tab=Settings" className="text-xs font-bold text-primary uppercase">View Profile</Link>
                      </div>
                      <button onClick={signOut} className="p-2 text-red-500">
                        <LogOut className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    link.type === 'link' ? (
                      <Link key={link.name} to={link.path} className="text-lg font-bold text-text-primary">{link.name}</Link>
                    ) : (
                      <a key={link.name} href={link.path} className="text-lg font-bold text-text-primary">{link.name}</a>
                    )
                  ))}
                  {user ? (
                    location.pathname.startsWith('/dashboard') ? (
                      <>
                        <Link to="/dashboard" className="text-lg font-bold text-primary">Tools Hub</Link>
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-text-secondary" />
                            </div>
                            <span className="font-bold text-text-primary">{credits} Credits</span>
                          </div>
                          <button onClick={signOut} className="text-red-500 font-bold flex items-center gap-2">
                            <LogOut className="w-5 h-5" /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                        <Link to="/dashboard" className="w-full py-4 text-center font-bold text-white bg-primary rounded-2xl shadow-lg shadow-primary/20">Open Tools Hub</Link>
                        <button onClick={signOut} className="w-full py-4 text-center font-bold text-red-500 border border-red-100 rounded-2xl">Sign Out</button>
                      </div>
                    )
                  ) : (
                    <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                      <Link to="/login" className="w-full py-4 text-center font-bold text-text-primary border border-gray-100 rounded-2xl">Sign In</Link>
                      <Link to="/signup" className="w-full py-4 text-center font-bold text-white bg-primary rounded-2xl shadow-lg shadow-primary/20">Get Started</Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
