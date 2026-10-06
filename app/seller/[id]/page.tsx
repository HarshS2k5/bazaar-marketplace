'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Share2,
  Package,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { getPublicSellerProfile, getSellerListings } from '@/lib/data/listings';
import { ListingWithDetails, Profile } from '@/types';
import { ListingCard } from '@/components/listings/ListingCard';
import { formatPhone, cleanPhoneForDialer } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const sellerId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [seller, setSeller] = useState<Profile | null>(null);
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sellerId) return;

    let isMounted = true;
    async function loadSeller() {
      setLoading(true);
      try {
        const [profileData, listingsData] = await Promise.all([
          getPublicSellerProfile(sellerId),
          getSellerListings(sellerId),
        ]);

        if (isMounted) {
          setSeller(profileData);
          setListings(listingsData);
        }
      } catch (err) {
        console.error('Failed to load seller profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSeller();
    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeListings = listings.filter(
    (l) => l.status === 'active' || l.status === 'approved'
  );
  const soldListings = listings.filter((l) => l.status === 'sold');
  const displayedListings = activeTab === 'active' ? activeListings : soldListings;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-500">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Seller Not Found</h1>
        <p className="text-slate-400 mb-6 text-sm">
          The requested seller profile does not exist or has been removed from Bazaar.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const memberSinceYear = seller.created_at
    ? new Date(seller.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  const isSelf = currentUser?.id === seller.id;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Profile Header Banner */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            {/* Avatar & Information */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shrink-0 overflow-hidden relative border-2 border-indigo-500/30 shadow-lg">
                {seller.avatar_url ? (
                  <Image
                    src={seller.avatar_url}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{seller.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-100 truncate">
                    {seller.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Seller
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                  {seller.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {seller.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Member since {memberSinceYear}
                  </span>
                </div>

                {seller.bio && (
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {seller.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {!isSelf && (
                <>
                  <Link
                    href={`/messages?seller=${seller.id}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Seller
                  </Link>

                  {seller.phone && (
                    <a
                      href={`tel:${cleanPhoneForDialer(seller.phone)}`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Call ({formatPhone(seller.phone)})
                    </a>
                  )}
                </>
              )}

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Share profile link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {copied && (
            <div className="mt-4 p-2 text-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              Profile link copied to clipboard!
            </div>
          )}

          {/* Seller Stats Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 block mb-0.5">Active Listings</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-100">
                {activeListings.length}
              </span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 block mb-0.5">Items Sold</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                {soldListings.length}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 block mb-0.5">Verification</span>
              <span className="text-sm font-semibold text-indigo-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Verified
              </span>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div>
          {/* Tabs Navigation */}
          <div className="flex items-center gap-3 border-b border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-3 px-2 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Active Listings ({activeListings.length})
            </button>

            <button
              onClick={() => setActiveTab('sold')}
              className={`pb-3 px-2 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                activeTab === 'sold'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Sold Items ({soldListings.length})
            </button>
          </div>

          {/* Listings Grid */}
          {displayedListings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                {activeTab === 'active' ? 'No active listings' : 'No sold items yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {activeTab === 'active'
                  ? 'This seller currently has no active items listed for sale.'
                  : 'This seller has not marked any items as sold yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </div>

        {/* Safety Advisory Banner */}
        <div className="mt-12 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">Buyer Safety Reminder:</span> Meet in well-lit public places when picking up items. Inspect the product carefully and verify functionality before finalizing payment. Never send money in advance via wire transfers or untrusted payment links.
          </div>
        </div>
      </div>
    </div>
  );
}
