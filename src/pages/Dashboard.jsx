import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Coins, 
  Settings, 
  LogOut, 
  BarChart2, 
  Zap, 
  User,
  Lock,
  Search,
  ChevronRight,
  TrendingUp,
  Brain,
  DollarSign,
  Grid3X3,
  BookOpen
} from 'lucide-react';
import { useCredit } from '../context/CreditContext';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import LotSizeCalculator from '../components/tools/LotSizeCalculator';
import PipValueCalculator from '../components/tools/PipValueCalculator';
import TradingLog from '../components/tools/TradingLog';
import AffiliatePortal from '../components/dashboard/AffiliatePortal';
import MarginCalculator from '../components/tools/MarginCalculator';
import ProfitCalculator from '../components/tools/ProfitCalculator';
import PropFirmCalculator from '../components/tools/PropFirmCalculator';
import CurrencyStrengthMeter from '../components/tools/CurrencyStrengthMeter';
import CorrelationMatrix from '../components/tools/CorrelationMatrix';
import EdgeScanner from '../components/tools/EdgeScanner';

const NAV_ITEMS = [
  { name: 'Tools Hub',        icon: LayoutDashboard, mobileLabel: 'Tools'   },
  { name: 'Trading Log',      icon: BarChart2,        mobileLabel: 'Log'     },
  { name: 'Affiliate Portal', icon: Coins,            mobileLabel: 'Refer'   },
  { name: 'Education Lab',    icon: BookOpen,         mobileLabel: 'Learn'   },
  { name: 'Alert Manager',    icon: Zap,              mobileLabel: 'Alerts'  },
  { name: 'Settings',         icon: Settings,         mobileLabel: 'Profile' },
];

