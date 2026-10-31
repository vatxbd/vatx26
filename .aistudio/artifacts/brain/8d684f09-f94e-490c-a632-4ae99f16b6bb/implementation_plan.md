# Bangladesh Multi-Channel Payment Gateway Architecture & Implementation Plan

## 1. Executive Summary & Recommended Gateway Solution
Based on your requirements for **Platform Subscriptions & Premium Tool Licensing** with **Bangladesh multi-channel aggregator support** and an **interactive sandbox simulator**, the recommended standard in Bangladesh is a dual-mode **SSLCOMMERZ / AamarPay Aggregator Integration Engine**.

### Why an Aggregator is the Optimal Choice:
1. **100% Domestic Coverage in One Integration:**
   - **MFS Wallets:** bKash, Nagad, Rocket, Upay, Cellfin, SureCash.
   - **Bank Cards:** Visa, Mastercard, UnionPay, American Express, DBBL Nexus / NexusPay.
   - **Internet Banking:** City Touch, AB Bank, Islami Bank, EBL Skybanking, MTB Internet Banking.
2. **Regulatory & Compliance Assurance:**
   - Licensed as a Payment Systems Operator (PSO) by Bangladesh Bank.
   - PCI-DSS Level 1 certified security.
3. **Dual-Environment Architecture (Sandbox Simulator & Live Merchant):**
   - **Interactive Sandbox Simulator:** Enables instant, zero-credential end-to-end testing of subscription upgrades, automatic invoice generation, and tier unlocking without waiting for bank merchant approval.
   - **Production Merchant Ready:** Easily switches to live mode simply by adding `STORE_ID` and `STORE_PASSWD` in settings or environment variables.

---

## 2. Gateway Comparison & Architecture Matrix

| Feature / Criteria | SSLCOMMERZ (Aggregator) | AamarPay (Aggregator) | Direct bKash / Nagad API |
| :--- | :--- | :--- | :--- |
| **Supported Methods** | All MFS + All Cards + All Net Banking | All MFS + Cards + Net Banking | Only bKash or Nagad |
| **Merchant Onboarding** | Corporate Trade License, BIN, TIN | Trade License, BIN, TIN, Bank Acct | Separate agreement with each MFS |
| **Recurring Billing** | Supported via Tokenization / Pre-auth | Direct Debit Agreement required | Supported via bKash Agreement API |
| **Integration Complexity** | Standard REST API + IPN Webhook | Standard REST API + Webhook | 2 Separate API specifications |
| **Best Suited For** | **Fintech SaaS, EdTech, Platform Subs** | Small e-Commerce & Digital goods | High-volume single-channel apps |

---

## 3. Detailed Implementation Roadmap

### Phase 1: Server-Side Payment Aggregator Engine (`server.ts`)
1. **Aggregator Session Initiation Endpoint (`POST /api/payments/checkout/initiate`):**
   - Generates unique transaction reference (`TRX_VATX_...`).
   - Computes order total, currency (`BDT`), customer metadata (name, email, phone, plan ID).
   - In **Sandbox Mode**: returns a hosted simulator URL / modal payload.
   - In **Live Mode**: communicates with SSLCOMMERZ `gwprocess/v4/api.php` or AamarPay `request.json` to obtain `GatewayPageURL`.
2. **Instant Payment Notification (IPN) & Webhook Handler (`POST /api/payments/ipn` & `/api/payments/success`):**
   - Validates checksum/hash (`val_id`, `verify_sign`).
   - Records transaction in `payment_transactions` database table.
   - Automatically activates user subscription tier (Basic, Pro, or Enterprise) and computes renewal expiration.
3. **Transaction Status & Verification (`GET /api/payments/status/:tran_id`):**
   - Real-time polling and instant callback verification for client checkout modals.

### Phase 2: Interactive Sandbox Simulator Modal (`src/components/PaymentGatewayModal.tsx`)
1. **Visual Bangladesh Gateway Drawer / Modal:**
   - Clean, branded fintech UI with tabs for:
     - **Mobile Banking:** bKash (Pink), Nagad (Orange), Rocket (Purple), Upay (Blue).
     - **Cards & Net Banking:** Visa, Mastercard, DBBL Nexus, CityTouch, Islami Bank.
2. **Interactive Simulator Controls (Test Scenarios):**
   - **Simulate Success (Approved):** Generates valid dummy Bank TrxID, triggers IPN validation, unlocks Pro tier immediately.
   - **Simulate Insufficient Balance / User Failure:** Emulates typical payment decline with actionable user feedback.
   - **Simulate Timeout / Session Expiry:** Tests graceful rollback and retry mechanism.
3. **Production Mode Toggle:**
   - Seamlessly switches from Simulator to real hosted redirect when production credentials are configured.

### Phase 3: Seamless Integration with Subscription View (`src/App.tsx`)
1. **Upgrade Flow in `SubscriptionView`:**
   - Replace manual TrxID text entry with a modern "Pay with SSLCOMMERZ / MFS" button on Basic (৳999), Pro (৳2,499), and Enterprise (৳9,999) plan cards.
   - Shows total in BDT with VAT breakdown (Mushak 6.3 compliant receipt).
2. **Instant Subscription Tier Activation & Pro Badge:**
   - On payment completion, updates user profile state immediately.
   - Generates a downloadable Mushak-compliant digital invoice/receipt with QR code and transaction hash.

### Phase 4: Admin Payment Settings & Transaction Ledger (`SettingsView` & `MFSPayment.tsx`)
1. **Payment Gateway Settings Panel:**
   - Gateway Provider Selection: `SSLCOMMERZ (Multi-Channel Aggregator)` vs `AamarPay` vs `Sandbox Simulator`.
   - Configuration fields: Store ID, Store Password, Live/Sandbox toggle, Webhook URL helper.
2. **Live Transaction Audit Log:**
   - Table of all payment transactions: Date, Transaction ID, Customer, Plan, Method (bKash/Nagad/Visa), Amount, Status (`Completed`, `Pending`, `Refunded`).
   - One-click receipt re-generation and status audit.

---

## 4. Verification & Testing Plan

1. **Sandbox Multi-Channel Simulation:**
   - Test checkout of Pro Plan (৳2,499) with simulated bKash.
   - Verify that transaction ID is recorded and user tier switches from Free to Pro immediately.
   - Test card checkout (Visa/Mastercard) with failure simulation to ensure robust error handling.
2. **API & Server Validation:**
   - Run automated verification on `/api/payments/checkout/initiate` and `/api/payments/ipn`.
   - Verify database integrity in SQLite database (`payment_transactions` and `subscriptions`).
3. **UI/UX & Codebase Integrity:**
   - Run TypeScript type checks (`tsc --noEmit`) and Vite compilation (`compile_applet`).
   - Verify responsive display on mobile and desktop viewports.
