import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Clock, RefreshCw, AlertCircle, Shield, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthWall from '../shared/AuthWall';
import { Link } from 'react-router-dom';
import { cn } from "../../lib/utils";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD"];

const CURRENCY_META = {
  USD: { flag: "🇺🇸", name: "US Dollar" },
  EUR: { flag: "🇪🇺", name: "Euro" },
  GBP: { flag: "🇬🇧", name: "British Pound" },
  JPY: { flag: "🇯🇵", name: "Japanese Yen" },
  CHF: { flag: "🇨🇭", name: "Swiss Franc" },
  CAD: { flag: "🇨🇦", name: "Canadian Dollar" },
  AUD: { flag: "🇦🇺", name: "Australian Dollar" },
  NZD: { flag: "🇳🇿", name: "New Zealand Dollar" },
};

const TIMEFRAMES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
];

// Returns a YYYY-MM-DD date string N days ago
const getPastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

// Find the most recent available trading date (skip weekends)
const getLastTradingDate = () => {
  const d = new Date();
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() - 2);
  else if (day === 1) d.setDate(d.getDate() - 3);
  else d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

export default function CurrencyStrengthMeter() {
  const { user } = useAuth();
  const [strengths, setStrengths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[0]); // Start with 1D
  const [showAuthWall, setShowAuthWall] = useState(false);

  const fetchStrengths = useCallback(async (timeframe) => {
    setLoading(true);
    setError(null);

    try {
      const pastDate = getPastDate(timeframe.days + 3); // +3 buffer for weekends

      const [latestRes, pastRes] = await Promise.all([
        fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"),
        fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${pastDate}/v1/currencies/usd.json`),
      ]);

      if (!latestRes.ok || !pastRes.ok) throw new Error("API response error");

      const latestData = await latestRes.json();
      const pastData = await pastRes.json();

      // API returns { date: "...", usd: { eur: 0.92, gbp: 0.79, ... } }
      const latestRates = latestData.usd;
      const pastRates = pastData.usd;

      // Build USD-base tables (USD = 1, others = their rate vs USD)
      // Note: rates here are how much of X you get per 1 USD
      const recent = { usd: 1, ...latestRates };
      const past   = { usd: 1, ...pastRates };

      const rawScores = CURRENCIES.map((base) => {
        const baseKey = base.toLowerCase();
        let totalChange = 0;
        let count = 0;

        CURRENCIES.forEach((quote) => {
          if (base === quote) return;
          const quoteKey = quote.toLowerCase();

          const recentRate = recent[quoteKey] / recent[baseKey];
          const pastRate   = past[quoteKey]   / past[baseKey];
          if (!pastRate) return;

          totalChange += ((recentRate - pastRate) / pastRate) * 100;
          count++;
        });

        return { currency: base, score: count > 0 ? totalChange / count : 0 };
      });

      const scores = rawScores.map((s) => s.score);
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const range = max - min || 1;

      const normalized = rawScores
        .map(({ currency, score }) => ({
          currency,
          rawScore: score,
          normalizedScore: Math.round(((score - min) / range) * 100),
        }))
        .sort((a, b) => b.normalizedScore - a.normalizedScore);

      setStrengths(normalized);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Currency strength error:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStrengths(activeTimeframe);
  }, [fetchStrengths, activeTimeframe]);

  const handleTimeframeChange = (tf) => {
    if (!user && tf.label !== "1D") {
      setShowAuthWall(true);
      return;
    }
    setActiveTimeframe(tf);
  };

  const getStrengthTier = (score) => {
    if (score >= 70) return { label: "Strong", textColor: "text-green-700", bgColor: "bg-green-50", barColor: "bg-green-500" };
    if (score >= 35) return { label: "Neutral", textColor: "text-amber-700", bgColor: "bg-amber-50", barColor: "bg-amber-500" };
    return { label: "Weak", textColor: "text-red-700", bgColor: "bg-red-50", barColor: "bg-red-500" };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" /> Which currencies are strong?
          </h2>
          <p className="text-sm text-text-secondary">
            8 major currencies · live data
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => handleTimeframeChange(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  activeTimeframe.label === tf.label
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => fetchStrengths(activeTimeframe)}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-100 hover:bg-primary/10 text-text-secondary hover:text-primary transition-all"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Results / Loading */}
      <div className="bento-card bg-white p-6 space-y-4 min-h-[400px] relative overflow-hidden">
        <div className={cn("space-y-4 transition-all duration-500", showAuthWall && "blur-md pointer-events-none")}>
          {loading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 mb-1.5">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-20">
                    <div className="h-4 bg-gray-200 rounded mb-1 w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : !error && strengths.length > 0 ? (
            strengths.map((item, index) => {
              const meta = CURRENCY_META[item.currency];
              const tier = getStrengthTier(item.normalizedScore);
              const isPositive = item.rawScore >= 0;

              return (
                <div key={item.currency} className="group">
                  <div className="flex items-center gap-3 mb-1.5">
                    {/* Rank */}
                    <span className="text-xs font-black text-text-secondary w-4 text-center">
                      {index + 1}
                    </span>

                    {/* Flag + Name */}
                    <span className="text-lg leading-none">{meta.flag}</span>
                    <div className="w-20 flex-shrink-0">
                      <div className="font-black text-sm text-text-primary">{item.currency}</div>
                      <div className="text-[9px] text-text-secondary truncate">{meta.name}</div>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", tier.barColor)}
                        style={{ width: `${item.normalizedScore}%` }}
                      />
                    </div>

                    {/* Raw % Change */}
                    <div className="w-16 text-right">
                      <span className={cn(
                        "text-sm font-black tabular-nums",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {isPositive ? "+" : ""}{item.rawScore.toFixed(2)}%
                      </span>
                    </div>

                    {/* Label */}
                    <div className="hidden md:block w-20 text-right">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md", 
                        tier.bgColor, 
                        tier.textColor
                      )}>
                        {tier.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : null}
        </div>

        {showAuthWall && (
          <AuthWall 
            title="Institutional Data Locked" 
            description="Deep historical analysis (1W & 1M) is reserved for the FXUTILITY community. Sign up for free to unlock the full institutional feed."
            onSecondaryAction={() => window.location.href = '/login'}
          />
        )}
      </div>

      {/* Info footer */}
      <div className="flex items-start gap-2 mt-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
        <Info className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          Strength is the average % change vs all other 7 major pairs over the selected period.
          Powered by live data from currency-api. {lastUpdated && `Last updated ${lastUpdated.toLocaleTimeString()}`}
        </p>
      </div>
    </div>
  );
}
