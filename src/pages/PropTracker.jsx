import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

const FIRMS = {
  FTMO: { dailyDD: 0.05, maxDD: 0.10 },
  MyForexFunds: { dailyDD: 0.05, maxDD: 0.12 },
  The5ers: { dailyDD: 0.04, maxDD: 0.08 },
  Topstep: { dailyDD: 0.03, maxDD: 0.06 },
  E8Funding: { dailyDD: 0.05, maxDD: 0.08 },
  FundedNext: { dailyDD: 0.05, maxDD: 0.10 },
};

const PropTracker = () => {
  const { isDark } = useTheme();
  const [firm, setFirm] = useState('');
  const [startingBalance, setStartingBalance] = useState('10000');
  const [currentBalance, setCurrentBalance] = useState('9500');

  useEffect(() => {
    document.title = 'Prop Tracker — FXUtility';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Prop firm drawdown tracker for FTMO, MyForexFunds, Topstep, and more. Enter your balance to see daily and total loss limits instantly.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Prop firm drawdown tracker for FTMO, MyForexFunds, Topstep, and more. Enter your balance to see daily and total loss limits instantly.';
      document.head.appendChild(meta);
    }
  }, []);

  const rules = FIRMS[firm];
  const balance = Number(startingBalance) || 0;
  const current = Number(currentBalance) || 0;
  const loss = Math.max(0, balance - current);
  const dailyMax = rules ? balance * rules.dailyDD : 0;
  const totalMax = rules ? balance * rules.maxDD : 0;
  const dailyUsedPct = rules && dailyMax > 0 ? (loss / dailyMax) * 100 : 0;
  const totalUsedPct = rules && totalMax > 0 ? (loss / totalMax) * 100 : 0;
  const remainingLoss = Math.max(0, totalMax - loss);
  const remainingPct = totalMax > 0 ? Math.max(0, ((remainingLoss / totalMax) * 100).toFixed(1)) : 0;
  const status = totalUsedPct < 70 ? 'SAFE' : totalUsedPct < 90 ? 'WARNING' : 'DANGER';

  return (
    <>
      <div className={cn(
        'min-h-screen pt-20 transition-colors duration-300',
        isDark ? 'bg-[#09090b] text-white' : 'bg-[#f8fafc] text-[#0f172a]'
      )}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest">LIVE</span>
            </div>
            <h1 className="text-4xl font-bold mb-3">Am I close to blowing my account?</h1>
            <p className="text-sm text-text-secondary max-w-2xl">Paste in your starting and current balance. We'll show you how close you are to your prop firm's limit.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary">Prop Firm</label>
              <select
                value={firm}
                onChange={(e) => setFirm(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-text-primary"
              >
                <option value="">Select a prop firm</option>
                {Object.keys(FIRMS).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary">Starting account balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-text-primary"
                />
              </div>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary">Current account balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-text-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Daily drawdown used</p>
                  <p className="text-2xl font-bold text-text-primary">{rules ? `${Math.min(100, dailyUsedPct).toFixed(1)}%` : '—'}</p>
                </div>
                <span className={cn('text-xs font-bold uppercase px-3 py-1 rounded-full', rules ? status === 'SAFE' ? 'bg-green-50 text-green-700' : status === 'WARNING' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700' : 'bg-gray-100 text-text-secondary')}>
                  {rules ? status : 'No firm selected'}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className={cn('h-3 rounded-full transition-all duration-500', status === 'SAFE' ? 'bg-green-500' : status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: rules ? `${Math.min(100, dailyUsedPct)}%` : '0%' }} />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Max drawdown used</p>
                  <p className="text-2xl font-bold text-text-primary">{rules ? `${Math.min(100, totalUsedPct).toFixed(1)}%` : '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">Remaining allowed loss</p>
                  <p className="text-lg font-bold text-text-primary">{rules ? `$${remainingLoss.toFixed(2)} (${remainingPct}%)` : '—'}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className={cn('h-3 rounded-full transition-all duration-500', status === 'SAFE' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: rules ? `${Math.min(100, totalUsedPct)}%` : '0%' }} />
              </div>
            </div>
          </div>

          {!firm && (
            <div className="mt-6 p-4 rounded-3xl bg-yellow-50 border border-yellow-100 text-yellow-900">
              Pick your prop firm above to see your drawdown limits.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PropTracker;
