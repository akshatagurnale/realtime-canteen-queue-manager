# 🔄 Realtime Canteen Queue Manager

A full-stack, real-time institutional canteen automation platform designed to seamlessly bridge the gap between student queues and kitchen token management. This system replaces manual paper-coupon mess workflows with an interactive digital kiosk terminal and automated live token updates.

## 🚀 Core Features

- **Digital Ordering Kiosk:** Clean, responsive UI for students to browse the mess menu, manage a persistent tray/cart, and process checkout selections.
- **Hybrid Payment Processing Engine:** Supports simulated real-time mock UPI/Online transactions with artificial network latency handling alongside a physical cash-at-reception fallback ledger.
- **Automated Token Generation:** Employs atomic server-side sequencing to generate distinct numeric order reference tokens upon checkout confirmation.
- **Real-Time State Synchronization:** Instantly dispatches order status changes and real-time live kitchen queue pipeline events.
- **Printable Thermal Receipts:** Generates dynamic plain-text printable order receipts directly on screen for transactional records.


## 🛠️ Technical Architecture & Stack

- **Frontend & Routing:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Icons & Styling:** Lucide React, Tailwind Component Architecture
- **Backend Infrastructure:** Next.js Serverless Route Handlers
- **Database & Live Pipeline Layers:** Supabase (PostgreSQL) relational database with Realtime client subscriptions for instant sync.


📂 Key Architecture Breakdown

├── app/
│   ├── api/
│   │   ├── orders/           # DB Order registration endpoints
│   │   └── payment/          # Mock payment processing gateway handler
│   └── page.tsx              # Main kiosk screen
├── components/
│   └── PaymentModal.tsx      # Payment strategy router component
├── public/                   # Static application assets
└── README.md                 # Project system documentation
