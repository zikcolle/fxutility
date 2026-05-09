import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Clock, MoreHorizontal, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase, useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const TradingLog = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pair: '',
    type: 'Buy',
    entry_price: '',
    lot_size: '',
    status: 'Open',
    notes: ''
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trading_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('trading_logs')
        .insert([{ ...formData, user_id: user.id }]);

      if (error) throw error;
      setIsModalOpen(false);
      setFormData({ pair: '', type: 'Buy', entry_price: '', lot_size: '', status: 'Open', notes: '' });
      fetchLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this trade record?')) return;
    const { error } = await supabase.from('trading_logs').delete().eq('id', id);
    if (!error) fetchLogs();
  };

  // Stats calculation
  const totalPnL = logs.reduce((sum, log) => sum + (Number(log.pnl) || 0), 0);
  const winRate = logs.length > 0 ? (logs.filter(l => Number(l.pnl) > 0).length / logs.length * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Institutional Ledger</h2>
          <p className="text-sm text-text-secondary">Comprehensive history of your executed setups.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Log New Trade
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card bg-white p-6">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Total P&L</div>
          <div className={cn("text-2xl font-black", totalPnL >= 0 ? "text-green-600" : "text-red-600")}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
          </div>
        </div>
        <div className="bento-card bg-white p-6">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Win Rate</div>
          <div className="text-2xl font-black text-text-primary">{winRate}%</div>
        </div>
        <div className="bento-card bg-white p-6">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Total Trades</div>
          <div className="text-2xl font-black text-text-primary">{logs.length}</div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Asset</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Entry</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-text-secondary text-sm">Synchronizing ledger...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-text-secondary text-sm italic">No trades logged yet. Start your institutional record.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-text-primary text-sm">{log.pair}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        log.type === 'Buy' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{log.entry_price}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">{log.lot_size}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex items-center gap-1.5 text-xs font-bold",
                        log.status === 'Open' ? "text-primary" : "text-text-secondary"
                      )}>
                        <Clock className="w-3 h-3" /> {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteLog(log.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-text-primary mb-6">Log New Execution</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Pair</label>
                  <input 
                    type="text" 
                    placeholder="EURUSD" 
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    value={formData.pair}
                    onChange={(e) => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Type</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Entry Price</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-mono"
                    value={formData.entry_price}
                    onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Lot Size</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-mono"
                    value={formData.lot_size}
                    onChange={(e) => setFormData({...formData, lot_size: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Log Notes</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 bg-gray-100 text-text-primary rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                  Log Execution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingLog;