const Dashboard = () => {
  const { credits, tier } = useCredit();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toolId } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [search, setSearch] = useState('');
  
  // Top Up & Billing State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [isAutoRenew, setIsAutoRenew] = useState(false);

  const [transactions, setTransactions] = useState([]);

  // Fetch Transactions
  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      try {
        const { data: creditData } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: payoutData } = await supabase
          .from('affiliate_payouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        let combined = [];
        if (creditData) {
          combined = [...combined, ...creditData.map(tx => ({
            type: tx.tool_id === 'topup' ? 'Credit Top-Up' : 'Tool Usage',
            amount: tx.tool_id === 'topup' ? `+${tx.amount} Credits` : `-${tx.amount} Credits`,
            date: new Date(tx.created_at).toLocaleDateString(),
            status: 'Completed',
            color: tx.tool_id === 'topup' ? 'text-green-600' : 'text-text-primary'
          }))];
        }
        if (payoutData) {
          combined = [...combined, ...payoutData.map(tx => ({
            type: 'Affiliate Payout',
            amount: `$${tx.amount.toFixed(2)}`,
            date: new Date(tx.created_at).toLocaleDateString(),
            status: tx.status,
            color: 'text-amber-600'
          }))];
        }
        
        // Sort combined descending by date
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(combined.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactions();
  }, [user]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current active tab based on path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/log')) return 'Trading Log';
    if (path.includes('/affiliate')) return 'Affiliate Portal';
    if (path.includes('/alerts')) return 'Alert Manager';
    if (path.includes('/learn')) return 'Education Lab';
    return 'Tools Hub';
  };

  const activeTab = getActiveTab();
  const activeTool = toolId;

  const tools = [
    { name: 'Lot Size Calculator',     id: 'lotsize',   cost: 2,  icon: ShieldCheck,  tier: 'Basic',   color: 'text-blue-500',   bg: 'bg-blue-50',
      desc: 'Calculate your exact lot size to protect 1–2% of your account per trade. Works across all currency pairs.' },
    { name: 'Pip Value Intelligence',  id: 'pipvalue',  cost: 2,  icon: TrendingUp,   tier: 'Basic',   color: 'text-green-500',  bg: 'bg-green-50',
      desc: 'Know the exact dollar value of each pip movement before you place a trade — critical for accurate P&L forecasting.' },
    { name: 'Margin Requirement',      id: 'margin',    cost: 2,  icon: Coins,        tier: 'Basic',   color: 'text-orange-500', bg: 'bg-orange-50',
      desc: 'Calculate precisely how much margin your broker requires for any position size, leverage, and currency pair.' },
    { name: 'Profit/Loss Architect',   id: 'profit',    cost: 2,  icon: DollarSign,   tier: 'Basic',   color: 'text-indigo-500', bg: 'bg-indigo-50',
      desc: 'Project your exact P&L in account currency before entering a trade. No more mental math under pressure.' },
    { name: 'Currency Strength Meter', id: 'strength',  cost: 0,  icon: TrendingUp,   tier: 'Basic',   color: 'text-emerald-500',bg: 'bg-emerald-50',
      desc: 'Rank all 8 major currencies from strongest to weakest in real-time. The most-shared tool in forex communities.' },
    { name: 'Session Overlap',         id: 'sessions',  cost: 0,  icon: Zap,          tier: 'Basic',   color: 'text-cyan-500',   bg: 'bg-cyan-50',
      desc: 'Live market session clock showing London, NY, Tokyo & Sydney sessions. Spot high-liquidity overlap windows instantly.' },
    { name: 'Prop Firm Guard',         id: 'propfirm',  cost: 5,  icon: ShieldCheck,  tier: 'Premium', color: 'text-amber-500',  bg: 'bg-amber-50',
      desc: 'Track your daily and trailing drawdown against prop firm rules in real-time. Never blow a funded account by mistake.',
      lockedFeatures: ['Real-time drawdown tracker', 'Trailing equity alerts', 'Max loss guardian'] },
    { name: 'Correlation Matrix',      id: 'correlation',cost: 3, icon: Grid3X3,      tier: 'Basic',   color: 'text-violet-500', bg: 'bg-violet-50',
      desc: 'See which currency pairs move together and which cancel each other out — avoid redundant exposure across trades.' },
    { name: 'AI Signal Engine',        id: 'signals',   cost: 10, icon: Brain,        tier: 'Premium', color: 'text-purple-500', bg: 'bg-purple-50',
      desc: 'Neural network-powered trade setup detection trained on institutional order flow and liquidity data.',
      lockedFeatures: ['HFT pattern recognition', 'Bias direction scoring', 'Entry zone alerts'] },
    { name: 'Edge Scanner Pro',        id: 'edge',      cost: 15, icon: BarChart2,    tier: 'Pro',     color: 'text-red-500',    bg: 'bg-red-50',
      desc: 'Currency correlation and divergence scanner that identifies high-probability edge setups across 28 pairs.',
      lockedFeatures: ['28-pair divergence scan', 'Correlation matrix heatmap', 'Confluence score ranking'] },
  ];

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseTool = (tool) => {
    if (tool.tier !== 'Basic' && tier === 'Basic') {
      alert('This tool requires a Premium or Pro subscription.');
      return;
    }
    if (credits < tool.cost) {
      setShowTopUpModal(true);
      return;
    }
    navigate(`/dashboard/tool/${tool.id}`);
    setSearch('');
  };

  const handleTabChange = (name) => {
    const paths = {
      'Tools Hub': '/dashboard',
      'Trading Log': '/dashboard/log',
      'Affiliate Portal': '/dashboard/affiliate',
      'Alert Manager': '/dashboard/alerts',
      'Education Lab': '/dashboard/learn',
      'Settings': '/dashboard/settings'
    };
    navigate(paths[name] || '/dashboard');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader';

  return (
    <div className="flex min-h-screen bg-gray-50/50 pt-16 lg:pt-20">

      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed left-0 top-20 bottom-0 p-6">
        <div className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.name}
              onClick={() => handleTabChange(item.name)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group',
                activeTab === item.name && !activeTool
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              <ChevronRight className={cn(
                'w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity',
                activeTab === item.name && !activeTool && 'opacity-100'
              )} />
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          {/* Credit balance */}
          <div className="bg-accent-blue/50 rounded-2xl p-4 border border-primary/10 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase">Balance</span>
              </div>
              <button onClick={() => setShowTopUpModal(true)} className="text-[10px] bg-primary text-white px-2 py-0.5 rounded font-bold uppercase hover:bg-primary/90 transition-colors">
                Top Up
              </button>
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {credits} <span className="text-sm font-medium text-text-secondary">Credits</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{tier} Plan</div>
            </div>
          </div>

          {/* User */}
          <div
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => handleTabChange('Settings')}
          >
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-text-primary truncate">{displayName}</div>
              <div className="text-[10px] font-bold text-text-secondary uppercase">View Profile</div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 lg:ml-72 p-4 md:p-8 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto">

          {/* Sticky Header — optimized for mobile */}
          <header className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 bg-gray-50/80 backdrop-blur-xl -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 border-b border-gray-100 sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
            <div className="flex items-center gap-2">
              {activeTool && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-white rounded-xl shadow-sm border border-gray-100 transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2 text-text-secondary text-[11px] sm:text-sm font-medium mb-1">
                  {activeTool ? (
                    <>
                      <span onClick={() => navigate('/dashboard')} className="hover:text-primary cursor-pointer transition-colors">Tools Hub</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-primary font-bold">{tools.find(t => t.id === activeTool)?.name}</span>
                    </>
                  ) : (
                    <span>Market Intelligence</span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  {activeTool
                    ? tools.find(t => t.id === activeTool)?.name || 'Tool Workstation'
                    : activeTab}
                </h1>
              </div>
            </div>

            {/* Search — only show on tools hub when no tool open */}
            {activeTab === 'Tools Hub' && !activeTool && (
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tools..."
                  className="pl-11 pr-5 py-3 bg-white border border-gray-200/50 rounded-2xl w-full sm:w-72 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            )}
          </header>

          {/* ── Dynamic Route Content ── */}
          <Routes>
            {/* Tools Hub (Default) */}
            <Route path="/" element={
              <div className="space-y-8">
                {/* Partner Brokers Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Partner Prop Firms & Brokers</h2>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase">Verified</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Exness', type: 'Broker', offer: '0.0 Pips Spread', color: 'bg-amber-400', link: '#' },
                      { name: 'FTMO', type: 'Prop Firm', offer: '90% Profit Split', color: 'bg-blue-600', link: '#' },
                    ].map((partner) => (
                      <div key={partner.name} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center font-black text-white', partner.color)}>
                            {partner.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary text-sm">{partner.name}</div>
                            <div className="text-[10px] font-bold text-primary uppercase">{partner.offer}</div>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 group-hover:bg-primary group-hover:text-white rounded-xl text-xs font-bold transition-colors">
                          Join Now
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.length === 0 ? (
                  <div className="col-span-3 py-20 text-center text-text-secondary">
                    <Search className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No tools match "{search}"</p>
                  </div>
                ) : filteredTools.map((tool) => {
                  const isLocked = tool.tier !== 'Basic' && tier === 'Basic';
                  return (
                    <div key={tool.id} className="bento-card flex flex-col group relative overflow-hidden">
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-5', tool.bg)}>
                        <tool.icon className={cn('w-5 h-5', tool.color)} />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-text-primary text-sm">{tool.name}</h3>
                        {isLocked && <Lock className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-text-secondary mb-4 leading-relaxed">{tool.desc}</p>

                      {isLocked && tool.lockedFeatures && (
                        <ul className="mb-4 space-y-1.5">
                          {tool.lockedFeatures.map(f => (
                            <li key={f} className="text-xs text-text-secondary flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/30 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <div className="text-[10px] font-bold text-text-secondary uppercase">
                          {tool.cost === 0 ? 'Free' : `${tool.cost} Credits`}
                        </div>
                        <button
                          onClick={() => handleUseTool(tool)}
                          disabled={isLocked}
                          className={cn(
                            'text-sm font-bold transition-all flex items-center gap-1',
                            isLocked ? 'text-text-secondary cursor-not-allowed' : 'text-primary hover:gap-2'
                          )}
                        >
                          {isLocked ? 'Locked' : 'Open Tool'} {!isLocked && <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to="/pricing" className="bg-primary text-white px-5 py-2.5 rounded-full shadow-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                            Upgrade to Unlock
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          } />

            {/* Trading Log */}
            <Route path="/log" element={<TradingLog />} />

            {/* Alert Manager */}
            <Route path="/alerts" element={
              <div className="bento-card p-16 text-center bg-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mb-2">Neural Price Alerts</h2>
                  <p className="text-text-secondary mb-8 max-w-sm mx-auto text-sm">Real-time volatility and price action triggers delivered to your desktop and mobile device via push notifications.</p>
                  
                  {tier !== 'Pro' ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="px-4 py-2 bg-amber-50 rounded-full text-amber-700 font-bold text-[10px] uppercase tracking-widest border border-amber-100">
                        PRO ACCESS REQUIRED
                      </div>
                      <Link to="/pricing" className="btn-primary py-3 px-8 text-sm">Upgrade to Pro</Link>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                       <p className="text-sm font-bold text-primary">Pro Active. Alert dashboard loading...</p>
                       {/* Pro content for alerts will go here */}
                    </div>
                  )}
                </div>
              </div>
            } />

            {/* Affiliate Portal */}
            <Route path="/affiliate" element={<AffiliatePortal />} />

            {/* Education Lab */}
            <Route path="/learn" element={
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-text-primary">Institutional Syllabus</h2>
                  {tier !== 'Pro' && (
                    <div className="px-4 py-1.5 bg-primary/5 rounded-full text-primary font-black text-[10px] uppercase tracking-widest border border-primary/10">
                      Pro Access Only
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {tier !== 'Pro' && (
                    <div className="absolute inset-0 z-10 backdrop-blur-[4px] bg-white/20 flex items-center justify-center rounded-3xl">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-sm text-center">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="text-lg font-bold text-text-primary mb-2">Master Institutional Order Flow</h4>
                        <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                          Access our full database of professional trading courses and private webinars. Reserved for FXUTILITY Pro members.
                        </p>
                        <Link to="/pricing" className="btn-primary py-3 px-6 text-sm block">Upgrade to Unlock</Link>
                      </div>
                    </div>
                  )}
                  
                  {[
                    { title: 'Liquidity Concepts 101', desc: 'Understanding bank order blocks and fair value gaps.', time: '15 min', level: 'Institutional', link: '#' },
                    { title: 'Risk Management Architecture', desc: 'The math behind professional position sizing.', time: '10 min', level: 'Expert', link: '#' },
                    { title: 'Currency Correlation Matrix', desc: 'How to trade pair divergence like a macro fund.', time: '20 min', level: 'Advanced', link: '#' },
                    { title: 'Psychology of Scale', desc: 'Managing six-figure funded accounts without emotional bias.', time: '25 min', level: 'Elite', link: '#' },
                  ].map((course, i) => (
                    <div key={i} className={cn("bento-card bg-white", tier !== 'Pro' && "opacity-40 grayscale select-none pointer-events-none")}>
                      <div className="flex items-center justify-between mb-5">
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{course.level}</div>
                        <span className="text-xs text-text-secondary">{course.time} read</span>
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-2">{course.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-5">{course.desc}</p>
                      <button className={cn("text-sm font-bold flex items-center gap-2", tier !== 'Pro' ? "text-gray-400" : "text-primary hover:gap-3 transition-all")}>
                        {tier !== 'Pro' ? 'Locked' : 'Start Lesson'} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            } />

            {/* Settings */}
            <Route path="/settings" element={
              <div className="space-y-4 max-w-2xl mx-auto">
                {/* Profile Overview */}
                <div className="bento-card p-6 bg-white lg:hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl font-bold text-text-primary truncate">{displayName}</div>
                      <div className="text-sm text-text-secondary truncate">{user?.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-blue/50 text-primary text-[10px] font-black uppercase tracking-widest rounded-md border border-primary/10">
                        <Coins className="w-3 h-3" /> {credits} Credits
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bento-card p-6 bg-white">
                  <h3 className="font-bold text-base text-text-primary mb-5">Account Architecture</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <div className="font-bold text-sm text-text-primary">Current Plan</div>
                        <div className="text-xs text-text-secondary">{tier} Access</div>
                      </div>
                      {tier !== 'Pro' && (
                        <Link to="/pricing" className="text-primary font-bold text-sm">Upgrade →</Link>
                      )}
                    </div>
                    
                    {/* Subscription Auto-Renew */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <div className="font-bold text-sm text-text-primary">Subscription Auto-Renew</div>
                        <div className="text-xs text-text-secondary">Automatically bill when plan ends after 1 month</div>
                      </div>
                      <div 
                        onClick={() => {
                          setIsAutoRenew(!isAutoRenew);
                          if (!isAutoRenew) {
                            const subject = encodeURIComponent(`Enable Auto-Renew for ${user?.email || displayName}`);
                            const body = encodeURIComponent('Hello, please enable auto-renew for my subscription and send the invoice to my registered email address.');
                            window.location.href = `mailto:isaacbrainer4@gmail.com?subject=${subject}&body=${body}`;
                          }
                        }}
                        className={cn("w-11 h-6 rounded-full cursor-pointer relative transition-colors", isAutoRenew ? "bg-primary" : "bg-gray-300")}
                      >
                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isAutoRenew ? "right-1" : "left-1")}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <div className="font-bold text-sm text-text-primary">Credit Balance</div>
                        <div className="text-xs text-text-secondary">{credits} credits remaining</div>
                      </div>
                      <span className="text-lg font-black text-primary">⚡ {credits}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <div className="font-bold text-sm text-text-primary">Email Notifications</div>
                        <div className="text-xs text-text-secondary">Market summaries and signal alerts</div>
                      </div>
                      <div className="w-11 h-6 bg-primary rounded-full cursor-pointer relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="bento-card p-6 bg-white">
                  <h3 className="font-bold text-base text-text-primary mb-5 flex items-center justify-between">
                    Transaction History
                    <span className="text-[10px] font-bold text-text-secondary uppercase bg-gray-100 px-2 py-1 rounded">Recent</span>
                  </h3>
                  <div className="space-y-0">
                    {transactions.length === 0 ? (
                      <div className="py-6 text-center text-xs text-text-secondary">No recent transactions.</div>
                    ) : (
                      transactions.map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                          <div>
                            <div className="font-bold text-sm text-text-primary">{tx.type}</div>
                            <div className="text-[10px] font-bold text-text-secondary uppercase">{tx.date}</div>
                          </div>
                          <div className="text-right">
                            <div className={cn("font-bold text-sm", tx.color)}>{tx.amount}</div>
                            <div className="text-[10px] font-bold text-text-secondary uppercase">{tx.status}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Danger Zone / Sign Out */}
                <div className="pt-4 lg:hidden">
                  <button onClick={signOut} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 rounded-xl transition-colors border border-red-100">
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
                  </div>
                </div>
              </div>
            } />

            {/* Individual Tools */}
            <Route path="/tool/lotsize" element={<LotSizeCalculator />} />
            <Route path="/tool/pipvalue" element={<PipValueCalculator />} />
            <Route path="/tool/margin" element={<MarginCalculator />} />
            <Route path="/tool/profit" element={<ProfitCalculator />} />
            <Route path="/tool/propfirm" element={<PropFirmCalculator />} />
            <Route path="/tool/strength" element={<CurrencyStrengthMeter />} />
            <Route path="/tool/correlation" element={<CorrelationMatrix />} />
            <Route path="/tool/sessions" element={
              <div className="bento-card p-8 bg-white relative overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Sync</span>
                </div>
                <div className="text-center mb-10">
                  <div className="text-5xl md:text-6xl font-black text-text-primary mb-1 tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-[0.3em]">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone} (Local Time)
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {[
                    { name: 'Sydney',  open: 22, close: 7,  color: 'text-pink-600',   bg: 'bg-pink-50',   wrapsMidnight: true },
                    { name: 'Tokyo',   open: 0,  close: 9,  color: 'text-purple-600', bg: 'bg-purple-50', wrapsMidnight: false },
                    { name: 'London',  open: 8,  close: 16, color: 'text-blue-600',   bg: 'bg-blue-50',   wrapsMidnight: false },
                    { name: 'New York',open: 13, close: 22, color: 'text-orange-600', bg: 'bg-orange-50', wrapsMidnight: false },
                  ].map(session => {
                    const utcDay = currentTime.getUTCDay();
                    const utcHour = currentTime.getUTCHours();
                    const isWeekend = (utcDay === 5 && utcHour >= 22) || (utcDay === 6) || (utcDay === 0 && utcHour < 22);
                    const sessionOpen = session.wrapsMidnight ? utcHour >= session.open || utcHour < session.close : utcHour >= session.open && utcHour < session.close;
                    const isOpen = !isWeekend && sessionOpen;
                    return (
                      <div key={session.name} className={cn('p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2', session.bg)}>
                        <div className={cn('px-3 py-0.5 rounded-full text-[10px] font-black uppercase text-center', isWeekend ? 'bg-red-100 text-red-600' : isOpen ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500')}>
                          {isWeekend ? 'Weekend Closed' : isOpen ? '🟢 Open' : 'Closed'}
                        </div>
                        <h4 className={cn('font-bold text-sm', session.color)}>{session.name}</h4>
                        <p className="text-[10px] text-text-secondary text-center">{session.open}:00 – {session.close}:00 UTC</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-xs text-text-secondary mt-8 pt-6 border-t border-gray-100">Peak institutional liquidity: <strong>London/NY Overlap</strong> (13:00 – 16:00 UTC)</p>
              </div>
            } />
            <Route path="/tool/signals" element={
              <div className="bento-card p-12 text-center bg-white">
                <Brain className="w-20 h-20 text-purple-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-text-primary mb-4">Neural Signal Engine</h2>
                <p className="text-text-secondary max-w-md mx-auto mb-8">The institutional AI model is training on the latest HFT liquidity data. Live signals will be available shortly.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 font-bold text-xs uppercase tracking-widest">System Training in Progress</div>
              </div>
            } />
            <Route path="/tool/edge" element={<EdgeScanner />} />
          </Routes>
        </div>
      </main>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 backdrop-blur-xl border-t border-gray-100 safe-area-bottom pb-2">
        <div className="flex items-stretch justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.name && !activeTool;
            return (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 px-1 py-1 rounded-2xl transition-all relative',
                  isActive ? 'text-primary' : 'text-text-secondary active:scale-90'
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive ? "bg-primary/10" : "hover:bg-gray-50"
                )}>
                  <item.icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                </div>
                <span className={cn('text-[10px] font-bold tracking-tight', isActive ? 'font-black' : 'opacity-60')}>
                  {item.mobileLabel}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Top Up Modal ─────────────────────────────────── */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-text-primary mb-2">Insufficient Credits / Top Up</h3>
            <p className="text-sm text-text-secondary mb-6">
              You need more credits to use this tool. Choose an amount below to instantly top up your account. Available for both Free and Premium users.
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount)}
                    className={cn(
                      "py-3 rounded-xl border text-sm font-bold transition-all",
                      topUpAmount === amount 
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                        : "bg-white border-gray-200 text-text-primary hover:border-primary/50"
                    )}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Custom Amount</label>
                <input 
                  type="number" 
                  min="50"
                  step="50"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-mono"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-blue-900">Total Price</div>
                  <div className="text-xs text-blue-700">1 Credit = $0.02</div>
                </div>
                <div className="text-xl font-black text-blue-900">${(topUpAmount * 0.02).toFixed(2)}</div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isAutoRenew} onChange={() => setIsAutoRenew(!isAutoRenew)} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span className="text-xs font-bold text-text-secondary">Enable Auto-TopUp when empty</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowTopUpModal(false)} className="flex-1 px-6 py-3 bg-gray-100 text-text-primary rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <a 
                  href={`mailto:isaacbrainer4@gmail.com?subject=Credit Top Up Request: ${topUpAmount} Credits&body=Hello,%0D%0A%0D%0AI would like to purchase ${topUpAmount} credits for $${(topUpAmount * 0.02).toFixed(2)}. Please send me the payment instructions.%0D%0A%0D%0AAuto-renew: ${isAutoRenew ? 'Yes' : 'No'}`}
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 px-6 py-3 bg-primary text-white text-center rounded-xl font-bold text-sm hover:opacity-90 transition-opacity block"
                >
                  Pay via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
