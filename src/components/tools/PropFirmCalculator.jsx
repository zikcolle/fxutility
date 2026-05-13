import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Calculator, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthWall from '../shared/AuthWall';
import { cn } from '../../lib/utils';

const ACCOUNT_TYPES = [
  { label: 'Challenge Phase 1', dailyLimit: 5, totalLimit: 10 },
  { label: 'Challenge Phase 2', dailyLimit: 5, totalLimit: 10 },
  { label: 'Funded Account', dailyLimit: 5, totalLimit: 10 },
  { label: 'Custom', dailyLimit: null, totalLimit: null },
];

const StatusBadge = ({ status }) => {
  const configs = {
    safe:    { icon: CheckCircle2, label: 'SAFE',    bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
    warning: { icon: AlertTriangle, label: 'WARNING', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    danger:  { icon: XCircle,       label: 'DANGER',  bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
    breached:{ icon: XCircle,       label: 'BREACHED',bg: 'bg-red-100',   text: 'text-red-800',    border: 'border-red-300' },
  };
  const c = configs[status];
  return (
    <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm', c.bg, c.text, c.border)}>
      <c.icon className="w-4 h-4" />
      {c.label}
    </div>
  );
};

const ProgressBar = ({ value, max, color }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-700', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const PropFirmCalculator = () => {
  const { user } = useAuth();
  const [accountType, setAccountType] = useState(0);
  const [accountSize, setAccountSize] = useState('100000');
  const [currentPL, setCurrentPL] = useState('0');
  const [avgRisk, setAvgRisk] = useState('500');
  const [customDaily, setCustomDaily] = useState('5');
  const [customTotal, setCustomTotal] = useState('10');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);

  const isCustom = accountType === 3;
  const selected = ACCOUNT_TYPES[accountType];
  const dailyPct = isCustom ? parseFloat(customDaily) : selected.dailyLimit;
  const totalPct = isCustom ? parseFloat(customTotal) : selected.totalLimit;

  const calculate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const balance = parseFloat(accountSize) || 0;
    const pl = parseFloat(currentPL) || 0;
    const risk = parseFloat(avgRisk) || 100;

    const maxDailyLoss = (balance * dailyPct) / 100;
    const maxTotalLoss = (balance * totalPct) / 100;

    // How much of the daily limit has been used (assumes currentPL is today's P&L)
    const dailyUsed = pl < 0 ? Math.abs(pl) : 0;
    const dailyRemaining = Math.max(0, maxDailyLoss - dailyUsed);

    // Total drawdown from balance
    const totalUsed = pl < 0 ? Math.abs(pl) : 0; // simplified: today's loss = total
    const totalRemaining = Math.max(0, maxTotalLoss - totalUsed);

    const tradesRemainingDaily = risk > 0 ? Math.floor(dailyRemaining / risk) : 0;
    const tradesRemainingTotal = risk > 0 ? Math.floor(totalRemaining / risk) : 0;
    const tradesRemaining = Math.min(tradesRemainingDaily, tradesRemainingTotal);

    // Determine status
    const dailyPctUsed = (dailyUsed / maxDailyLoss) * 100;
    const totalPctUsed = (totalUsed / maxTotalLoss) * 100;
    const worstPct = Math.max(dailyPctUsed, totalPctUsed);

    let status = 'safe';
    if (worstPct >= 100) status = 'breached';
    else if (worstPct >= 80) status = 'danger';
    else if (worstPct >= 60) status = 'warning';

    setResult({
      maxDailyLoss, maxTotalLoss,
      dailyUsed, dailyRemaining,
      totalUsed, totalRemaining,
      dailyPctUsed, totalPctUsed,
      tradesRemaining, tradesRemainingDaily, tradesRemainingTotal,
      status,
    });
    setLoading(false);
    if (!user) setShowAuthWall(true);
  };

  const reset = () => { setResult(null); setCurrentPL('0'); setShowAuthWall(false); };

  const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" /> Am I close to blowing my account?
          </h2>
          <p className="text-sm text-text-secondary">
            Know exactly how many losing trades you can take before breaching your rules.
          </p>
        </div>
        <div className="px-4 py-2 bg-amber-50 rounded-full text-xs font-bold text-amber-600 uppercase tracking-widest border border-amber-100">
          Premium
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="bento-card bg-white p-8 space-y-5">

          {/* Account Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setAccountType(i)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left',
                    accountType === i
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-100 text-text-secondary hover:border-primary/30'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom limits */}
          {isCustom && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Daily Limit %</label>
                <div className="relative">
                  <input type="number" value={customDaily} onChange={e => setCustomDaily(e.target.value)}
                    className="w-full pr-8 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Limit %</label>
                <div className="relative">
                  <input type="number" value={customTotal} onChange={e => setCustomTotal(e.target.value)}
                    className="w-full pr-8 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Account Size */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Size</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
              <input type="number" value={accountSize} onChange={e => setAccountSize(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {/* Current P&L */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Today's P&L <span className="normal-case font-normal text-text-secondary">(negative = loss)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
              <input type="number" value={currentPL} onChange={e => setCurrentPL(e.target.value)}
                placeholder="-500"
                className={cn(
                  "w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20",
                  parseFloat(currentPL) < 0 ? "text-red-500 border-red-100" : "text-text-primary border-gray-100"
                )} />
            </div>
          </div>

          {/* Avg risk per trade */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Avg Risk Per Trade ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
              <input type="number" value={avgRisk} onChange={e => setAvgRisk(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={calculate} disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Analyze
            </button>
            <button onClick={reset}
              className="btn-secondary flex items-center justify-center gap-2 text-sm">
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        <div className={cn(
          'bento-card border-2 p-8 flex flex-col gap-5 transition-all duration-500 relative overflow-hidden',
          result
            ? result.status === 'safe'    ? 'border-green-200 bg-green-50/30'
            : result.status === 'warning' ? 'border-yellow-200 bg-yellow-50/30'
            : 'border-red-200 bg-red-50/30'
            : 'border-dashed border-gray-100 bg-gray-50/30'
        )}>
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <ShieldCheck className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-sm text-text-secondary">Enter your account details and click Analyze</p>
            </div>
          ) : (
            <>
              <div className={cn("space-y-5 transition-all duration-500", showAuthWall && "blur-md pointer-events-none")}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Status</div>
                  <StatusBadge status={result.status} />
                </div>

                {/* Trades Remaining — the hero number */}
                <div className="text-center py-4 border-y border-gray-100">
                  <div className="text-6xl font-black text-text-primary tabular-nums">
                    {result.tradesRemaining}
                  </div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">
                    Losing Trades Remaining
                  </div>
                </div>

                {/* Daily Drawdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-secondary uppercase">Daily Limit ({dailyPct}%)</span>
                    <span className="text-text-primary">{fmt(result.dailyRemaining)} left of {fmt(result.maxDailyLoss)}</span>
                  </div>
                  <ProgressBar
                    value={result.dailyPctUsed}
                    max={100}
                    color={result.dailyPctUsed >= 80 ? 'bg-red-500' : result.dailyPctUsed >= 60 ? 'bg-yellow-400' : 'bg-green-400'}
                  />
                  <div className="text-[10px] text-text-secondary">
                    {result.dailyPctUsed.toFixed(1)}% of daily limit used · {result.tradesRemainingDaily} trades left today
                  </div>
                </div>

                {/* Total Drawdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-secondary uppercase">Total Limit ({totalPct}%)</span>
                    <span className="text-text-primary">{fmt(result.totalRemaining)} left of {fmt(result.maxTotalLoss)}</span>
                  </div>
                  <ProgressBar
                    value={result.totalPctUsed}
                    max={100}
                    color={result.totalPctUsed >= 80 ? 'bg-red-500' : result.totalPctUsed >= 60 ? 'bg-yellow-400' : 'bg-green-400'}
                  />
                  <div className="text-[10px] text-text-secondary">
                    {result.totalPctUsed.toFixed(1)}% of total limit used
                  </div>
                </div>
              </div>

              {/* Auth Wall Modal Overlay */}
              {showAuthWall && (
                <AuthWall 
                  title="Prop Challenge Audit Ready" 
                  description="Your institutional drawdown report is calculated. Create a free account to unlock the full audit and save this challenge to your ledger."
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


export default PropFirmCalculator;
