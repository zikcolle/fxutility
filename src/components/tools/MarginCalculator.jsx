import React, { useState } from 'react';
import { Layout, Calculator, RefreshCw, Info } from 'lucide-react';
import { useCredit } from '../../context/CreditContext';
import { useAuth } from '../../context/AuthContext';
import AuthWall from '../shared/AuthWall';
import { cn } from '../../lib/utils';

const MarginCalculator = () => {
  const { user } = useAuth();
  const { useCredits } = useCredit();
  const [leverage, setLeverage] = useState('100');
  const [lotSize, setLotSize] = useState('1.0');
  const [pair, setPair] = useState('EURUSD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);

  const calculate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    if (!user) {
      const contractSize = 100000;
      const marginRequired = (parseFloat(lotSize) * contractSize) / parseFloat(leverage);
      
      setResult({
        required: marginRequired.toFixed(2),
        contract: (parseFloat(lotSize) * contractSize).toLocaleString(),
        leverage: leverage
      });
      setLoading(false);
      setShowAuthWall(true);
      return;
    }

    const success = await useCredits(2);
    if (!success) {
      setLoading(false);
      return;
    }

    const contractSize = 100000;
    const marginRequired = (parseFloat(lotSize) * contractSize) / parseFloat(leverage);
    
    setResult({
      required: marginRequired.toFixed(2),
      contract: (parseFloat(lotSize) * contractSize).toLocaleString(),
      leverage: leverage
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1 flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" /> Margin Requirement
          </h2>
          <p className="text-sm text-text-secondary">Calculate collateral needed for your position size.</p>
        </div>
        <div className="px-4 py-2 bg-accent-blue rounded-full text-xs font-bold text-primary uppercase tracking-widest">
          Cost: 2 Credits
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bento-card bg-white p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Leverage (1:X)</label>
              <input 
                type="number" 
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Position Size (Lots)</label>
              <input 
                type="number" 
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary"
              />
            </div>

            <button 
              onClick={calculate}
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Analyze Margin
            </button>
          </div>
        </div>

        <div className={cn(
          "bento-card border-2 flex flex-col justify-center text-center p-8 transition-all duration-500 relative overflow-hidden",
          result ? "border-primary/20 bg-accent-blue/10" : "border-dashed border-gray-100 bg-gray-50/30"
        )}>
          {!result ? (
            <div className="opacity-40">
              <Layout className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-sm font-medium text-text-secondary">Calculate to see required collateral.</p>
            </div>
          ) : (
            <>
              <div className={cn("animate-in zoom-in-95 duration-300", showAuthWall && "blur-md pointer-events-none")}>
                <div className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Margin Required</div>
                <div className="text-6xl font-bold text-text-primary mb-2 tracking-tighter">${result.required}</div>
                <div className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-10">Account Currency</div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-text-secondary uppercase">Contract Value</span>
                    <span className="font-bold text-text-primary">${result.contract}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-text-secondary uppercase">Buying Power (X)</span>
                    <span className="font-bold text-text-primary">{result.leverage}x</span>
                  </div>
                </div>
              </div>

              {/* Auth Wall Modal Overlay */}
              {showAuthWall && (
                <AuthWall 
                  title="Margin Analysis Complete" 
                  description="Your institutional collateral requirement is calculated. Sign up to unlock the full audit and save this execution."
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

export default MarginCalculator;
