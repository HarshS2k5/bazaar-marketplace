import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, PhoneCall, HeartHandshake } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* Safety & Trust Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Safe & Verified Community</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Stay safe: Never share passwords, OTPs, banking PINs, or sensitive personal information with another user.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Direct Phone Calling</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Call or WhatsApp verified sellers directly with 1 tap. Deal directly without any intermediary commission.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Buy & Sell Locally</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Find great bargains or turn your pre-loved goods into cash right in your city neighborhood.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Bazaar</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              The modern peer-to-peer marketplace for electronics, vehicles, furniture, bikes, and everyday essentials. Connect with nearby sellers instantly.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Built with Next.js, Supabase, Tailwind CSS & PostgreSQL.
            </div>
          </div>

          {/* Categories 1 */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Popular Categories</h5>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}`} className="text-slate-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories 2 */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">More Categories</h5>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(5, 10).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}`} className="text-slate-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Marketplace</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sell" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  + Post a Free Ad
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-slate-400 hover:text-white transition-colors">
                  Browse All Ads
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-slate-400 hover:text-white transition-colors">
                  Saved Items
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-slate-400 hover:text-white transition-colors">
                  Marketplace Rules
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span>About Harsh Sisodia</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">Creator</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Bazaar Marketplace. Built by Harsh Sisodia.</p>
          <p className="flex items-center gap-4">
            <Link href="/rules" className="text-slate-400 hover:text-emerald-400">Marketplace Rules</Link>
            <span>•</span>
            <Link href="/about" className="text-slate-400 hover:text-emerald-400">About Founder</Link>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
