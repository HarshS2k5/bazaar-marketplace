import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChevronRight, Package, ArrowLeft, PlusCircle } from 'lucide-react';
import { getListings } from '@/lib/data/listings';
import { CATEGORIES } from '@/lib/constants';
import { ListingCard } from '@/components/listings/ListingCard';
import { Button } from '@/components/ui/Button';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.id === slug);

  if (!category) {
    return {
      title: 'Category Not Found - Bazaar',
    };
  }

  return {
    title: `${category.name} for Sale Near You | Bazaar Marketplace`,
    description: `Discover great deals on used and new ${category.name.toLowerCase()}. Contact verified local sellers directly.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.id === slug);

  if (!category) {
    notFound();
  }

  const listings = await getListings({ category: slug });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-600">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/search" className="hover:text-emerald-600">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
            Category Showcase
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {category.description}. Find the best second-hand and brand new deals directly from trusted owners.
          </p>
        </div>

        <div className="shrink-0">
          <Link href="/sell">
            <Button variant="primary" size="md" className="rounded-xl shadow-md">
              <PlusCircle className="w-4 h-4" />
              <span>Sell in {category.name}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Items Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Available Listings ({listings.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Updated in real-time
          </p>
        </div>

        <Link
          href={`/search?category=${category.id}`}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Open Advanced Filters →
        </Link>
      </div>

      {/* Listings Grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Package className="w-14 h-14 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No items listed under {category.name} yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first seller in your city to post an ad in this category!
            </p>
          </div>
          <Link href="/sell">
            <Button variant="primary" size="sm">
              Post a Free Ad
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
}
