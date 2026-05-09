import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const AuthWall = ({ title = "Institutional Insight Ready", description = "Create a free account to unlock the full report and access our advanced risk suite.", onSecondaryAction }) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/20 backdrop-blur-[2px]">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-sm animate-in fade-in zoom-in-90 duration-300 text-center">
        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h4 className="text-lg font-bold text-text-primary mb-2">{title}</h4>
        <p className="text-xs text-text-secondary mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/signup" className="btn-primary py-3 px-6 text-sm">Unlock Result Now</Link>
          <button 
            onClick={onSecondaryAction}
            className="text-xs font-bold text-text-secondary hover:text-primary transition-colors uppercase tracking-widest"
          >
            Already a Member? Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthWall;
