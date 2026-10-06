import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  Lock, 
  PhoneCall, 
  HelpCircle,
  ArrowRight,
  FileText,
  UserX,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PROHIBITED_CATEGORIES } from '@/lib/moderation/prohibited-items';

export const metadata: Metadata = {
  title: 'Marketplace Rules & Prohibited Items Policy - Bazaar',
  description: 'Official Bazaar marketplace guidelines. Learn about prohibited goods, safety policies, and seller standards.',
};

export default function MarketplaceRulesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* Top Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Trust & Safety Standards</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Marketplace Rules & Prohibited Items
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Bazaar is built for local communities to trade safely and transparently. To protect all buyers and sellers, every listing is subject to strict content safety review.
        </p>
      </div>

      {/* Safety Notice Warning Box */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Zero Tolerance Policy
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Attempting to sell illegal, dangerous, counterfeit, or sexually explicit items results in immediate ad removal, account suspension, and reporting to relevant legal authorities where applicable.
          </p>
        </div>
      </div>

      {/* 1. Prohibited Items Categories Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Prohibited Items & Activities
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            The following items cannot be listed or sold under any circumstances:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROHIBITED_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 hover:border-rose-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{cat.name}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  cat.riskLevel === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Strictly Banned
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {cat.description}
              </p>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                <span className="font-semibold text-slate-500">Includes: </span>
                {cat.keywords.slice(0, 5).join(', ')}...
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Automated Moderation & Review Workflow */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            How Moderation Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Automated + Human Trust & Safety Pipeline
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Every submission goes through multiple verification layers before going live to our community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-white text-base">Text & Title Inspection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated scans verify title, description, category, and pricing against deceptive keywords, slang, and evasion tricks.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-white text-base">Image Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All uploaded photos undergo binary verification and computer-vision heuristics to ensure no graphic, explicit, or weapons imagery is present.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-white text-base">Community Reporting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Any user can flag an ad with 1 tap. Reported listings immediately enter the admin moderation queue for action.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Essential Seller & Buyer Safety Rules */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Safe Trading Rules for Everyone
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>For Buyers</span>
            </h3>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-2 pl-6 list-disc">
              <li>Always inspect the item in person before making payment.</li>
              <li>Test electronic goods, bikes, and vehicles thoroughly.</li>
              <li><strong>Never transfer money in advance via UPI or wire transfer.</strong></li>
              <li>Meet in public, well-lit spaces like cafes, transit stations, or shopping centers.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>For Sellers</span>
            </h3>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-2 pl-6 list-disc">
              <li>Provide honest photos and describe any cosmetic flaws clearly.</li>
              <li>Set fair, realistic prices to build long-term buyer trust.</li>
              <li>Never ask buyers for deposit tokens or banking passwords.</li>
              <li>Mark items as <strong>Sold</strong> as soon as the deal closes.</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Have questions about whether your item is allowed? Review our policy before listing.
          </p>
          <Link href="/sell">
            <Button variant="primary" size="md">
              <span>Post an Approved Ad</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
