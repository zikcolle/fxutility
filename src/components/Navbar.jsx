import React, { useState, useEffect } from 'react';
import { TrendingUp, User, LogOut, Menu, X, Coins } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCredit } from '../context/CreditContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const Navbar = () => {
  const { credits } = useCredit();
  const { user, signOut } = useAuth();
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

  const navLinks = [
    { name: 'Home', path: '/', type: 'link' },
    { name: 'Features', path: '#features', type: 'anchor' },
    { name: 'Pricing', path: '/pricing', type: 'link' },
    { name: 'About', path: '#about', type: 'anchor' },
    { name: 'Contact', path: '#contact', type: 'anchor' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
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
          {location.pathname !== '/dashboard' ? (
            navLinks.map((link) => (
              link.type === 'link' ? (
                <Link key={link.name} to={link.path} className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">{link.name}</Link>
              ) : (
                <a key={link.name} href={link.path} className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">{link.name}</a>
              )
            ))
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Institutional Terminal V1.2</span>
            </div>
          )}
          {user && location.pathname !== '/dashboard' && (
            <Link to="/dashboard" className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">Terminal</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex bg-accent-blue px-4 py-2 rounded-full border border-primary/10 items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">{credits}</span>
            </div>
          )}

          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <button 
                onClick={signOut}
                className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <Link to="/dashboard?tab=Settings" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:border-primary/20 transition-all">
                <User className="w-5 h-5 text-text-secondary" />
              </Link>
            </div>
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
              {navLinks.map((link) => (
                link.type === 'link' ? (
                  <Link key={link.name} to={link.path} className="text-lg font-bold text-text-primary">{link.name}</Link>
                ) : (
                  <a key={link.name} href={link.path} className="text-lg font-bold text-text-primary">{link.name}</a>
                )
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" className="text-lg font-bold text-primary">Terminal</Link>
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
                  <Link to="/login" className="w-full py-4 text-center font-bold text-text-primary border border-gray-100 rounded-2xl">Sign In</Link>
                  <Link to="/signup" className="w-full py-4 text-center font-bold text-white bg-primary rounded-2xl shadow-lg shadow-primary/20">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
