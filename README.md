# FXUTILITY

**Institutional-grade trading tools for the modern retail trader.**

FXUTILITY is a freemium SaaS platform that gives retail forex traders access to the same risk management precision used by professional prop firm desks. Calculate lot sizes, pip values, margin requirements, and more — directly in your browser.

---

## ✨ Features

| Tool | Tier | Access |
|------|------|---------|
| Lot Size Calculator | Basic | Free |
| Pip Value Intelligence | Basic | Free |
| Margin Requirement | Basic | Free |
| Profit/Loss Architect | Basic | Free |
| Session Overlap Clock | Basic | Free |
| Prop Firm Guard | Premium | Paid |
| AI Signal Engine | Premium | Paid |
| Edge Scanner Pro | Pro | Paid |

Basic tools are completely free. Paid tiers unlock advanced features and analytics:

| Plan | Features |
|------|----------|
| Basic | Core calculators (free) |
| Premium | Advanced tools + analytics |
| Pro | Professional-grade features |

---

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS 3
- **Auth + DB**: Supabase
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema applied

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/fxutility.git
cd fxutility

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Fill in your Supabase credentials (see below)
# Then start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file at the project root with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_PAYSTACK_PUBLIC_KEY=pk_test_or_live_key
```

Supabase values are found in your Supabase project under **Settings → API**. The Paystack public key is found in your Paystack dashboard under **Settings -> API Keys & Webhooks**.

---

## 🗄 Database Setup

Run `supabase_production_schema.sql` in the Supabase Dashboard SQL Editor to create:
- `profiles` — user accounts with tier and subscription info
- `subscriptions` — subscription management
- `trading_logs` — user trading records
- `referrals` — affiliate system

### Granting Admin Access

To grant admin access to your own account, run this **privately** in the Supabase SQL Editor (never commit admin emails to the repo):

```sql
UPDATE public.profiles
SET tier = 'Pro'
WHERE id = '<your-user-uuid>';
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── tools/          # Individual tool calculators
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── UserContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── Dashboard.jsx
│   ├── PricingPage.jsx
│   └── AuthPage.jsx
└── lib/
    └── utils.js
```

---

## 🔐 Security Notes

- Admin privileges are managed exclusively via the Supabase Dashboard — no emails or special logic in client code
- Row Level Security (RLS) is enabled on all tables

---

## 📄 License

MIT — built by [Isaac Ogunwale](https://github.com/zikcolle)
