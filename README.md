# Bazaar Marketplace 🛒

A complete, production-ready modern peer-to-peer classifieds and e-commerce marketplace built from scratch with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth & Storage)**.

Designed for direct buyer-to-seller interactions with 1-tap phone calling (`tel:+91XXXXXXXXXX`), multi-image uploads, location & price filtering, seller dashboards, wishlist favorites, and safe trading safeguards.

---

## ✨ Features

- **🔐 Supabase Authentication**: User sign up, login, session refresh with cookies, password recovery, profile editing, and role-based permissions (User / Admin).
- **📸 Multi-Image Uploads**: Upload up to 8 photos per item with drag-and-drop, image preview cards, reordering, primary cover photo selection, and direct upload to Supabase Storage.
- **📞 1-Tap "Call Seller" Dialer**: Prominent call button with nicely formatted phone number (`+91 98201 23456`) and safety checklist modal before triggering device dialer (`tel:`).
- **🔍 Advanced Search & Filtering**: Real-time search across titles, descriptions, categories, condition (Brand New to Fair), price ranges, and locations with multiple sorting options.
- **🏷️ Category Directories**: 12 curated marketplace categories (Phones, Gaming, Bikes, Computers, Vehicles, Furniture, Electronics, etc.) with dedicated dynamic pages.
- **📊 Seller Dashboard (`/dashboard`)**: Track live ad view metrics, active vs. sold tabs, toggle "Mark as Sold", edit ads, and delete items with safety confirmation modals.
- **🛡️ Row Level Security (RLS) & Anti-Tampering**: Robust PostgreSQL RLS policies ensuring sellers can **ONLY** edit or delete their own listings.
- **🚨 Trust & Safety System**: Safety reminder banners on every listing and an interactive **Report Listing** modal with an Admin moderation dashboard (`/admin`).
- **❤️ Favorites & Wishlist (`/favorites`)**: Optimistic save-to-favorites heart toggles across all product cards and detail pages.
- **🚀 SEO & Performance Optimized**: Dynamic OpenGraph tags, JSON-LD metadata, `sitemap.xml`, and `robots.txt`.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15/16 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL 15+)
- **File Storage**: Supabase Storage (`listing-images` bucket)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ / v22+
- **npm** or **pnpm** / **yarn**
- Free [Supabase](https://supabase.com) account

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/<your-username>/bazaar-marketplace.git
cd bazaar-marketplace
npm install
```

### 3. Configure Supabase

1. Go to [database.new](https://database.new) and create a new project.
2. In the Supabase Dashboard, navigate to the **SQL Editor** tab.
3. Open `supabase/migrations/001_initial_schema.sql` from this repository and run the entire SQL script. This sets up:
   - `profiles` table with auto-creation trigger on user signup
   - `listings` table with full-text search indexes
   - `listing_images` table
   - `favorites` table
   - `reports` table
   - Comprehensive Row Level Security (RLS) policies
   - Storage bucket `listing-images` with public read access
4. (Optional) Run `supabase/seed.sql` to populate sample high-quality listings.

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your project credentials from your Supabase Dashboard (**Project Settings** → **API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note**: If you run without Supabase credentials, Bazaar automatically falls back to an interactive client-side preview mode with preloaded seed listings and mock auth so you can evaluate the UI and workflows immediately.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Database Schema & Security Architecture

### Tables
| Table | Description | RLS Policy |
| :--- | :--- | :--- |
| `profiles` | User profiles with name, phone, avatar, location, role | Public read, owner update |
| `listings` | Classified items for sale with title, price, category, condition, phone | Public read for active, owner/admin full write |
| `listing_images` | High-res item photos with sort order and primary flag | Public read, listing owner insert/delete |
| `favorites` | User saved wishlist items | Private to each authenticated user |
| `reports` | Community fraud flags and inappropriate item reports | Authenticated insert, Admin read/moderate |

### Storage Bucket
- **Bucket**: `listing-images` (Public read enabled)
- **Policies**: Authenticated users can upload to `listings/<userId>/...` and delete their own uploads.

---

## 🚢 Deploying to Vercel

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete modern marketplace website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/bazaar-marketplace.git
   git push -u origin main
   ```
2. Open [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anon key
   - `NEXT_PUBLIC_SITE_URL`: Your Vercel production URL (e.g. `https://bazaar-marketplace.vercel.app`)
5. Click **Deploy**. Vercel will build and publish your marketplace in under a minute!

---

## 🔒 Security Best Practices Implemented

- **No Service Role Keys in Frontend**: Only public anon keys are exposed via `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Database-Level Authorization**: Server-side Row Level Security (RLS) guarantees a user cannot modify or delete other sellers' listings even if they manipulate API calls.
- **Client-Side Sanitization**: Image uploads enforce size restrictions (<5MB) and mime-type whitelisting (`image/jpeg`, `image/png`, `image/webp`).
- **Fraud Prevention**: Explicit confirmation modals with safety tips warn buyers never to send OTPs or money in advance before calling sellers.

---

## 📄 License
MIT License. Built with passion for local communities.
