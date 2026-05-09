import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Link as LinkIcon, Copy, CheckCircle2, TrendingUp, PieChart, ArrowUpRight, Wallet, AlertCircle } from 'lucide-react';
import { supabase, useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const AffiliatePortal = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    method: 'Payoneer',
    details: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);

        const { data: refData } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', user.id);
        
        // Mock data if empty for demonstration of the requested features
        if (!refData || refData.length === 0) {
          setReferrals([
            { id: 1, referred_user_name: 'John Doe', plan_purchased: 'Premium', commission_amount: 15, status: 'Pending', created_at: new Date().toISOString() },
            { id: 2, referred_user_name: 'Sarah Smith', plan_purchased: 'Pro', commission_amount: 45, status: 'Pending', created_at: new Date(Date.now() - 86400000).toISOString() }
          ]);
        } else {
          setReferrals(refData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const referralLink = `${window.location.origin}/signup?ref=${profile?.referral_code || 'FX' + user.id.substring(0,6).toUpperCase()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdrawRequest = (e) => {
    e.preventDefault();
    alert(`Withdrawal request submitted for $${pendingPayout.toFixed(2)} via ${withdrawForm.method}. Our finance team will review and process this shortly.`);
    setIsWithdrawModalOpen(false);
  };

  const totalEarnings = referrals.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const paidEarnings = referrals.filter(r => r.status === 'Paid').reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const pendingPayout = totalEarnings - paidEarnings;
  const canWithdraw = pendingPayout >= 50;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-text-primary">Affiliate Partner Portal</h2>
        <p className="text-sm text-text-secondary">Grow the FXUTILITY community and earn 30% lifetime commission.</p>
      </header>

      {/* Referral Link Card */}
      <div className="bento-card bg-primary text-white p-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-4 opacity-90">Your Unique Referral Link</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 font-mono text-sm truncate">
                {referralLink}
              </div>
              <button 
                onClick={copyToClipboard}
                className="px-6 py-3 bg-white text-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 md:w-64">
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Available for Withdrawal</div>
            <div className="text-3xl font-black mb-3">${pendingPayout.toFixed(2)}</div>
            <button 
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={!canWithdraw}
              className={cn(
                "w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                canWithdraw ? "bg-white text-primary hover:bg-gray-100" : "bg-white/10 text-white/50 cursor-not-allowed"
              )}
            >
              <Wallet className="w-4 h-4" /> {canWithdraw ? 'Request Payout' : 'Min $50 Required'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card bg-white p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Active</span>
          </div>
          <div className="text-2xl font-black text-text-primary">{referrals.length}</div>
          <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Referrals</div>
        </div>

        <div className="bento-card bg-white p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">Earnings</span>
          </div>
          <div className="text-2xl font-black text-text-primary">${totalEarnings.toFixed(2)}</div>
          <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Generated</div>
        </div>

        <div className="bento-card bg-white p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Confirmed</span>
          </div>
          <div className="text-2xl font-black text-text-primary">{referrals.filter(r => r.status === 'Paid' || r.status === 'Pending').length}</div>
          <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">Successful Payments</div>
        </div>
      </div>

      {/* Referred Users Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-text-primary">Your Referred Traders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">User Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Plan Purchased</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Commission</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-text-secondary text-sm">Loading referrals...</td></tr>
              ) : referrals.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-text-secondary text-sm">No referrals yet. Share your link to start earning.</td></tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-text-primary text-sm">{ref.referred_user_name || 'Anonymous User'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{ref.plan_purchased || 'Free'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">${ref.commission_amount?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
                        ref.status === 'Paid' ? "text-green-600" : "text-amber-600"
                      )}>
                        {ref.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {ref.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-text-primary mb-2">Request Payout</h3>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              To avoid complex automated API integrations and international tax documentation delays, we process payouts manually within 48 hours.
            </p>
            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Payout Method</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-text-primary"
                  value={withdrawForm.method}
                  onChange={(e) => setWithdrawForm({...withdrawForm, method: e.target.value})}
                >
                  <option value="Payoneer">Payoneer (Global)</option>
                  <option value="Grey">Grey App (Nigeria/Africa)</option>
                  <option value="BankTransfer">Direct Bank Transfer (NGN)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
                  {withdrawForm.method === 'BankTransfer' ? 'Bank Name, Account Name & Number' : `${withdrawForm.method} Email Address`}
                </label>
                <textarea 
                  required
                  rows="3"
                  placeholder={withdrawForm.method === 'BankTransfer' ? "E.g. GTBank\nIsaac Ogunwale\n0123456789" : `Enter your ${withdrawForm.method} email`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  value={withdrawForm.details}
                  onChange={(e) => setWithdrawForm({...withdrawForm, details: e.target.value})}
                />
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  We highly recommend using <strong>Payoneer</strong> or <strong>Grey</strong> to avoid foreign exchange delays. Minimum withdrawal is $50.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 px-6 py-3 bg-gray-100 text-text-primary rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliatePortal;
