# Voxora — Global Voice. Smarter Connections.

Voxora is a React + TypeScript VoIP platform starter with a Netlify Functions backend, Supabase schema, Twilio/Telnyx connectivity checks, Paystack test-mode initialization scaffolding, and an Electron Windows desktop wrapper.

> **Important:** This is a deployable starter project, not a finished regulated payments/telephony product. The dashboard currently contains clearly labeled demo metrics. The payment webhook validates Paystack signatures but deliberately does not credit wallets. Do not accept live customer funds or initiate withdrawals until the production accounting, authorization, reconciliation and test requirements in `docs/PRODUCTION_CHECKLIST.md` are complete.

## Requirements
- Node.js 20 LTS or newer
- npm
- A Netlify account for hosted deployment
- A Supabase project
- Optional: Twilio, Telnyx and Paystack test accounts
- Windows 10/11 x64 to build and install the Windows desktop package

## Run on Windows
1. Install Node.js LTS from https://nodejs.org/ (include npm).
2. Extract `voxora-project.zip` to a folder such as `C:\Projects\voxora`.
3. Open PowerShell in that folder.
4. Run:
   ```powershell
   npm install
   Copy-Item .env.example .env
   npm run dev
   ```
5. Open the local Vite URL shown in the terminal (normally http://localhost:5173).

The dashboard runs in demo mode without Supabase. Add the frontend Supabase URL and anon key to `.env` to enable the sign-in form.

## Configure Supabase
1. Create a project at https://supabase.com/.
2. Open SQL Editor and run `supabase/migrations/001_initial_schema.sql`.
3. In Authentication settings, configure email sign-in and your allowed redirect URLs.
4. Copy the Project URL and anon key into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
5. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as Netlify Function environment variables.
6. Set `SUPABASE_SERVICE_ROLE_KEY` only in Netlify server-side environment variables. Never use it in a VITE_ variable or commit it.
7. Create the first administrator by securely updating that user's `profiles.role` to `admin` from the Supabase SQL editor. Do not expose role editing to customers.

## Configure provider credentials
Set these in Netlify Site configuration → Environment variables (and in a local Netlify Dev environment when testing):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TELNYX_API_KEY`

The `twilio-status` and `telnyx-status` functions perform server-side connection checks. Credentials must never be placed in frontend code or committed to Git.

## Paystack test setup
1. Create a Paystack account and use test keys only.
2. Set `PAYSTACK_SECRET_KEY` to the test secret key in Netlify environment variables.
3. Set `APP_BASE_URL` to your deployed site URL.
4. Configure Paystack webhook URL as `https://YOUR-SITE.netlify.app/.netlify/functions/paystack-webhook`.
5. Test initialization and signature validation with Paystack test transactions.
6. The included initialize function is a scaffold. Before production, authenticate the caller, derive email from their verified account, store pending references in the database, enforce currency/amount rules, and verify the transaction server-side before posting any ledger entries. The webhook currently acknowledges a verified event but does not credit wallets.

## Deploy to Netlify
1. Push this project to a private or public Git repository.
2. In Netlify choose Add new site → Import an existing project.
3. Select the repository. Build command: `npm run build`; publish directory: `dist`.
4. Add the required environment variables in Netlify. Deploy.
5. Add a custom domain under Domain management and configure DNS with your registrar.
6. Replace placeholder domain in `public/robots.txt` and `public/sitemap.xml`.
7. Submit the sitemap in Google Search Console. Indexing is controlled by search engines and is not guaranteed.

## Build the Windows installer (.exe)
On Windows, in PowerShell:
```powershell
npm install
npm run desktop:dist
```
The NSIS installer is generated in `release/` (for example `Voxora Setup 1.0.0.exe`). For local desktop development:
```powershell
npm run desktop:dev
```
The Windows installer must be built and tested on Windows. This source archive does not contain a prebuilt `.exe`.

## Project structure
```text
voxora/
├── electron/                 # Electron main and preload
├── netlify/functions/        # Secure serverless API endpoints
├── public/                   # SEO assets
├── src/                      # React application
├── supabase/migrations/      # PostgreSQL schema and RLS
├── docs/                     # Deployment and production guides
├── .env.example
├── netlify.toml
└── package.json
```

## Current implementation status
- Responsive Voxora dashboard UI: included; sample metrics are demo data.
- NGN/USD display selector: included.
- Supabase client and password sign-in: included; requires project configuration.
- Supabase schema and initial RLS policies: included; review and test before production.
- Twilio/Telnyx connection checks: included; requires credentials.
- Paystack initialization and webhook signature validation: starter scaffolding only.
- Live outbound/inbound calling, number purchasing, wallet ledger posting, financial reporting and withdrawals: not production implemented.
- Electron wrapper and Windows NSIS build configuration: included; build installer on Windows.

See `docs/PRODUCTION_CHECKLIST.md` before going live.
