import React, { useState } from 'react';
import { DollarSign, Calculator, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthWall from '../shared/AuthWall';
import { cn } from '../../lib/utils';

const ProfitCalculator = () => {
  const { user } = useAuth();
  const [lotSize, setLotSize] = useState('1.0');
  const [pips, setPips] = useState('50');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);

  const calculate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    if (!user) {
      const pipValue = 10; // Simple approximation for standard lot
      const profit = parseFloat(lotSize) * parseFloat(pips) * pipValue;
      
      setResult({
        profit: profit.toFixed(2),
        pips: pips,
        lots: lotSize
      });
      setLoading(false);
      setShowAuthWall(true);
      return;
    }

    const pipValue = 10; // Simple approximation for standard lot
    const profit = parseFloat(lotSize) * parseFloat(pips) * pipValue;
    
    setResult({
      profit: profit.toFixed(2),
      pips: pips,
      lots: lotSize
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" /> Will this trade make money?
          </h2>
          <p className="text-sm text-text-secondary">Project potential gains or losses based on target pips.</p>
        </div>
        <div className="px-4 py-2 bg-accent-blue rounded-full text-xs font-bold text-primary uppercase tracking-widest">
          Free
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bento-card bg-white p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Position Size (Lots)</label>
              <input 
                type="number" 
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Target Pips</label>
              <input 
                type="number" 
                value={pips}
                onChange={(e) => setPips(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary"
              />
            </div>

            <button 
              onClick={calculate}
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Project P/L
            </button>
          </div>
        </div>

        <div className={cn(
          "bento-card border-2 flex flex-col justify-center text-center p-8 transition-all duration-500 relative overflow-hidden",
          result ? "border-primary/20 bg-accent-mint/10" : "border-dashed border-gray-100 bg-gray-50/30"
        )}>
          {!result ? (
            <div className="opacity-40">
              <DollarSign className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-sm font-medium text-text-secondary">Run projection to see P/L data.</p>
            </div>
          ) : (
            <>
              <div className={cn("animate-in zoom-in-95 duration-300", showAuthWall && "blur-md pointer-events-none")}>
                <div className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Projected Profit</div>
                <div className="text-6xl font-bold text-text-primary mb-2 tracking-tighter">${result.profit}</div>
                <div className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-10">Account Currency</div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-text-secondary uppercase">Target Pips</span>
                    <span className="font-bold text-text-primary">{result.pips} Pips</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-text-secondary uppercase">Volume</span>
                    <span className="font-bold text-text-primary">{result.lots} Lots</span>
                  </div>
                </div>
              </div>

              {/* Auth Wall Modal Overlay */}
              {showAuthWall && (
                <AuthWall 
                  title="P/L Projection Ready" 
                  description="Your institutional profit audit is calculated. Create a free account to unlock the full report and access our advanced risk suite."
                  onSecondaryAction={() => setShowAuthWall(false)} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
