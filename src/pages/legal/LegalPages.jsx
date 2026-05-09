import React from 'react';
import { Shield, Lock, FileText, Scale, AlertTriangle, Cookie } from 'lucide-react';
import Footer from '../../components/Footer';

const LegalLayout = ({ title, icon: Icon, children }) => (
  <div className="min-h-screen bg-white">
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary mt-1 uppercase text-xs font-bold tracking-widest">Effective Date: May 9, 2026</p>
        </div>
      </div>
      <div className="prose prose-slate max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary">
        {children}
      </div>
    </div>
    <Footer />
  </div>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" icon={Shield}>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
      <p className="mb-4 text-sm leading-relaxed">At FXUTILITY, we prioritize the protection of your digital footprint. We collect personal data that you voluntarily provide to us when you register on the Platform, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.</p>
      <ul className="list-disc pl-6 space-y-3 text-sm">
        <li><strong>Personal Information:</strong> Names, email addresses, usernames, and encrypted passwords.</li>
        <li><strong>Financial Information:</strong> Payment processing is handled by third-party providers (Stripe/PayPal). We do not store your full credit card details on our servers.</li>
        <li><strong>Log Data & Usage Information:</strong> IP addresses, browser type, device information, and timestamps of your tool usage for security, credit validation, and service optimization.</li>
      </ul>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">2. Third-Party Advertising & Cookies</h2>
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-6">
        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Google AdSense Disclosure</p>
        <p className="text-sm leading-relaxed text-text-secondary">
          We use third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4 text-xs text-text-secondary">
          <li>Google, as a third-party vendor, uses cookies to serve ads on your site.</li>
          <li>Google's use of the DART cookie enables it to serve ads to your users based on their visit to your sites and other sites on the Internet.</li>
          <li>Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.</li>
        </ul>
      </div>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">3. Data Retention and Deletion</h2>
      <p className="text-sm leading-relaxed">We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy. You have the right to request the deletion of your account and associated data at any time through our Support portal. We comply with GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act) standards for all users globally.</p>
    </section>

    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">4. International Data Transfers</h2>
      <p className="text-sm leading-relaxed">Our servers are located in the United States. If you are accessing our Services from outside the United States, please be aware that your information may be transferred to, stored, and processed by us in our facilities and by those third parties with whom we may share your personal information.</p>
    </section>
  </LegalLayout>
);

export const TermsOfService = () => (
  <LegalLayout title="Terms of Service" icon={Scale}>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">1. Agreement to Terms</h2>
      <p className="text-sm leading-relaxed">These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and FXUTILITY ELITE ("Company", "we", "us", or "our"), concerning your access to and use of the FXUTILITY platform and any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).</p>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">2. Intellectual Property Rights</h2>
      <p className="text-sm leading-relaxed">Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, and graphics (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">3. Prohibited Activities</h2>
      <p className="text-sm leading-relaxed mb-4">You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. Prohibited activity includes:</p>
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Systematically retrieving data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission.</li>
        <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
        <li>Circumvent, disable, or otherwise interfere with security-related features of the Site, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Site.</li>
      </ul>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">4. Credit and Subscription Policy</h2>
      <p className="text-sm leading-relaxed">Credits are a virtual utility used to access specific institutional tools. Credits have no real-world monetary value and cannot be exchanged for cash, refunded, or transferred between accounts. Subscription renewals occur automatically unless cancelled 24 hours before the billing cycle ends.</p>
    </section>
  </LegalLayout>
);

export const RiskDisclosure = () => (
  <LegalLayout title="Risk Disclosure" icon={AlertTriangle}>
    <div className="bg-red-50 border border-red-100 p-8 rounded-3xl mb-10">
      <h2 className="text-red-800 mt-0 text-xl font-black uppercase tracking-tighter">Institutional High-Risk Warning</h2>
      <p className="text-red-700 font-medium mb-0 leading-relaxed text-sm">
        Trading foreign exchange on margin carries a high level of risk, and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange you should carefully consider your investment objectives, level of experience, and risk appetite. <strong>THE POSSIBILITY EXISTS THAT YOU COULD SUSTAIN A LOSS OF SOME OR ALL OF YOUR INITIAL INVESTMENT AND THEREFORE YOU SHOULD NOT INVEST MONEY THAT YOU CANNOT AFFORD TO LOSE.</strong>
      </p>
    </div>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">1. No Professional Advice</h2>
      <p className="text-sm leading-relaxed">All information, tools, and algorithms provided by FXUTILITY are for educational and information purposes only. No content on the platform should be construed as investment, legal, or tax advice. You should consult with a licensed financial professional before making any investment decisions.</p>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">2. Model-Based Analysis Disclaimer</h2>
      <p className="text-sm leading-relaxed">The "Risk Architect", "Prop Firm Guard", and "AI Signals" are mathematical models based on historical data. Historical performance is not a guarantee of future results. All calculations should be manually verified before execution. We do not guarantee the accuracy or timeliness of any data provided via API or third-party liquidity providers.</p>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">3. Technology Failure</h2>
      <p className="text-sm leading-relaxed">FXUTILITY is not responsible for any losses caused by technology failures, including but not limited to, internet connectivity issues, server downtime, API failures, or broker-side execution errors.</p>
    </section>
  </LegalLayout>
);

export const CookiePolicy = () => (
  <LegalLayout title="Cookie Policy" icon={Cookie}>
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">1. Use of Cookies</h2>
      <p className="text-sm leading-relaxed">We use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in this Cookie Policy.</p>
    </section>
    
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">2. Types of Cookies We Use</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="font-bold text-text-primary mb-2 text-sm">Essential Cookies</h3>
          <p className="text-xs text-text-secondary leading-relaxed">These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas and credit balance management.</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="font-bold text-text-primary mb-2 text-sm">Targeting & Advertising Cookies</h3>
          <p className="text-xs text-text-secondary leading-relaxed">These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.</p>
        </div>
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">3. Managing Your Preferences</h2>
      <p className="text-sm leading-relaxed">You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>
    </section>
  </LegalLayout>
);
