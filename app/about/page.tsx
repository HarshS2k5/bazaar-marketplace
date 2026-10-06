import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Sparkles, 
  Code2, 
  Gamepad2, 
  ShoppingBag, 
  ExternalLink, 
  Rocket, 
  Heart, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Terminal,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'About the Founder - Harsh Sisodia | Bazaar Marketplace',
  description: 'Learn about Harsh Sisodia, the 15-year-old developer and creator behind Bazaar Marketplace and GameRank.',
  openGraph: {
    title: 'Built by a Young Creator. Made for Everyone - Harsh Sisodia',
    description: 'Learn about Harsh Sisodia, the 15-year-old developer and entrepreneur behind Bazaar Marketplace.',
  },
};

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-20 sm:pt-28 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Glow ambient background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg shadow-emerald-950/40 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Meet The Creator</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            Built by a Young Creator. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Made for Everyone.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-2xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Hi, I&apos;m <span className="text-white font-semibold">Harsh Sisodia</span> — the founder and developer behind this marketplace.
          </p>

          {/* Founder Hero Card */}
          <div className="pt-6 max-w-md mx-auto">
            <div className="relative group p-0.5 rounded-3xl bg-gradient-to-r from-emerald-500/50 via-teal-500/30 to-emerald-600/50 hover:from-emerald-400 hover:to-teal-400 transition-all duration-500 shadow-2xl shadow-emerald-950/50">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-[22px] p-6 sm:p-7 flex items-center gap-5 text-left border border-white/10">
                {/* Tech Avatar Avatar Badge */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Terminal className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white" title="Active Developer">
                    <Zap className="w-3 h-3 fill-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                      Harsh Sisodia
                    </h2>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Age 15
                    </span>
                  </div>
                  <p className="text-emerald-400 font-semibold text-sm">
                    Founder & Developer
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Builder of Bazaar Marketplace & GameRank
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. My Story Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100/60 p-8 sm:p-14 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <Code2 className="w-3.5 h-3.5" />
              <span>Journey & Purpose</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              My Story
            </h2>

            <div className="space-y-5 text-slate-600 text-base sm:text-lg leading-relaxed">
              <p>
                I&apos;m <strong className="text-slate-900 font-bold">Harsh Sisodia</strong>, a 15-year-old developer who loves creating things with technology. I started building websites because I wanted to turn my ideas into real projects that people could actually use.
              </p>
              <p>
                This marketplace is one of those ideas — a place where people can list things they want to sell and connect with interested buyers easily.
              </p>
              <p className="text-slate-500 text-sm sm:text-base">
                Whether it is building classified marketplaces with zero intermediary commission or developing high-octane gaming hubs, my goal is to craft digital experiences that are clean, fast, and accessible to everyone.
              </p>
            </div>

            {/* Core Highlights Cards */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">15</span>
                <span className="text-xs text-slate-500 font-medium">Years Old</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 block">2+</span>
                <span className="text-xs text-slate-500 font-medium">Live Products</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 block">100%</span>
                <span className="text-xs text-slate-500 font-medium">Passion Driven</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 block">Next.js</span>
                <span className="text-xs text-slate-500 font-medium">Full Stack Stack</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. What I've Built Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
            <Rocket className="w-3.5 h-3.5" />
            <span>Featured Portfolio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What I&apos;ve Built
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Projects created from scratch, designed and deployed for real users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Project 1: GameRank Card */}
          <div className="group bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-7 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-6 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                  <Gamepad2 className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold bg-white/10 text-emerald-300 px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                  Live Project
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  GameRank
                </h3>
                <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                  A gaming-focused website created and developed by Harsh Sisodia.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                  Gaming Hub
                </span>
                <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                  Web App
                </span>
                <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                  Vercel
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://gamerank-one.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all group-hover:gap-3"
              >
                <span>Visit GameRank</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Project 2: Bazaar Marketplace Card */}
          <div className="group bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-100/60 flex flex-col justify-between space-y-6 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                  You Are Here
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Bazaar Marketplace
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
                  A modern peer-to-peer classifieds platform with 1-tap phone dialer, image uploads, RLS security, and instant search.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  Next.js App Router
                </span>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  Supabase PostgreSQL
                </span>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  Tailwind CSS
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/search"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all group-hover:gap-3"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Connect With Me Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-2xl space-y-6">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
              <span>Social & Community</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Connect With Me
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Have feedback, an idea for collaboration, or just want to chat about gaming and tech? Follow my journey and reach out on Instagram!
            </p>

            {/* Instagram Link Card */}
            <div className="pt-2">
              <a
                href="https://instagram.com/hxrsh_s2k14"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base px-7 py-4 rounded-2xl shadow-xl shadow-pink-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5 text-white" />
                </div>
                <span>@hxrsh_s2k14</span>
                <ExternalLink className="w-4 h-4 text-white/80" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Custom About Page Dedicated Footer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-6 text-center">
          
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-slate-800">
            <span>Made with</span>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 inline animate-bounce" />
            <span>by <strong className="font-extrabold text-slate-900">Harsh Sisodia</strong></span>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Empowering local communities with direct, fast, and secure peer-to-peer trading.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs sm:text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link href="/search" className="hover:text-emerald-600 transition-colors">
              Browse Listings
            </Link>
            <span>•</span>
            <Link href="/sell" className="hover:text-emerald-600 transition-colors">
              Sell an Item
            </Link>
            <span>•</span>
            <Link href="/about" className="text-emerald-600 font-bold">
              About Us
            </Link>
            <span>•</span>
            <a href="https://instagram.com/hxrsh_s2k14" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors">
              Contact
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
