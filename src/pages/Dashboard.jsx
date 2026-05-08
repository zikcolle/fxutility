import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { useCredit } from '../context/CreditContext';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import LotSizeCalculator from '../components/tools/LotSizeCalculator';
import PipValueCalculator from '../components/tools/PipValueCalculator';
import MarginCalculator from '../components/tools/MarginCalculator';
import ProfitCalculator from '../components/tools/ProfitCalculator';

const Dashboard = () => {
  const { credits, tier } = useCredit();
  const { signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('Tools Hub');
  const [activeTool, setActiveTool] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync tab with URL
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const tools = [
    { name: "Lot Size Calculator", id: 'lotsize', cost: 2, icon: ShieldCheck, tier: "Basic", color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Pip Value Intelligence", id: 'pipvalue', cost: 2, icon: TrendingUp, tier: "Basic", color: "text-green-500", bg: "bg-green-50" },
    { name: "Margin Requirement", id: 'margin', cost: 2, icon: Coins, tier: "Basic", color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Profit/Loss Architect", id: 'profit', cost: 2, icon: DollarSign, tier: "Basic", color: "text-indigo-500", bg: "bg-indigo-50" },
    { name: "Prop Firm Guard", id: 'propfirm', cost: 5, icon: ShieldCheck, tier: "Premium", color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Session Overlap", id: 'sessions', cost: 0, icon: Zap, tier: "Basic", color: "text-cyan-500", bg: "bg-cyan-50" },
    { name: "AI Signal Engine", id: 'signals', cost: 10, icon: Brain, tier: "Premium", color: "text-purple-500", bg: "bg-purple-50" },
    { name: "Edge Scanner Pro", id: 'edge', cost: 15, icon: BarChart2, tier: "Pro", color: "text-red-500", bg: "bg-red-50" }
  ];

  const handleUseTool = (tool) => {
    if (tool.tier !== "Basic" && tier === "Basic") {
      alert("This tool requires a Premium or Pro subscription.");
      return;
    }
    setActiveTool(tool.id);
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 pt-20">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:block fixed left-0 top-20 bottom-0 p-6">
        <div className="space-y-1">
          {[
            { name: "Tools Hub", icon: LayoutDashboard },
            { name: "Trading Log", icon: BarChart2 },
            { name: "Alert Manager", icon: Zap },
            { name: "Education Lab", icon: Brain },
            { name: "Settings", icon: Settings }
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                activeTab === item.name 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity", activeTab === item.name && "opacity-100")} />
            </button>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-accent-blue/50 rounded-2xl p-4 border border-primary/10 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase">Balance</span>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">{credits} <span className="text-sm font-medium text-text-secondary">Credits</span></div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{tier} Plan</div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 mb-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setActiveTab('Settings')}>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <User className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-text-primary truncate">Isaac Ogunwale</div>
              <div className="text-[10px] font-bold text-text-secondary uppercase">View Profile</div>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {activeTool && (
                  <button 
                    onClick={() => setActiveTool(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                )}
                <h1 className="text-3xl font-bold text-text-primary">
                  {activeTool ? "Tool Workstation" : "Elite Terminal"}
                </h1>
              </div>
              <p className="text-text-secondary text-sm">
                {activeTool ? "Configure your parameters and run institutional analysis." : "Welcome back, Isaac. Professional market insights are ready."}
              </p>
            </div>
            {!activeTool && (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tools..." 
                  className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-full w-full md:w-80 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}
          </header>

          {activeTool === 'lotsize' && <LotSizeCalculator />}
          {activeTool === 'pipvalue' && <PipValueCalculator />}
          {activeTool === 'margin' && <MarginCalculator />}
          {activeTool === 'profit' && <ProfitCalculator />}
          {activeTool === 'signals' && (
            <div className="bento-card p-12 text-center bg-white">
              <Brain className="w-20 h-20 text-purple-500 mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-bold text-text-primary mb-4">Neural Signal Engine</h2>
              <p className="text-text-secondary max-w-md mx-auto mb-8">
                The institutional AI model is currently training on the latest HFT liquidity data. 
                Live signals will be available shortly.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 font-bold text-xs uppercase tracking-widest">
                System Training in Progress
              </div>
            </div>
          )}
          {activeTool === 'edge' && (
            <div className="bento-card p-12 text-center bg-white">
              <BarChart2 className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-text-primary mb-4">Edge Scanner Pro</h2>
              <p className="text-text-secondary max-w-md mx-auto mb-8">
                The scanner requires a high-bandwidth connection to the currency correlation matrix. 
                Initializing neural nodes...
              </p>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-red-500/20 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />)}
              </div>
            </div>
          )}
          
          {activeTool === 'propfirm' && (
            <div className="bento-card p-12 text-center bg-white">
              <ShieldCheck className="w-20 h-20 text-amber-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-text-primary mb-4">Prop Firm Guard</h2>
              <p className="text-text-secondary max-w-md mx-auto mb-8">
                Protect your $100k+ accounts. Our risk monitor tracks daily drawdown and equity trailing rules in real-time.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full text-amber-600 font-bold text-xs uppercase tracking-widest">
                Connecting to Broker API...
              </div>
            </div>
          )}
          {activeTool === 'sessions' && (
            <div className="bento-card p-12 text-center bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Sync</span>
                </div>
              </div>
              
              <div className="text-6xl font-black text-text-primary mb-2 tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-[0.3em] mb-12">
                {Intl.DateTimeFormat().resolvedOptions().timeZone} (Local Time)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { name: "Asian Session", open: 0, close: 8, color: "text-purple-600", bg: "bg-purple-50" },
                  { name: "London Session", open: 8, close: 16, color: "text-blue-600", bg: "bg-blue-50" },
                  { name: "New York Session", open: 13, close: 21, color: "text-orange-600", bg: "bg-orange-50" }
                ].map(session => {
                  const utcHour = currentTime.getUTCHours();
                  const isOpen = utcHour >= session.open && utcHour < session.close;
                  return (
                    <div key={session.name} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center">
                      <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4", isOpen ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>
                        {isOpen ? 'Live Now' : 'Closed'}
                      </div>
                      <h4 className="font-bold text-text-primary mb-1">{session.name}</h4>
                      <p className="text-xs text-text-secondary">{session.open}:00 - {session.close}:00 UTC</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-sm text-text-secondary">
                  Institutional liquidity peaks during the **London/NY Overlap** (13:00 - 16:00 UTC).
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'Tools Hub' && !activeTool && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => {
                const isLocked = tool.tier !== "Basic" && tier === "Basic";
                return (
                  <div key={tool.name} className="bento-card flex flex-col group relative overflow-hidden">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", tool.bg)}>
                      <tool.icon className={cn("w-6 h-6", tool.color)} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-text-primary">{tool.name}</h3>
                      {isLocked && <Lock className="w-3.5 h-3.5 text-text-secondary" />}
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-8 leading-relaxed">
                      Access institutional data streams for {tool.name.toLowerCase()} analysis.
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-xs font-bold text-text-secondary uppercase">{tool.cost} Credits</div>
                      <button 
                        onClick={() => handleUseTool(tool)}
                        disabled={isLocked}
                        className={cn(
                          "text-sm font-bold transition-all flex items-center gap-1",
                          isLocked ? "text-text-secondary cursor-not-allowed" : "text-primary hover:gap-2"
                        )}
                      >
                        {isLocked ? 'Locked' : 'Open Tool'} {!isLocked && <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    {isLocked && tier !== 'Pro' && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white px-6 py-3 rounded-full shadow-xl border border-gray-100 font-bold text-sm text-primary">
                          Upgrade to Unlock
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'Trading Log' && (
            <div className="bento-card p-20 text-center bg-white">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <BarChart2 className="w-10 h-10 text-primary/20" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Institutional Ledger</h2>
              <p className="text-text-secondary mb-8 max-w-sm mx-auto">The automated trade verification system is currently in beta. Manual logging will be available in V1.3.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest">
                Coming Soon • Q3 2026
              </div>
            </div>
          )}

          {activeTab === 'Alert Manager' && (
            <div className="bento-card p-20 text-center bg-white">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Zap className="w-10 h-10 text-primary/20" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Neural Alerts</h2>
              <p className="text-text-secondary mb-8 max-w-sm mx-auto">Set price or volatility triggers to receive desktop notifications across all devices.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest">
                Under Construction
              </div>
            </div>
          )}

          {activeTab === 'Education Lab' && (
            <div className="space-y-8">
              <header className="mb-12">
                <h2 className="text-3xl font-bold text-text-primary mb-2">Institutional Education</h2>
                <p className="text-text-secondary">Master the methodologies used by professional bank desks.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Liquidity Concepts 101", desc: "Understanding bank order blocks and fair value gaps.", time: "15 min read", level: "Institutional" },
                  { title: "Risk Management Architecture", desc: "The math behind professional position sizing.", time: "10 min read", level: "Expert" },
                  { title: "Currency Correlation Matrix", desc: "How to trade pair divergence like a macro fund.", time: "20 min read", level: "Advanced" }
                ].map((course, i) => (
                  <div key={i} className="bento-card bg-white hover:border-primary/20 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="px-3 py-1 bg-primary/5 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">{course.level}</div>
                      <span className="text-xs text-text-secondary">{course.time}</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-6">{course.desc}</p>
                    <button className="text-sm font-bold text-primary flex items-center gap-2">
                      Start Lesson <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="space-y-6">
              <div className="bento-card p-8 bg-white">
                <h3 className="font-bold text-lg text-text-primary mb-6">Account Architecture</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-gray-50">
                    <div>
                      <div className="font-bold text-text-primary">Current Plan</div>
                      <div className="text-xs text-text-secondary">{tier} Access</div>
                    </div>
                    {tier !== 'Pro' && (
                      <Link to="/pricing" className="text-primary font-bold text-sm">Upgrade</Link>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <div className="font-bold text-text-primary">Email Notifications</div>
                      <div className="text-xs text-text-secondary">Market summaries and signal alerts</div>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
