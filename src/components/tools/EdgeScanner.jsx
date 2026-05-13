import React from 'react';
import { Clock, Bell } from 'lucide-react';

const EdgeScanner = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Edge Scanner</h2>
          <p className="text-sm text-text-secondary">Advanced market analysis tools.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Clock className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">Coming Soon</h3>
          <p className="text-text-secondary mb-6 max-w-md">
            Edge Scanner is coming soon. We'll notify you when it's ready.
          </p>
          <button className="btn-secondary px-6 py-2 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
};

export default EdgeScanner;
