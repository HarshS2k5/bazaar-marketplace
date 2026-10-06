'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  MapPin, 
  Tag, 
  ChevronDown,
  PackageX
} from 'lucide-react';
import { getListings } from '@/lib/data/listings';
import { ListingWithDetails, CategorySlug, ItemCondition } from '@/types';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import { ListingCard } from '@/components/listings/ListingCard';
import { Button } from '@/components/ui/Button';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const conditionParam = searchParams.get('condition') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const locationParam = searchParams.get('location') || '';
  const sortParam = (searchParams.get('sort') as any) || 'newest';

  // State
  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [condition, setCondition] = useState(conditionParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [location, setLocation] = useState(locationParam);
  const [sortBy, setSortBy] = useState(sortParam);

  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setQuery(queryParam);
    setCategory(categoryParam);
    setCondition(conditionParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setLocation(locationParam);
    setSortBy(sortParam);

    async function fetchFiltered() {
      setLoading(true);
      const data = await getListings({
        query: queryParam || undefined,
        category: categoryParam || undefined,
        condition: conditionParam || undefined,
        minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
        location: locationParam || undefined,
        sortBy: sortParam,
      });
      setListings(data);
      setLoading(false);
    }

    fetchFiltered();
  }, [
    queryParam,
    categoryParam,
    conditionParam,
    minPriceParam,
    maxPriceParam,
    locationParam,
    sortParam,
  ]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (location.trim()) params.set('location', location.trim());
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);

    router.push(`/search?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    setQuery('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSortBy('newest');
    router.push('/search');
    setShowMobileFilters(false);
  };

  const hasActiveFilters = Boolean(
    categoryParam || conditionParam || minPriceParam || maxPriceParam || locationParam || queryParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for items, brands, or keywords..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative sm:w-64">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Mumbai)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="sm:px-8 rounded-2xl">
            Search
          </Button>
        </form>

        {/* Filter Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold text-slate-900">{listings.length}</span> results found
            {queryParam && <span>for &quot;{queryParam}&quot;</span>}
            {categoryParam && <span className="capitalize">in {categoryParam}</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('sort', e.target.value);
                  router.push(`/search?${params.toString()}`);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 shadow-xs sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            >
              <option value="">Any Condition</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <Button
            onClick={applyFilters}
            variant="primary"
            size="sm"
            className="w-full rounded-xl"
          >
            Apply Filters
          </Button>
        </div>

        {/* Results Listings Grid (3 cols on desktop) */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse p-4 space-y-3"
                >
                  <div className="bg-slate-200 rounded-xl aspect-4/3 w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <PackageX className="w-14 h-14 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  No matching listings found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try broadening your search query, clearing filters, or checking back later.
                </p>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Filter Listings</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="">Any Condition</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={applyFilters}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading marketplace search...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
