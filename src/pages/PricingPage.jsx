import { useState, useEffect } from 'react';
import { Check, Zap, Shield, Crown, ArrowUpRight, Sun, Moon, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCredit } from '../context/CreditContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../context/AuthContext';
import { cn } from '../lib/utils';
import Footer from '../components/Footer';

const PricingPage = ({ currentPlan = 'basic', onUpgrade }) => {
  const [yearly, setYearly] = useState(false);
  const [cur, setCur] = useState({ code: 'NGN', rate: 1, country: null });
  const [curLoading, setCurLoading] = useState(true);
  const { tier: currentTier, setTier, refreshProfile } = useCredit();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Currency detection
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        if (ipData.currency !== 'NGN') {
          const rateResponse = await fetch('https://open.er-api.com/v6/latest/NGN');
          const rateData = await rateResponse.json();
          setCur({
            code: ipData.currency,
            rate: rateData.rates[ipData.currency] || 1,
            country: ipData.country_name
          });
        } else {
          setCur({
            code: 'NGN',
            rate: 1,
            country: ipData.country_name
          });
        }
      } catch (error) {
        console.error('Currency detection failed:', error);
        setCur({ code: 'NGN', rate: 1, country: null });
      } finally {
        setCurLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const loadPaystackScript = () => {
    const scriptUrl = 'https://js.paystack.co/v1/inline.js';
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script.')));
        return;
      }

      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Paystack script.'));
      document.head.appendChild(script);
    });
  };

  const formatPrice = (ngnAmount) => {
    if (curLoading) return '—';
    const converted = ngnAmount * cur.rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(converted);
  };

  const getYearlyEquivalent = (monthlyAmount) => {
    if (curLoading) return '—';
    const yearlyTotal = monthlyAmount * 12 * 0.8; // 20% discount
    const monthlyEquivalent = yearlyTotal / 12;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monthlyEquivalent);
  };

  const plans = [
    {
      id: 'basic',
      name: "Basic",
      monthlyPrice: 0,
      yearlyPrice: 0,
      tagline: "Perfect for beginners and casual traders.",
      icon: Shield,
      tools: [
        { name: "Lot Size Calculator", desc: "Protect 1–2% risk per trade", free: false },
        { name: "Pip Value Intelligence", desc: "Exact pip value across all pairs", free: false },
        { name: "Margin Requirement", desc: "Broker margin for any position", free: false },
        { name: "Profit/Loss Architect", desc: "P&L projection before entry", free: false },
        { name: "Currency Strength Meter", desc: "Real-time 8-pair ranking", free: true },
        { name: "Session Overlap", desc: "Live market session clock", free: true }
      ]
    },
    {
      id: 'premium',
      name: "Premium",
      monthlyPrice: 10000,
      yearlyPrice: 100000,
      tagline: "For serious traders needing more precision.",
      icon: Zap,
      popular: true,
      tools: [
        { name: "Prop Firm Guard", desc: "Real-time drawdown tracker", ai: false },
        { name: "Correlation Matrix", desc: "28-pair correlation heatmap", ai: false },
        { name: "AI Signal Engine", desc: "Neural network trade setups", ai: true }
      ],
      inherited: ['basic']
    },
    {
      id: 'pro',
      name: "Pro",
      monthlyPrice: 25000,
      yearlyPrice: 250000,
      tagline: "Unlimited power for high-frequency pros.",
      icon: Crown,
      tools: [
        { name: "Edge Scanner Pro", desc: "High-probability edge detection", ai: true },
        { name: "Alert Manager", desc: "Custom trade alert system", ai: false },
        { name: "Educational Lab", desc: "Institutional trading education", ai: false }
      ],
      inherited: ['basic', 'premium']
    }
  ];

  const getPlanState = (planId) => {
    const planIndex = { basic: 0, premium: 1, pro: 2 }[planId];
    const currentIndex = { basic: 0, premium: 1, pro: 2 }[currentPlan];

    if (planIndex === currentIndex) return 'current';
    if (planIndex < currentIndex) return 'owned';
    return 'upgrade';
  };

  const getInheritedTools = (plan) => {
    if (!plan.inherited) return [];

    const inheritedTools = [];
    plan.inherited.forEach(inheritedId => {
      const inheritedPlan = plans.find(p => p.id === inheritedId);
      if (inheritedPlan) {
        inheritedTools.push(...inheritedPlan.tools);
      }
    });
    return inheritedTools;
  };

  const getInheritedLabel = (plan) => {
    const state = getPlanState(plan.id);
    if (state === 'current') return null;

    if (currentPlan === 'basic' && plan.id === 'premium') {
      return "INCLUDES BASIC TOOLS, PLUS:";
    }
    if (currentPlan === 'premium' && plan.id === 'pro') {
      return "YOUR CURRENT TOOLS, PLUS:";
    }
    if (currentPlan === 'basic' && plan.id === 'pro') {
      return "INCLUDES ALL LOWER PLAN TOOLS, PLUS:";
    }
    return null;
  };

  const payWithPaystack = async (plan) => {
    if (!user) {
      alert("Please sign in to upgrade.");
      return;
    }
  
    const amount = yearly ? plan.yearlyPrice : plan.monthlyPrice;

const handler = window.PaystackPop.setup({
  key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  email: user.email,
  amount: amount * 100,
  currency: "NGN",
  metadata: {
    user_id: user.id,
    plan_tier: plan.name,
    billing_cycle: yearly ? 'yearly' : 'monthly',
  },

  callback: function (response) {
    supabase
      .rpc('record_paystack_payment', {
        p_reference: response.reference,
        p_plan_tier: plan.name,
        p_credits: 0,
        p_amount_kobo: amount * 100,
        p_billing_cycle: yearly ? 'yearly' : 'monthly',
        p_payment_type: 'subscription',
      })
      .then(async ({ error }) => {
        if (error) {
          console.error('Payment recording failed:', error);
          alert(
            "Payment succeeded, but we could not update your account automatically. Please contact support with reference: " +
              response.reference
          );
          return;
        }

        await refreshProfile();
        setTier(plan.name);
        alert(`${plan.name} activated.`);
      })
      .catch((e) => {
        console.error(e);
        alert("Something went wrong after payment. Please contact support.");
      });
  },

  onClose: function () {
    console.log("Window closed");
  },
});

handler.openIframe();
};
  function handleTopUpCredits() {
      navigate('/dashboard?topup=true');
    }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Geist', 'Inter', system-ui, sans-serif; }
      `}</style>

      <div className={cn(
        "min-h-screen transition-colors duration-300 pt-20",
        isDark ? "bg-[#0a0a0b] text-white" : "bg-[#f0f2f5] text-[#0f172a]"
      )}>

        {/* Header */}
        <div className="max-w-[980px] mx-auto px-6 pt-8 pb-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">FXUTILITY<span className="text-[#2563eb]">.</span></span>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-[#1a1a1c] text-[#888888] text-xs rounded-full border border-[#1e1e22]">
                INSTITUTIONAL HUB V1.2
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1c] text-[#888888] text-xs rounded-full border border-[#1e1e22]">
                <MapPin className="w-3 h-3" />
                {curLoading ? '...' : `${cur.country || 'Nigeria'} · ${cur.code}`}
              </div>
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg border border-[#1e1e22] bg-[#1a1a1c] flex items-center justify-center hover:bg-[#1e1e22] transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-[#888888]" /> : <Moon className="w-4 h-4 text-[#64748b]" />}
              </button>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn(
              "text-sm font-semibold transition-colors",
              !yearly ? (isDark ? "text-white" : "text-[#0f172a]") : (isDark ? "text-[#888888]" : "text-[#64748b]")
            )}>Monthly</span>
            <div className="relative">
              <button
                onClick={() => setYearly(!yearly)}
                className={cn(
                  "w-14 h-7 rounded-full border transition-colors",
                  isDark ? "bg-[#1a1a1c] border-[#1e1e22]" : "bg-white border-[#e2e8f0]"
                )}
              >
                <motion.div
                  animate={{ left: yearly ? 23 : 3 }}
                  transition={{ type: "tween", duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute top-0.5 w-6 h-6 bg-[#2563eb] rounded-full shadow-md"
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold transition-colors",
                yearly ? (isDark ? "text-white" : "text-[#0f172a]") : (isDark ? "text-[#888888]" : "text-[#64748b]")
              )}>Yearly</span>
              <span className="text-[10px] font-bold bg-[#22c55e] text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                Save 20%
              </span>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 align-start">
            {plans.map((plan, idx) => {
              const state = getPlanState(plan.id);
              const inheritedTools = getInheritedTools(plan);
              const inheritedLabel = getInheritedLabel(plan);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "relative p-6 rounded-xl border transition-all",
                    isDark ? "bg-[#111113] border-[#1c1c20]" : "bg-white border-[#e2e8f0]",
                    plan.popular && "border-[#2563eb] border-2"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563eb] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}

                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    isDark
                      ? plan.id === 'basic' ? "bg-[#1a2035]" : plan.id === 'premium' ? "bg-[#1e1535]" : "bg-[#251c0a]"
                      : plan.id === 'basic' ? "bg-[#dbeafe]" : plan.id === 'premium' ? "bg-[#ede9fe]" : "bg-[#fef3c7]"
                  )}>
                    <plan.icon className="w-6 h-6 text-[#2563eb]" />
                  </div>

                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <p className={cn(
                    "text-sm mb-6 leading-relaxed",
                    isDark ? "text-[#888888]" : "text-[#64748b]"
                  )}>{plan.tagline}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold">
                        {formatPrice(yearly ? plan.yearlyPrice : plan.monthlyPrice)}
                      </span>
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-[#888888]" : "text-[#64748b]"
                      )}>/{yearly ? 'yr' : 'mo'}</span>
                    </div>
                    {yearly && (
                      <div className={cn(
                        "text-xs",
                        isDark ? "text-[#3a3a3e]" : "text-[#b0bec5]"
                      )}>
                        ≈ {getYearlyEquivalent(plan.monthlyPrice)}/mo billed annually
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => state === 'upgrade' && payWithPaystack(plan)}
                    className={cn(
                      "w-full py-3 rounded-lg font-bold text-sm mb-6 transition-all",
                      state === 'current' && "bg-[#1a1a1c] text-[#888888] cursor-not-allowed",
                      state === 'owned' && "bg-[#1a1a1c] text-[#888888] cursor-not-allowed",
                      state === 'upgrade' && idx === 1 && "bg-[#2563eb] text-white hover:opacity-90",
                      state === 'upgrade' && idx !== 1 && "border border-[#2563eb] text-[#2563eb] bg-transparent hover:bg-[#2563eb] hover:text-white"
                    )}
                  >
                    {state === 'current' && 'Current Plan'}
                    {state === 'owned' && 'Included in your plan'}
                    {state === 'upgrade' && `Upgrade to ${plan.name}`}
                  </button>

                  {/* Inherited Tools */}
                  {inheritedLabel && inheritedTools.length > 0 && (
                    <div className="mb-4">
                      <div className={cn(
                        "text-xs font-bold uppercase tracking-widest mb-3",
                        isDark ? "text-[#888888]" : "text-[#64748b]"
                      )}>
                        {inheritedLabel}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {inheritedTools.map((tool, toolIdx) => (
                          <div
                            key={toolIdx}
                            className={cn(
                              "px-2 py-1 rounded-full text-xs border",
                              state === 'owned'
                                ? "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20"
                                : isDark ? "bg-[#1a1a1c] text-[#3a3a3e] border-[#1e1e22]" : "bg-[#f1f5f9] text-[#b0bec5] border-[#e8edf3]"
                            )}
                          >
                            {tool.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Own Tools */}
                  <div className="space-y-3">
                    {plan.tools.map((tool, toolIdx) => (
                      <div key={toolIdx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#2563eb]/10 border border-[#2563eb] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#2563eb]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{tool.name}</span>
                            {tool.free && (
                              <span className="text-xs font-bold bg-[#22c55e] text-white px-1.5 py-0.5 rounded uppercase tracking-widest">
                                Free
                              </span>
                            )}
                            {tool.ai && (
                              <span className="text-xs font-bold bg-[#2563eb] text-white px-1.5 py-0.5 rounded uppercase tracking-widest">
                                AI
                              </span>
                            )}
                          </div>
                          <div className={cn(
                            "text-xs mt-1",
                            isDark ? "text-[#3a3a3e]" : "text-[#b0bec5]"
                          )}>
                            {tool.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI Credits Footer */}
          <div className={cn(
            "mt-12 p-6 rounded-xl border",
            isDark ? "bg-[#111113] border-[#1c1c20]" : "bg-white border-[#e2e8f0]"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2563eb]/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div>
                  <div className="font-bold text-sm mb-1">AI-powered tools use credits</div>
                  <div className={cn(
                    "text-xs",
                    isDark ? "text-[#888888]" : "text-[#64748b]"
                  )}>
                    Your plan unlocks tool access. AI Signal Engine (Premium+) and Edge Scanner Pro (Pro) consume credits per use — top up any time. No wasted monthly allocations.
                  </div>
                </div>
              </div>
              <button 
                onClick={handleTopUpCredits}
                className="text-[#2563eb] hover:underline text-sm font-bold"
              >
                Top up credits →
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PricingPage;