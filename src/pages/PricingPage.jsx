import React, { useState } from 'react';
import { Check, Zap, Shield, Crown, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCredit } from '../context/CreditContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import Footer from '../components/Footer';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { tier: currentTier, setTier } = useCredit();
  const { user } = useAuth();

  const plans = [
    {
      name: "Basic",
      price: billingCycle === 'monthly' ? "$0" : "$0",
      credits: "50 Credits/mo",
      desc: "Perfect for beginners and casual traders.",
      icon: Shield,
      color: "bg-blue-50 text-blue-600",
      amount: 0,
      features: ["All Standard Calculators", "Daily Market Recap", "Email Support", "Single Device Access"]
    },
    {
      name: "Premium",
      price: billingCycle === 'monthly' ? "$19" : "$190",
      credits: "500 Credits/mo",
      desc: "For serious traders needing more precision.",
      icon: Zap,
      color: "bg-purple-50 text-purple-600",
      amount: billingCycle === 'monthly' ? 10000 : 100000, // NGN
      popular: true,
      features: ["AI Setup Alerts", "Volatility Heatmaps", "Premium Discord Access", "Priority API Access", "Multiple Device Access"]
    },
    {
      name: "Pro",
      price: billingCycle === 'monthly' ? "$49" : "$490",
      credits: "Unlimited Credits",
      desc: "Unlimited power for high-frequency pros.",
      icon: Crown,
      color: "bg-orange-50 text-orange-600",
      amount: billingCycle === 'monthly' ? 25000 : 250000, // NGN
      features: ["Institutional Edge Scanner", "Custom Neural Models", "1-on-1 Strategy Session", "Custom Webhooks", "Zero Latency Data"]
    }
  ];

  const payWithPaystack = (plan) => {
    if (!user) {
      alert("Please sign in to upgrade.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: plan.amount * 100, // Kobo
      currency: "NGN",
      callback: (response) => {
        handleUpgrade(plan.name);
      },
      onClose: () => {
        console.log("Window closed");
      }
    });
    handler.openIframe();
  };

  const handleUpgrade = (tierName) => {
    setTier(tierName);
  };

  return (
    <>
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-text-primary mb-6"
          >
            Simple, Transparent <span className="text-primary">Pricing.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg mb-10"
          >
            Choose the level of market intelligence that fits your trading style.
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn("text-sm font-semibold", billingCycle === 'monthly' ? "text-text-primary" : "text-text-secondary")}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-7 bg-gray-100 rounded-full p-1 relative flex items-center transition-colors hover:bg-gray-200"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                className="w-5 h-5 bg-primary rounded-full shadow-md"
              />
            </button>
            <span className={cn("text-sm font-semibold flex items-center gap-2", billingCycle === 'yearly' ? "text-text-primary" : "text-text-secondary")}>
              Yearly <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "bento-card relative flex flex-col p-8",
                plan.popular ? "border-primary/30 shadow-xl shadow-primary/5 scale-105 z-10" : "border-gray-100"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", plan.color)}>
                <plan.icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">{plan.desc}</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary">{plan.price}</span>
                  <span className="text-sm text-text-secondary">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <div className="text-sm font-bold text-primary mt-2 uppercase tracking-tighter">{plan.credits}</div>
              </div>

              <button 
                onClick={() => plan.name === 'Basic' ? handleUpgrade(plan.name) : payWithPaystack(plan)}
                className={cn(
                  "w-full py-4 rounded-full font-bold text-sm transition-all mb-8",
                  plan.popular ? "bg-primary text-white hover:shadow-lg hover:shadow-primary/30" : "bg-gray-50 text-text-primary hover:bg-gray-100"
                )}
              >
                {currentTier === plan.name ? 'Current Plan' : (plan.name === 'Basic' ? 'Get Started' : 'Buy Now')}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-text-secondary leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-32 overflow-x-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary">Feature Comparison</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-6 px-4 text-sm font-bold text-text-secondary uppercase">Features</th>
                <th className="py-6 px-4 text-sm font-bold text-text-primary uppercase text-center">Basic</th>
                <th className="py-6 px-4 text-sm font-bold text-primary uppercase text-center">Premium</th>
                <th className="py-6 px-4 text-sm font-bold text-text-primary uppercase text-center">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Risk Architect", basic: true, premium: true, pro: true },
                { name: "Daily Signals", basic: "3/day", premium: "Unlimited", pro: "Unlimited" },
                { name: "Volatility Heatmap", basic: false, premium: true, pro: true },
                { name: "Edge Scanner", basic: false, premium: false, pro: true },
                { name: "Custom Webhooks", basic: false, premium: false, pro: true },
                { name: "Zero Latency Feed", basic: false, premium: true, pro: true }
              ].map((row) => (
                <tr key={row.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2 group cursor-help">
                      <span className="text-sm font-medium text-text-primary">{row.name}</span>
                      <HelpCircle className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center">
                    {typeof row.basic === 'boolean' ? (row.basic ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-200">—</span>) : <span className="text-sm text-text-secondary">{row.basic}</span>}
                  </td>
                  <td className="py-5 px-4 text-center">
                    {typeof row.premium === 'boolean' ? (row.premium ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-200">—</span>) : <span className="text-sm text-text-secondary">{row.premium}</span>}
                  </td>
                  <td className="py-5 px-4 text-center">
                    {typeof row.pro === 'boolean' ? (row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-200">—</span>) : <span className="text-sm text-text-secondary">{row.pro}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default PricingPage;
