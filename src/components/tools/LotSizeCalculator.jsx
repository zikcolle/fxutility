import React, { useState } from 'react';
import { Shield, Info, Calculator, RefreshCw, ChevronDown } from 'lucide-react';
import { useCredit } from '../../context/CreditContext';
import { useAuth } from '../../context/AuthContext';
import AuthWall from '../shared/AuthWall';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Pip values per standard lot in USD (approximations, normalized to USD account)
const PAIR_DATA = {
  'EURUSD': { pipValue: 10, decimals: 4, label: 'EUR/USD' },
  'GBPUSD': { pipValue: 10, decimals: 4, label: 'GBP/USD' },
  'AUDUSD': { pipValue: 10, decimals: 4, label: 'AUD/USD' },
  'NZDUSD': { pipValue: 10, decimals: 4, label: 'NZD/USD' },
  'USDCAD': { pipValue: 7.7, decimals: 4, label: 'USD/CAD' },
  'USDCHF': { pipValue: 11.2, decimals: 4, label: 'USD/CHF' },
  'USDJPY': { pipValue: 6.5, decimals: 2, label: 'USD/JPY' },
  'EURJPY': { pipValue: 6.5, decimals: 2, label: 'EUR/JPY' },
  'GBPJPY': { pipValue: 6.5, decimals: 2, label: 'GBP/JPY' },
  'AUDJPY': { pipValue: 6.5, decimals: 2, label: 'AUD/JPY' },
  'XAUUSD': { pipValue: 10, decimals: 2, label: 'XAU/USD (Gold)' },
  'GBPAUD': { pipValue: 6.8, decimals: 4, label: 'GBP/AUD' },
  'EURGBP': { pipValue: 12.5, decimals: 4, label: 'EUR/GBP' },
};

const PAIRS = Object.keys(PAIR_DATA);

const LotSizeCalculator = () => {
  const { user } = useAuth();
  const { useCredits } = useCredit();
  const [balance, setBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1');
  const [stopLoss, setStopLoss] = useState('20');
  const [pair, setPair] = useState('EURUSD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);

  const calculate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    
    // If user is not logged in, we show them a "demo" result and pop the wall
    if (!user) {
      const pairInfo = PAIR_DATA[pair];
      const riskAmt = (parseFloat(balance) * parseFloat(riskPercent)) / 100;
      const pipValue = pairInfo.pipValue;
      const lotSize = riskAmt / (parseFloat(stopLoss) * pipValue);
      const minLots = Math.max(0.01, Math.round(lotSize * 100) / 100);
      
      setResult({
        lotSize: minLots.toFixed(2),
        riskAmount: riskAmt.toFixed(2),
        positionValue: (minLots * 100000).toFixed(0),
        pipValuePerLot: pipValue.toFixed(2),
        pair: pairInfo.label
      });
      setLoading(false);
      setShowAuthWall(true);
      return;
    }

    const success = await useCredits(2, 'lotsize');
    if (!success) {
      setLoading(false);
      return;
    }

    const pairInfo = PAIR_DATA[pair];
    const riskAmt = (parseFloat(balance) * parseFloat(riskPercent)) / 100;
    const pipValue = pairInfo.pipValue; // per standard lot in USD
    const lotSize = riskAmt / (parseFloat(stopLoss) * pipValue);
    const minLots = Math.max(0.01, Math.round(lotSize * 100) / 100);
    
    setResult({
      lotSize: minLots.toFixed(2),
      riskAmount: riskAmt.toFixed(2),
      positionValue: (minLots * 100000).toFixed(0),
      pipValuePerLot: pipValue.toFixed(2),
      pair: pairInfo.label
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Risk Architect
          </h2>
          <p className="text-sm text-text-secondary">Professional lot sizing with pair-specific pip value precision.</p>
        </div>
        <div className="px-4 py-2 bg-accent-blue rounded-full text-xs font-bold text-primary uppercase tracking-widest">
          Cost: 2 Credits
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="bento-card bg-white p-8">
          <div className="space-y-5">

            {/* Currency Pair Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                Currency Pair <Info className="w-3 h-3" />
              </label>
              <div className="relative">
                <select
                  value={pair}
                  onChange={(e) => { setPair(e.target.value); setResult(null); }}
                  className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary pr-10 cursor-pointer"
                >
                  {PAIRS.map(p => (
                    <option key={p} value={p}>{PAIR_DATA[p].label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              </div>
              <p className="text-[10px] text-text-secondary">
                Pip value: <span className="font-bold text-primary">${PAIR_DATA[pair].pipValue}/pip</span> per standard lot
              </p>
            </div>

            {/* Account Balance */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                Account Balance <Info className="w-3 h-3" />
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
                <input 
                  type="number" 
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Risk %</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    min="0.1" max="10" step="0.1"
                    className="w-full pr-8 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Stop Loss (Pips)</label>
                <input 
                  type="number" 
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-primary"
                />
              </div>
            </div>

            <button 
              onClick={calculate}
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Analyze Risk Parameters
            </button>
          </div>
        </div>

        {/* Results Card */}
        <div className={cn(
          "bento-card border-2 flex flex-col justify-center text-center p-8 transition-all duration-500 relative overflow-hidden",
          result ? "border-primary/20 bg-accent-blue/10" : "border-dashed border-gray-100 bg-gray-50/30"
        )}>
          {!result ? (
            <div className="opacity-40">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-sm font-medium text-text-secondary">Select a pair, enter parameters, <br /> and run analysis to see position data.</p>
            </div>
          ) : (
            <div className={cn("animate-in zoom-in-95 duration-300", showAuthWall && "blur-md pointer-events-none")}>
              <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">{result.pair}</div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Recommended Position</div>
              <div className="text-6xl font-bold text-text-primary mb-2 tracking-tighter">{result.lotSize}</div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-10">Standard Lots</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-primary/5">
                  <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Risk Amount</div>
                  <div className="text-lg font-bold text-text-primary">${result.riskAmount}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-primary/5">
                  <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Contract Value</div>
                  <div className="text-lg font-bold text-text-primary">${result.positionValue}</div>
                </div>
                <div className="col-span-2 bg-white p-4 rounded-2xl border border-primary/5">
                  <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Pip Value / Lot</div>
                  <div className="text-lg font-bold text-primary">${result.pipValuePerLot}</div>
                </div>
              </div>
            </div>
          )}

          {/* Auth Wall Modal Overlay */}
          {showAuthWall && (
            <AuthWall 
              title="Risk Analysis Complete" 
              description="Your institutional risk audit is ready. Create a free account to unlock the full report and save this execution to your ledger."
              onSecondaryAction={() => window.location.href = '/login'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LotSizeCalculator;
