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

> **Note**: When running with Supabase configured in `.env.local`, Bazaar automatically connects to your live Supabase authentication, database, and storage. If run before credentials are provided, visitors start in a clean logged-out state.

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
| `profiles` | User profiles with name, phone, avatar, location, role, suspension status | Public read, owner update |
| `listings` | Classified items for sale with title, price, category, condition, phone, status (`approved`, `pending`, `rejected`, `sold`, `removed`) | Public read for `approved`/`active`, owner/admin write, anti-tamper triggers |
| `listing_images` | High-res item photos with sort order and primary flag | Public read, listing owner insert/delete |
| `favorites` | User saved wishlist items | Private to each authenticated user |
| `reports` | Community fraud flags and inappropriate item reports | Authenticated insert, Admin read/moderate |

### Database Migrations
1. `supabase/migrations/001_initial_schema.sql`: Core schema, foreign keys, full-text indexes, profiles trigger, and baseline RLS policies.
2. `supabase/migrations/002_content_safety.sql`: Extends listing status lifecycle (`pending`, `approved`, `rejected`, `sold`, `removed`), introduces user account suspension flags, builds automated moderation audit logs, and adds anti-tamper RLS triggers so regular sellers cannot arbitrarily elevate `pending` or `rejected` listings to `approved`.

### Storage Bucket
- **Bucket**: `listing-images` (Public read enabled)
- **Policies**: Authenticated users can upload to `listings/<userId>/...` and delete their own uploads.

---

## 🛡️ Content Safety & Marketplace Moderation System

Bazaar incorporates a robust, multi-layered moderation pipeline designed to prevent illegal, dangerous, or fraudulent listings before they are made public:

### 1. Multi-Layer Automated Text Screening
- **Prohibited Catalog**: Blocks narcotics/drugs, firearms/weapons, explosives, adult/sexually explicit items, prostitution/solicitation, counterfeit goods, fraudulent IDs, malware/hacking tools, hazardous chemicals, and wire fraud schemes.
- **Obfuscation & Leetspeak Resistance**: Automatically normalizes letter substitutions (e.g., `p0rn`, `k0ke`, `w33d`, `wh0re`, `f4ke`) before scanning.
- **Category Mismatch & Anomaly Detection**: Flags high-risk keywords submitted under deceptive or unrelated categories (e.g., a weapon listed under "Vehicles" or narcotics listed under "Electronics").

### 2. Client-Side & In-Flight Image Scanner
- **Magic Bytes Validation**: Verifies genuine file signatures (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `52 49 46 46`) to prevent spoofed file extensions.
- **Computer Vision Canvas Analysis**: Client-side canvas heuristics examine color distribution, saturation, and skin tone ratios to detect explicit or violent imagery before network transmission.

### 3. Seller Agreement & Pending Review Pipeline
- Sellers are required to review and accept the marketplace safety terms linking to the comprehensive [`/rules`](/rules) policy page prior to publishing.
- Listings with borderline risk scores ($35 \le \text{Risk} < 75$) or category discrepancies are placed into a **Pending Review** status, preventing them from appearing in public search until manually approved by an administrator.
- Blatant violations ($\text{Risk} \ge 75$) are immediately rejected with actionable, non-revealing feedback for the seller.

### 4. Community Reporting & Rate Limiting
- **8 Standardized Report Categories**: Prohibited item, Illegal item, Inappropriate content, Scam or fraud, Counterfeit item, Misleading information, Dangerous item, and Other.
- **Anti-Spam Throttling**: Limits listing submissions, duplicate ad creation within 5-minute windows, and rapid-fire report submission.

### 5. Admin Moderation Console (`/admin`)
- Accessible only to authorized administrators via server-side session and database RLS checks.
- Three dedicated queues:
  - **Pending Approvals Queue**: Live review of auto-flagged ads with 1-click Approve or Reject.
  - **Community Reports Queue**: Prioritized view of buyer-reported listings with reported reason, detail, and Resolve actions.
  - **User Suspension System**: Admin ability to suspend bad actors, instantly revoking their active listings and banning future uploads.

---

## 👨‍💻 About the Founder

Bazaar was created and developed by **Harsh Sisodia**, a 15-year-old developer and entrepreneur who enjoys building modern websites and turning ideas into useful tools for everyone.

- **Founder**: Harsh Sisodia
- **Gaming Platform**: [GameRank (gamerank-one.vercel.app)](https://gamerank-one.vercel.app)
- **Instagram**: [@hxrsh_s2k14](https://instagram.com/hxrsh_s2k14)
- **About Page**: Explore our story at [`/about`](/about)

---

## 🚢 Deploying to Vercel

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete modern marketplace with content safety"
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

## 📄 License
MIT License. Built with passion for local communities.
