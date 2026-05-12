import React, { useState, useEffect } from 'react';
import { Search, Activity, AlertTriangle, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

const EdgeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [edges, setEdges] = useState([]);

  const mockScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setEdges([
        { pair: 'EUR/USD', divergence: 'Bullish Regular', strength: 85, timeframe: 'H4', status: 'Active Edge' },
        { pair: 'GBP/JPY', divergence: 'Bearish Hidden', strength: 72, timeframe: 'H1', status: 'Developing' },
        { pair: 'AUD/CAD', divergence: 'Bullish Regular', strength: 91, timeframe: 'D1', status: 'High Probability' },
        { pair: 'USD/CHF', divergence: 'Bearish Regular', strength: 65, timeframe: 'M30', status: 'Weak Edge' },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  useEffect(() => {
    mockScan();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Edge Scanner Pro</h2>
          <p className="text-sm text-text-secondary">Neural correlation and divergence detection across 28 pairs.</p>
        </div>
        <button 
          onClick={mockScan}
          disabled={isScanning}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <RefreshCcw className={cn("w-4 h-4", isScanning && "animate-spin")} /> 
          {isScanning ? 'Scanning Markets...' : 'Run Deep Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card bg-white p-6">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Active Edges</div>
          <div className="text-2xl font-black text-text-primary">{edges.length}</div>
        </div>
        <div className="bento-card bg-white p-6">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">High Probability</div>
          <div className="text-2xl font-black text-green-600">{edges.filter(e => e.strength >= 80).length}</div>
        </div>
        <div className="bento-card bg-white p-6">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Markets Scanned</div>
          <div className="text-2xl font-black text-text-primary">28 Pairs</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-text-primary">Live Scan Results</h3>
        </div>
        
        {isScanning ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCcw className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-text-primary font-bold">Analyzing order flow and divergence metrics...</p>
            <p className="text-sm text-text-secondary">This usually takes a few seconds.</p>
          </div>
        ) : edges.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
            <p className="text-text-primary font-bold">No High-Probability Edges Found</p>
            <p className="text-sm text-text-secondary">Try running the deep scan again or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Asset Pair</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Timeframe</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Setup / Divergence</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Edge Strength</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {edges.map((edge, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-text-primary text-sm">{edge.pair}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold font-mono">
                        {edge.timeframe}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {edge.divergence.includes('Bullish') ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-text-primary">{edge.divergence}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              edge.strength >= 80 ? "bg-green-500" : edge.strength >= 70 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${edge.strength}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-text-secondary w-8">{edge.strength}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                        edge.status === 'High Probability' ? "bg-green-50 text-green-600" :
                        edge.status === 'Active Edge' ? "bg-blue-50 text-blue-600" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {edge.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EdgeScanner;
