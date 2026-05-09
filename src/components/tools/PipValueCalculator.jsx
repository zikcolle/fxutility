import React, { useState } from 'react';
import { TrendingUp, Calculator, RefreshCw, Info, Lock, Shield } from 'lucide-react';
import { useCredit } from '../../context/CreditContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const PipValueCalculator = () => {
  const { user } = useAuth();
  const { useCredits } = useCredit();
  const [lotSize, setLotSize] = useState('1.0');
  const [pair, setPair] = useState('EURUSD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);

  const pairs = [
    { name: 'EURUSD', value: 10 },
    { name: 'GBPUSD', value: 10 },
    { name: 'USDJPY', value: 9.12 },
    { name: 'AUDUSD', value: 10 },
    { name: 'USDCAD', value: 7.35 },
  ];

  const calculate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    if (!user) {
      const selectedPair = pairs.find(p => p.name === pair);
      const pipValue = parseFloat(lotSize) * selectedPair.value;
      
      setResult({
        perPip: pipValue.toFixed(2),
        perPoint: (pipValue / 10).toFixed(2),
        fullValue: (pipValue * 100).toFixed(2)
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

    const selectedPair = pairs.find(p => p.name === pair);
    const pipValue = parseFloat(lotSize) * selectedPair.value;
    
    setResult({
      perPip: pipValue.toFixed(2),
      perPoint: (pipValue / 10).toFixed(2),
      fullValue: (pipValue * 100).toFixed(2)
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Pip Value Intelligence
          </h2>
          <p className="text-sm text-text-secondary">Quantify the monetary impact of every tick move.</p>
        </div>
        <div className="px-4 py-2 bg-accent-blue rounded-full text-xs font-bold text-primary uppercase tracking-widest">
          Cost: 2 Credits
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
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Currency Pair</label>
              <select 
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary appearance-none cursor-pointer"
              >
                {pairs.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <button 
              onClick={calculate}
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Scan Tick Value
            </button>
          </div>
        </div>

        <div className={cn(
          "bento-card border-2 flex flex-col justify-center text-center p-8 transition-all duration-500 relative overflow-hidden",
          result ? "border-primary/20 bg-accent-mint/10" : "border-dashed border-gray-100 bg-gray-50/30"
        )}>
          {!result ? (
            <div className="opacity-40">
              <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-sm font-medium text-text-secondary">Analyze position size to see <br /> value per tick.</p>
            </div>
          ) : (
            <>
              <div className={cn("animate-in zoom-in-95 duration-300", showAuthWall && "blur-md pointer-events-none")}>
                <div className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Value Per Pip</div>
                <div className="text-6xl font-bold text-text-primary mb-2 tracking-tighter">${result.perPip}</div>
                <div className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-10">Account Currency</div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-text-secondary uppercase">Per Point (0.1 Pip)</span>
                    <span className="font-bold text-text-primary">${result.perPoint}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-text-secondary uppercase">100 Pip Move</span>
                    <span className="font-bold text-text-primary">${result.fullValue}</span>
                  </div>
                </div>
              </div>

              {/* Auth Wall Modal Overlay */}
              {showAuthWall && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/20 backdrop-blur-[2px]">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-sm animate-in fade-in zoom-in-90 duration-300">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">Institutional Insight Ready</h4>
                    <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                      Your precision pip analysis is complete. Create a free account to unlock the full report and access our advanced risk suite.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Link to="/signup" className="btn-primary py-3 px-6 text-sm">Unlock Result Now</Link>
                      <Link to="/login" className="text-xs font-bold text-text-secondary hover:text-primary transition-colors uppercase tracking-widest">Already a Member? Sign In</Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipValueCalculator;
