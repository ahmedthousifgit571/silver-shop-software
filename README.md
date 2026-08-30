# 💎 AurumSilver ERP — Enterprise Jewelry Billing, Inventory & QR Verification Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon_DB-Serverless_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**AurumSilver ERP** is a modern, high-speed, enterprise-grade cloud POS, inventory management, and digital certification platform engineered specifically for **Silver Jewelry Retailers, Bullion Merchants, Silverware Showrooms, and Goldsmiths**.

Designed to handle real-time bullion rate volatility, multi-purity calculations (999 Fine, 925 Sterling, 800 Utensil), old metal scrap exchange deductions, instant GST (HSN 7113) compliance, and physical-to-digital QR verification tags for smartphones.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Enterprise Features](#-key-enterprise-features)
- [Public Hallmark & QR Verification System](#-public-hallmark--qr-verification-system)
- [Hardware & Peripheral Compatibility](#-hardware--peripheral-compatibility)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Configuration](#-environment-configuration)
- [Database Setup & Seeding](#-database-setup--seeding)
- [Production Deployment (Vercel)](#-production-deployment-vercel)
- [API & Route Map](#-api--route-map)
- [GST & Regulatory Compliance](#-gst--regulatory-compliance)
- [License](#-license)

---

## 🏛️ Architectural Overview

```mermaid
graph TD
    subgraph Client Layer
        A[Cashier / Store Staff POS & Inventory]
        B[Print Engine: A4/A5 PDF & 80mm Thermal]
        C[Physical Jewelry Tag: Dumbbell Barcode / QR]
        D[Customer Smartphone Camera / Google Lens]
    end

    subgraph Full-Stack Application Layer (Next.js 14 App Router)
        E[POS Billing Counter Engine]
        F[Dynamic Rate & Valuation Engine]
        G[Tag & QR Matrix Generator]
        H[Public Verification Server Component /p/:sku]
        I[RESTful API Handlers /api/*]
    end

    subgraph Data & Storage Layer
        J[(Prisma ORM Client)]
        K[(Neon Serverless PostgreSQL DB)]
        L[Cloudinary Asset Storage - High-Res Jewelry Media]
    end

    A --> E
    E --> F
    E --> B
    E --> G
    G --> C
    C -.->|Scan on Phone| D
    D -->|Instant HTTPS Route| H
    E & H & I --> J
    J <--> K
    G & H <--> L
```

---

## 🌟 Key Enterprise Features

### 1. ⚡ High-Speed POS Counter & Smart Cart
* **Instant SKU Barcode & QR Scanning**: Supports both USB hardware laser barcode guns and built-in camera scanning.
* **Customer Auto-Lookup**: Search and autofill customer profiles by 10-digit mobile number with transaction history and Khata ledger balance.
* **Old Silver Scrap Exchange Calculator**: Seamlessly enter scrap gross weight, melt purity %, and current scrap buyback rate to deduct credit directly from the final bill.
* **Flexible Payment Splits**: Record multi-mode settlements including Cash, UPI (GPay/PhonePe/Paytm), Credit/Debit Card, and Customer Advance balance.

### 2. 📈 Live Bullion Market Rate Controller
* Real-time rate management per gram for **999 Fine Silver**, **925 Sterling Silver**, **800 Utensil Silver**, **22K Gold**, and **Scrap Buyback**.
* Top-ribbon live ticker dynamically updates retail price estimations, inventory asset valuation, and day-end margins.

### 3. 🏷️ Jewelry Inventory & Printable Dumbbell Tags
* Comprehensive jewelry specifications: **Gross Weight (g)**, **Stone/Bead Weight (g)**, **Net Silver Weight (g)**, **Purity Grade**, and **Making Charges** (Flat ₹, ₹/g, or % of metal).
* Automatic generation of printable **Dumbbell / Rat-Tail Jewelry Tags** for physical ornaments (compatible with TVS, Zebra, TSC label printers).
* Low-stock warnings and live in-store stock decrement upon billing.

### 4. 🧾 GST Tax Invoicing & Instant WhatsApp Delivery
* Compliant **A4 / A5 Tax Invoices** with shop logo, GSTIN, HSN codes (7113), CGST (1.5%) + SGST (1.5%) or IGST (3.0%), and embedded per-item verification QR codes.
* Compact **80mm Thermal Receipt slip** mode for quick checkout counters.
* **1-Click WhatsApp Invoice Dispatch**: Send pre-formatted invoice summaries directly to the customer's phone.

### 5. 📊 Day-End Cashier Settlement & Analytics
* Daily Cashier Settlement Sheet: Cash-in-drawer tally, UPI totals, Card receipts, and total silver grams sold.
* Monthly turnover charts, category distribution, and **1-Click CSV Export** ready for GST GSTR-1 tax filing.

---

## 🔍 Public Hallmark & QR Verification System

Every jewelry item and bill generates a cryptographic-ready QR code. When scanned by a customer or counter staff using **any smartphone camera**:

```
https://your-domain.vercel.app/p/SLV-ANK-925-001
```

* **Zero Login Required**: Instant public mobile certificate view.
* **Live Store Verification**: Shows high-resolution jewelry photo, hallmark purity standard, net weight, and live in-store availability.
* **Counter Defect & Exchange Verification**: Staff can scan returned items to immediately verify authenticity against original store records.

---

## 🖨️ Hardware & Peripheral Compatibility

| Peripheral Type | Supported Hardware | Protocol / Method |
| :--- | :--- | :--- |
| **Barcode Scanners** | Honeywell, Zebra, TVS, Datalogic, Generic USB Laser Guns | Plug & Play (HID Keyboard Emulation) |
| **Mobile / Web Scanning** | Integrated camera scanner powered by `html5-qrcode` | WebRTC / Camera Permission |
| **Jewelry Tag Printers** | TVS LP 46 Neo, Zebra ZD220, TSC TE244, Citizen CL-S621 | 2-inch / 3-inch Jewelry Dumbbell Sticker Sheets |
| **Receipt Printers** | Epson TM-T82, TVS RP-3200, Posiflex, 80mm / 58mm Thermal Printers | ESC/POS or System Print Dialog |
| **Document Invoices** | HP, Canon, Brother, Epson Laser & Inkjet Printers | Standard A4 / A5 PDF Print Engine |

---

## 💻 Technology Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
* **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
* **Icons & UI**: [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
* **Database & ORM**: [PostgreSQL (Neon Serverless)](https://neon.tech/), [Prisma ORM 5.19](https://www.prisma.io/)
* **Media Cloud**: [Cloudinary API](https://cloudinary.com/) (Optimized high-resolution product photography)
* **Document & QR Generation**: [jsPDF](https://github.com/parallax/jsPDF), [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable), [node-qrcode](https://github.com/soldair/node-qrcode)

---

## 📁 Project Directory Structure

```text
SilverBillingSoftware/
├── app/
│   ├── api/                      # RESTful Route Handlers
│   │   ├── billing/              # Invoice creation, ledger updates, stock deduction
│   │   ├── customers/            # Customer lookup and Khata transactions
│   │   ├── products/             # Inventory CRUD and SKU lookup
│   │   ├── rates/                # Live bullion market rates
│   │   ├── reports/              # Day-end cashier & monthly sales aggregation
│   │   └── upload/               # Cloudinary secure image uploader
│   ├── customers/                # Customer CRM & Khata ledger UI
│   ├── inventory/                # Product management & stock register
│   ├── invoice/[id]/             # Digital A4/A5 & thermal invoice views
│   ├── login/                    # Staff & cashier authentication
│   ├── p/[sku]/                  # Public mobile hallmark & stock verification
│   ├── pos/                      # Fast POS scan-and-bill counter
│   ├── products/                 # Jewelry catalog with filter matrix
│   ├── reports/                  # Analytics, day-end register, and GSTR-1 exports
│   ├── settings/                 # Shop profile, GSTIN, HSN, and rate defaults
│   ├── layout.tsx                # App shell, navigation header & rate ribbon
│   └── page.tsx                  # Executive dashboard & vault valuation
├── components/                   # Modular React UI components
│   ├── BarcodeScannerModal.tsx   # Camera scanner dialog
│   ├── CustomerModal.tsx         # Customer creation & profile editor
│   ├── PDFInvoiceView.tsx        # Printable A4/A5 GST tax invoice
│   ├── ProductModal.tsx          # Inventory product creation modal
│   ├── QRTagModal.tsx            # Printable jewelry sticker tag modal
│   ├── RateUpdateModal.tsx       # Live bullion rate adjuster
│   └── ThermalReceiptView.tsx    # 80mm thermal receipt generator
├── lib/                          # Core business logic utilities
│   ├── cloudinary.ts             # Cloudinary upload client
│   ├── pdf.ts                    # jsPDF invoice rendering pipeline
│   ├── prisma.ts                 # Prisma Client singleton
│   ├── qr.ts                     # Dynamic QR generator with fallback host resolution
│   ├── storage.ts                # In-memory default fallbacks
│   └── types.ts                  # Shared TypeScript models and interfaces
├── prisma/
│   ├── schema.prisma             # PostgreSQL database schema
│   └── seed.js                   # Seed script with default products, rates & customers
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies and build scripts
└── tailwind.config.ts            # Enterprise color tokens & styling extensions
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) v18.17.0 or higher
* [npm](https://www.npmjs.com/) v9 or higher (or `pnpm` / `yarn`)
* A free [Neon PostgreSQL](https://neon.tech) database account
* A free [Cloudinary](https://cloudinary.com) account (for image uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/silver-billing-software.git
cd silver-billing-software
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
*(Fill in your PostgreSQL URL and Cloudinary credentials in `.env`)*

---

## ⚙️ Environment Configuration

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Serverless PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_APP_URL` | Base public URL for QR verification links | `http://localhost:3000` *(Local)* / `https://your-shop.vercel.app` *(Prod)* |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | `your_api_secret_hash` |

---

## 🗄️ Database Setup & Seeding

Sync your schema with your Neon PostgreSQL database and seed sample products, default silver rates, and customer profiles:

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Push schema tables to Neon PostgreSQL
npm run prisma:push

# 3. Seed initial rates, shop metadata, and jewelry catalog
node prisma/seed.js
```

To visually inspect or edit database records in a browser GUI:
```bash
npm run prisma:studio
```

---

## 🌐 Production Deployment (Vercel)

This application is 100% full-stack and designed for zero-configuration deployment on **Vercel**.

### Step 1: Push Repository to GitHub
```bash
git init
git add .
git commit -m "feat: complete enterprise silver billing software"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/silver-billing-software.git
git push -u origin main
```

### Step 2: Import Project on Vercel
1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... $\rightarrow$ Project**.
2. Select your `silver-billing-software` GitHub repository and click **Import**.

### Step 3: Set Environment Variables
Add the following keys under the **Environment Variables** panel:
* `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
* `CLOUDINARY_CLOUD_NAME`: *(Your Cloudinary Cloud Name)*
* `CLOUDINARY_API_KEY`: *(Your Cloudinary API Key)*
* `CLOUDINARY_API_SECRET`: *(Your Cloudinary API Secret)*
* `NEXT_PUBLIC_APP_URL`: `https://your-project-name.vercel.app`

### Step 4: Deploy
Click **Deploy**. Vercel will run `npm install`, execute `"postinstall": "prisma generate"`, and build the production bundle automatically.

---

## 🗺️ API & Route Map

### Application Routes
| URL Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Staff / Owner | Live Store Dashboard, Vault Valuation, Quick Navigation |
| `/pos` | Cashier | Rapid Scan POS Billing, Scrap Exchange, Multi-Payment Checkout |
| `/inventory` | Staff / Owner | Stock Register, Add Items, Print Jewelry Sticker Tags |
| `/customers` | Staff / Owner | Customer CRM, Purchase History, Khata Ledger Debits/Credits |
| `/reports` | Owner / Accountant | Cashier Day-End Settlements, Monthly Turnover, CSV GSTR-1 Export |
| `/invoice/[id]` | Public / Staff | Digital Printable GST Tax Invoice & WhatsApp Link |
| `/p/[sku]` | **Public (Mobile)** | **Authenticity Certificate, Hallmark Purity, Live Stock Verification** |
| `/settings` | Owner | Shop Name, Address, GSTIN, HSN Code, Terms Configuration |

### RESTful Backend APIs
| Endpoint | Method | Functionality |
| :--- | :--- | :--- |
| `/api/products` | `GET`, `POST`, `PUT`, `DELETE` | Inventory management & SKU query |
| `/api/billing` | `GET`, `POST` | Generate invoice, debit stock, credit ledger |
| `/api/customers` | `GET`, `POST`, `PUT` | Customer profile and Khata balance management |
| `/api/rates` | `GET`, `POST` | Update and fetch live silver/gold market rates |
| `/api/reports` | `GET` | Retrieve day-end cashier totals and sales analytics |
| `/api/upload` | `POST` | Upload product imagery to Cloudinary CDN |

---

## ⚖️ GST & Regulatory Compliance

* **HSN Classification**: Configured by default for **HSN 7113** (Articles of jewelry and parts thereof, of precious metal).
* **Tax Splits**:
  * **Intra-State**: CGST 1.5% + SGST 1.5% (Total 3.0% GST).
  * **Inter-State**: IGST 3.0%.
* **Hallmark Standards Supported**:
  * `999 Fine Silver` (99.9% Purity) — Coins, Bars, Idols.
  * `925 Sterling Silver` (92.5% Purity) — Ornaments, Payals, Rings, Chains.
  * `800 Utensil Silver` (80.0% Purity) — Traditional Silverware, Diyas, Vessels.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <b>Built for modern jewelry showrooms and goldsmiths.</b>
</p>
#   s i l v e r - s h o p - s o f t w a r e  
 