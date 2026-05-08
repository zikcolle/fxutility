import React from 'react';
import { TrendingUp, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                <TrendingUp className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-text-primary">FXUTILITY<span className="text-primary font-black">.</span></span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Institutional-grade market intelligence and precision risk architecture for the modern retail trader.
            </p>
            <div className="flex items-center gap-4">
              <Github className="w-5 h-5 text-text-secondary hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-text-secondary hover:text-primary cursor-pointer transition-colors" />
              <Mail className="w-5 h-5 text-text-secondary hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Terminal</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Risk Architect</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">AI Signal Feed</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Margin Calculator</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Edge Finder</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing Plans</Link></li>
              <li><Link to="/signup" className="hover:text-primary transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Member Login</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Risk Disclosure</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-text-secondary uppercase tracking-widest">
          <p>© 2026 FXUTILITY ELITE. ALL RIGHTS RESERVED.</p>
          <p>ENGINEERED FOR PRECISION.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
