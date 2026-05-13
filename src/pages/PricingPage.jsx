import { useState, useEffect } from 'react';
import { Check, Zap, Shield, Crown, ArrowUpRight, Sun, Moon, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../context/UserContext";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../context/AuthContext';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const PricingPage = ({ currentPlan = 'basic', onUpgrade }) => {
  const [yearly, setYearly] = useState(false);
  const [cur, setCur] = useState({ code: 'NGN', rate: 1, country: null });
  const [curLoading, setCurLoading] = useState(true);
  const { tier: currentTier, setTier, refreshProfile } = useUser();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'FXUtility Pricing — Free and Pro Forex Tools';
    // SEO Meta Tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'FXUtility pricing plans: Free tools, Pro features, and Team accounts. Start with free forex calculators and upgrade for advanced AI signals and prop firm tracking.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'FXUtility pricing plans: Free tools, Pro features, and Team accounts. Start with free forex calculators and upgrade for advanced AI signals and prop firm tracking.';
      document.head.appendChild(meta);
    }
  }, []);

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
      name: 'Basic',
      monthlyPrice: 0,
      yearlyPrice: 0,
      tagline: 'Free access to the core calculators every trader needs.',
      icon: Shield,
      tools: [
        { name: 'Lot Size Calculator', desc: 'My risk, my position size, no guesswork.', free: true },
        { name: 'Pip Value Calculator', desc: 'Exact pip value in account currency for every pair.', free: true },
        { name: 'Margin Requirement', desc: 'Know your required margin before you place the order.', free: true },
        { name: 'Profit/Loss Estimator', desc: 'Plan your trade outcome before you execute.', free: true },
        { name: 'Currency Strength Meter', desc: 'See which majors are trending strongest.', free: true }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 10000,
      yearlyPrice: 100000,
      tagline: 'A complete desk for serious retail traders.',
      icon: Zap,
      popular: true,
      tools: [
        { name: 'Prop Firm Guard', desc: 'Track drawdown against FTMO, The5ers, Topstep, and more.', ai: false },
        { name: 'Correlation Matrix', desc: 'Avoid trade duplication with live pair correlation.', ai: false },
        { name: 'Session Overlap', desc: 'Plan entries when liquidity and volatility line up.', ai: false }
      ],
      inherited: ['basic']
    },
    {
      id: 'team',
      name: 'Team',
      monthlyPrice: 25000,
      yearlyPrice: 250000,
      tagline: 'Shared access and advanced desk tools for funded teams.',
      icon: Crown,
      tools: [
        { name: 'Alert Manager', desc: 'Team-wide alerts and shared trade signals.', ai: false },
        { name: 'API Access', desc: 'Feed live rate data into your own tools.', ai: false },
        { name: 'Dedicated Support', desc: 'Priority help when your desk is live.', ai: false }
      ],
      inherited: ['basic', 'pro']
    }
  ];


  const effectivePlan = currentTier || currentPlan;
  const getPlanState = (planId) => {
    const planIndex = { basic: 0, pro: 1, team: 2 }[planId];
    const currentIndex = { basic: 0, pro: 1, team: 2 }[effectivePlan] ?? 0;

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

    if (effectivePlan === 'basic' && plan.id === 'pro') {
      return 'INCLUDES BASIC TOOLS, PLUS:';
    }
    if (effectivePlan === 'pro' && plan.id === 'team') {
      return 'YOUR CURRENT TOOLS, PLUS:';
    }
    if (effectivePlan === 'basic' && plan.id === 'team') {
      return 'INCLUDES ALL LOWER PLAN TOOLS, PLUS:';
    }
    return null;
  };

  const payWithPaystack = async (plan) => {
    if (!user) {
      toast.error("Please sign in to upgrade.");
      return;
    }

    if (plan.monthlyPrice === 0 && plan.yearlyPrice === 0) {
      toast.error("Basic plan is free. You already have access to basic tools.");
      return;
    }

    try {
      await loadPaystackScript();
    } catch (error) {
      console.error(error);
      toast.error("Paystack could not load. Please refresh and try again.");
      return;
    }

    if (!window.PaystackPop) {
      toast.error("Paystack could not load. Please refresh and try again.");
      return;
    }

    const amount = yearly ? plan.yearlyPrice : plan.monthlyPrice;
    const billingCycle = yearly ? 'yearly' : 'monthly';

    const handlePaymentCallback = async (response) => {
      try {
        const { error } = await supabase.rpc('record_paystack_payment', {
          p_reference: response.reference,
          p_plan_tier: plan.name,
          p_amount_kobo: amount * 100,
          p_billing_cycle: billingCycle,
        });

        if (error) {
          console.error('Payment recording failed:', error);
          toast.error(
            "Payment succeeded, but we could not update your account. Please contact support with reference: " +
              response.reference
          );
          return;
        }

        await refreshProfile();
        setTier(plan.name);
        toast.success(`${plan.name} activated.`);
      } catch (e) {
        console.error('Error processing payment:', e);
        toast.error("Something went wrong after payment. Please contact support.");
      }
    };

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: amount * 100,
      currency: "NGN",
      metadata: {
        user_id: user.id,
        plan_tier: plan.name,
        billing_cycle: billingCycle,
      },
      onClose: function () {
        console.log("Payment window closed");
      },
      onSuccess: function (response) {
        handlePaymentCallback(response);
      },
    });

    handler.openIframe();
  };

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
        {/* Pricing section starts here - Navbar is rendered in App.jsx */}
        <div className="max-w-[980px] mx-auto px-6 pt-8 pb-12">

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
                  className="absolute top-0.5 w-6 h-6 bg-primary rounded-full shadow-md"
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
                    plan.popular && "border-primary border-2"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}

                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    isDark
                      ? plan.id === 'basic' ? "bg-[#1a2035]" : plan.id === 'premium' ? "bg-[#1e1535]" : "bg-[#251c0a]"
                      : plan.id === 'basic' ? "bg-[#dbeafe]" : plan.id === 'premium' ? "bg-[#ede9fe]" : "bg-[#fef3c7]"
                  )}>
                    <plan.icon className="w-6 h-6 text-primary" />
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
                      state === 'upgrade' && idx === 1 && "bg-primary text-white hover:opacity-90",
                      state === 'upgrade' && idx !== 1 && "border border-primary text-primary bg-transparent hover:bg-primary hover:text-white"
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
                                ? "bg-primary/10 text-primary border-primary/20"
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
                        <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
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
                              <span className="text-xs font-bold bg-primary text-white px-1.5 py-0.5 rounded uppercase tracking-widest">
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

          <div className={cn(
            "mt-12 p-6 rounded-xl border",
            isDark ? "bg-[#111113] border-[#1c1c20]" : "bg-white border-[#e2e8f0]"
          )}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2563eb]/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#2563eb]" />
              </div>
              <div>
                <div className="font-bold text-sm mb-1">No per-use credits required</div>
                <div className={cn(
                  "text-xs",
                  isDark ? "text-[#888888]" : "text-[#64748b]"
                )}>
                  Paid plans unlock advanced tools by tier only. Basic users keep access to all core calculators forever, while Pro and Team unlock premium desk features.
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "mt-10 p-8 rounded-3xl border",
            isDark ? "bg-[#111113] border-[#1c1c20]" : "bg-white border-[#e2e8f0]"
          )}>
            <h2 className="text-xl font-bold text-text-primary mb-4">Frequently asked questions</h2>
            <div className="grid gap-4">
              {[
                { question: 'Is the free plan really free?', answer: 'Yes. Basic access gives you all essential calculators without a credit card or trial period.' },
                { question: 'Can I switch from Pro to Team later?', answer: 'Absolutely. Upgrade anytime and keep your data across plans.' },
                { question: 'What payment methods do you accept?', answer: 'Paystack is our secure checkout provider. Local card and bank payments are supported where available.' }
              ].map((item, idx) => (
                <div key={idx} className={cn(
                  "p-4 rounded-2xl border",
                  isDark ? "border-[#1e1e22] bg-[#0f1319]" : "border-[#e8edf3] bg-[#f8fafc]"
                )}>
                  <h3 className="font-bold text-sm mb-2">{item.question}</h3>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-[#d1d5db]" : "text-[#475569]"
                  )}>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PricingPage;