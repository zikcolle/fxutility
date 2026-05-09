import React from 'react';
import { Shield, Zap, BarChart3, ArrowRight, CheckCircle2, Bot, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import Footer from '../components/Footer';

const LandingPage = () => {
  const tools = [
    { name: "Risk Architect", desc: "Institutional grade lot sizing and risk parameters.", icon: Shield, color: "bg-accent-blue" },
    { name: "AI Signal Feed", desc: "Neural network driven setup detection.", icon: Bot, color: "bg-accent-lavender" },
    { name: "Volatility Pulse", desc: "Real-time institutional liquidity heatmap.", icon: Zap, color: "bg-accent-mint" },
    { name: "Edge Finder", desc: "Currency correlation and divergence scanner.", icon: BarChart3, color: "bg-accent-blue" }
  ];

  return (
    <>
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-lavender/40 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/50 text-primary font-bold text-xs uppercase tracking-widest mb-8"
          >
            <Zap className="w-4 h-4" /> Next-Gen Intelligence Suite
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-text-primary tracking-tight mb-8 leading-[1.1]"
          >
            Trade with <span className="text-primary">Institutional</span> <br /> AI Precision.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12"
          >
            FXUTILITY bridges the gap between retail traders and institutional-grade precision. Access the same intelligence tools used by professional prop firm desks — right in your browser.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="btn-primary w-full sm:w-auto px-10 py-4 flex items-center justify-center gap-2">
              Start Free — 50 Credits Included <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="btn-secondary w-full sm:w-auto px-10 py-4">
              View Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Tools Grid (Bento Style) */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Industrial Grade Infrastructure</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Calculations accurate down to the fractional pip, synchronized with real-time exchange rates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, idx) => (
              <motion.div 
                key={tool.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bento-card group cursor-pointer"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform", tool.color)}>
                  <tool.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{tool.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{tool.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-text-primary mb-8 leading-tight">Master the Market in <br /> 3 Professional Steps</h2>
              <div className="space-y-8">
                {[
                  { title: "Analyze Setup", desc: "Use our AI-powered correlation tools to find market divergence." },
                  { title: "Define Risk", desc: "Calculate your exact lot size using our prop-firm compliant risk architect." },
                  { title: "Execute Precision", desc: "Monitor institutional liquidity pulsars for the optimal entry window." }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-text-primary mb-1">{step.title}</h4>
                      <p className="text-text-secondary leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
               <div className="relative rounded-bento overflow-hidden shadow-2xl border border-gray-100 h-[500px] w-full bg-white flex flex-col group">
                  {/* Mock UI Toolbar */}
                  <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-6 justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">FXUTILITY TOOLS LAB V1.2</div>
                    <div className="w-12" />
                  </div>
                  
                  {/* Mock UI Content */}
                  <div className="flex-1 p-8 bg-white flex flex-col items-center justify-center text-center">
                    <TrendingUp className="w-20 h-20 text-primary/20 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-text-primary mb-2">Institutional Grade Analysis</h3>
                    <p className="text-sm text-text-secondary max-w-xs mx-auto">
                      Access premium risk architecture and AI signals directly in your browser window.
                    </p>
                  </div>

                  {/* Decorative Chart UI */}
                  <div className="absolute bottom-8 left-8 right-8 h-32 bg-accent-blue/20 rounded-xl border border-primary/5 p-4 flex items-end gap-2">
                    {[40, 70, 45, 90, 65, 80, 50, 95, 30, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-12 md:p-20 shadow-xl border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">Our Institutional Vision</h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                FXUTILITY was born out of a simple realization: retail traders deserve the same precision architecture used by major financial institutions. We've stripped away the complexity to bring you the core utilities needed to manage risk like a professional.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div>
                  <h4 className="text-2xl font-bold text-primary mb-1">99.9%</h4>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Uptime Accuracy</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-primary mb-1">15ms</h4>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Data Latency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-6">Connect with the Lab</h2>
          <p className="text-text-secondary mb-12">Have questions about our AI models or institutional data feeds? Our engineers are here to help.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 text-left group hover:border-primary/20 transition-colors">
              <h4 className="font-bold text-text-primary mb-2">Technical Support</h4>
              <p className="text-sm text-text-secondary mb-4">Immediate assistance with platform access.</p>
              <a href="mailto:support@fxutility.elite" className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Email Support <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 text-left group hover:border-primary/20 transition-colors">
              <h4 className="font-bold text-text-primary mb-2">Enterprise Inquiries</h4>
              <p className="text-sm text-text-secondary mb-4">Custom liquidity and API solutions.</p>
              <a href="mailto:labs@fxutility.elite" className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Contact Labs <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default LandingPage;
