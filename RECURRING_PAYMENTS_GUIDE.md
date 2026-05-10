# Recurring Auto-Debit Implementation Guide

## Overview
This guide explains how to set up recurring subscriptions with Paystack for auto-debit functionality.

## What's Been Implemented

### 1. Frontend Updates (PricingPage.jsx)
- Added `paystackPlanIdMonthly` and `paystackPlanIdYearly` to each plan
- Updated `payWithPaystack()` function to:
  - Use Paystack's `plan` parameter for recurring charges
  - Capture authorization code for future recurring debits
  - Record authorization and customer codes for backend processing
  - Display appropriate messaging about auto-billing

### 2. Database Schema (supabase_subscription_migration.sql)
Created three new tables:
- **subscriptions**: Stores active subscriptions with plan details, next billing dates, and Paystack references
- **subscription_payments**: Tracks individual payment attempts for audit trail
- **RPC Functions**:
  - `record_paystack_subscription()`: Records new subscription and first payment
  - `process_recurring_subscriptions()`: Processes recurring charges (runs via cron)
  - `cancel_subscription()`: Allows users to cancel subscriptions

## Next Steps

### 1. Create Paystack Subscription Plans
In your Paystack dashboard, create the following plans:
```
Monthly Plans:
- PLN_premium_monthly: ₦10,000/month
- PLN_pro_monthly: ₦25,000/month

Yearly Plans:
- PLN_premium_yearly: ₦100,000/year
- PLN_pro_yearly: ₦250,000/year
```

### 2. Update Environment Variables
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx (your public key)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx (for backend)
```

### 3. Execute SQL Migration
Run the migration SQL file in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `supabase_subscription_migration.sql`
3. Execute the script

### 4. Set Up Paystack Webhooks
Configure webhooks in Paystack dashboard to handle:
- `charge.success`: Update subscription payment status
- `charge.failure`: Mark payment as failed, retry logic
- `subscription.create`: Log subscription creation
- `subscription.disable`: Handle subscription cancellations

Webhook endpoint example:
```
POST /api/webhooks/paystack
```

### 5. Create Backend Webhook Handler
Add endpoint to handle Paystack events:
```javascript
// Example: Express.js
app.post('/api/webhooks/paystack', async (req, res) => {
  const event = req.body;
  
  switch(event.event) {
    case 'charge.success':
      // Update subscription_payments table
      // Calculate next billing date
      break;
    case 'charge.failure':
      // Mark payment as failed
      // Implement retry logic
      break;
  }
});
```

### 6. Set Up Cron Job for Recurring Charges
Schedule a cron job to call `process_recurring_subscriptions()`:
```bash
# Run every day at 2 AM UTC
0 2 * * * curl -X POST https://your-api.com/api/cron/process-subscriptions
```

## How It Works

### Initial Subscription Flow
1. User selects a plan and clicks "Subscribe"
2. Paystack overlay opens with authorization request
3. User enters card details
4. Paystack processes first charge
5. Authorization code is returned
6. Frontend calls `record_paystack_subscription()`
7. Subscription is created with next_billing_date set

### Recurring Charge Flow
1. Cron job triggers `process_recurring_subscriptions()`
2. For each subscription with `next_billing_date <= NOW()`:
   - Paystack API is called with stored authorization code
   - Recurring charge is initiated
   - Webhook confirms success/failure
   - `subscription_payments` record is created
   - `next_billing_date` is updated

### Cancellation Flow
1. User requests cancellation in dashboard
2. `cancel_subscription()` is called
3. Subscription status is set to 'cancelled'
4. No further charges will occur
5. User retains access until current billing period ends (implement grace period logic)

## Testing

### Test Mode
1. Use Paystack test keys
2. Use test card: 4111 1111 1111 1111
3. Any expiry date in future, any CVC
4. Webhook signatures can be verified using webhook secret

### Test Scenarios
- [ ] Initial subscription succeeds
- [ ] Recurring charge succeeds
- [ ] Recurring charge fails with retry
- [ ] Subscription cancellation
- [ ] Plan upgrade/downgrade
- [ ] Authorization code refresh if needed

## Security Considerations
1. Never expose Paystack secret key in frontend
2. Verify webhook signatures from Paystack
3. Use HTTPS for all API endpoints
4. Store authorization codes securely (already encrypted in Supabase)
5. Implement rate limiting on webhook endpoints
6. Audit all subscription changes

## Troubleshooting

### Issue: Subscription not recording
- Verify Paystack plan IDs match
- Check browser console for errors
- Verify user is authenticated
- Check Supabase logs

### Issue: Recurring charges not triggering
- Verify cron job is running
- Check Paystack API logs
- Verify webhook is configured
- Check `subscriptions.next_billing_date` is in past

### Issue: Authorization code not working
- Some cards don't support recurring charges
- Verify card has sufficient balance
- Check authorization hasn't expired (usually 90 days)
- Implement token refresh logic
