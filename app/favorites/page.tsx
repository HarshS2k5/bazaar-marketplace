'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserFavorites } from '@/lib/data/listings';
import { ListingWithDetails } from '@/types';
import { ListingCard } from '@/components/listings/ListingCard';
import { Button } from '@/components/ui/Button';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      setLoading(true);
      const data = await getUserFavorites(user.id);
      setFavorites(data);
      setLoading(false);
    }

    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/favorites');
      } else {
        loadFavorites();
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading your saved items...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Wishlist</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Items
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and compare listings you are interested in buying.
          </p>
        </div>

        <Link href="/search">
          <Button variant="outline" size="sm" className="rounded-xl">
            Browse More Deals
          </Button>
        </Link>
      </div>

      {/* Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {favorites.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              No saved items yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When browsing, click the heart icon on any listing card to save it to your wishlist for quick comparison.
            </p>
          </div>
          <Link href="/search" className="inline-block pt-2">
            <Button variant="primary" size="md">
              <span>Explore Marketplace Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
}
