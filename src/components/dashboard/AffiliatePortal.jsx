import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Link as LinkIcon, Copy, CheckCircle2, TrendingUp, PieChart, ArrowUpRight } from 'lucide-react';
import { supabase, useAuth } from '../../context/AuthContext';

const AffiliatePortal = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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
        
        setReferrals(refData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const referralLink = `${window.location.origin}/signup?ref=${profile?.referral_code || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarnings = referrals.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const paidEarnings = referrals.filter(r => r.status === 'Paid').reduce((sum, r) => sum + (r.commission_amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-text-primary">Affiliate Partner Portal</h2>
        <p className="text-sm text-text-secondary">Grow the FXUTILITY community and earn 30% lifetime commission.</p>
      </header>

      {/* Referral Link Card */}
      <div className="bento-card bg-primary text-white p-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
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
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Payout</span>
          </div>
          <div className="text-2xl font-black text-text-primary">${(totalEarnings - paidEarnings).toFixed(2)}</div>
          <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">Pending Payout</div>
        </div>
      </div>

      {/* Program Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
          <h4 className="font-bold text-text-primary mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" /> How It Works
          </h4>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm text-primary shadow-sm">1</div>
              <div>
                <p className="font-bold text-text-primary text-sm">Share your link</p>
                <p className="text-xs text-text-secondary leading-relaxed">Invite traders to use FXUTILITY's institutional tools.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm text-primary shadow-sm">2</div>
              <div>
                <p className="font-bold text-text-primary text-sm">They Upgrade</p>
                <p className="text-xs text-text-secondary leading-relaxed">When they purchase a Premium or Pro plan, you get credited.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm text-primary shadow-sm">3</div>
              <div>
                <p className="font-bold text-text-primary text-sm">Get Paid</p>
                <p className="text-xs text-text-secondary leading-relaxed">Withdraw your earnings via PayPal or Crypto once you reach $50.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ArrowUpRight className="w-8 h-8 text-primary" />
          </div>
          <h4 className="font-bold text-text-primary mb-2">Institutional Partnership</h4>
          <p className="text-sm text-text-secondary mb-8 px-4">
            High-volume affiliates (50+ referrals) qualify for custom white-label solutions and higher commission tiers.
          </p>
          <button className="btn-secondary py-3 px-8 text-sm">Contact Support for Pro Tiers</button>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePortal;
