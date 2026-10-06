'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  MapPin, 
  Tag, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PackageX,
  History,
  TrendingUp,
  Sparkles,
  Eye
} from 'lucide-react';
import { getPaginatedListings, getSearchSuggestions } from '@/lib/data/listings';
import { getRecentlyViewed } from '@/lib/data/recently-viewed';
import { ListingWithDetails, CategorySlug, ItemCondition, PaginatedListings } from '@/types';
import { CATEGORIES, CONDITIONS, POPULAR_SEARCH_TERMS } from '@/lib/constants';
import { ListingCard } from '@/components/listings/ListingCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const RECENT_SEARCHES_KEY = 'bazaar_recent_searches';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Params from URL
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const conditionParam = searchParams.get('condition') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const locationParam = searchParams.get('location') || '';
  const sortParam = (searchParams.get('sort') as any) || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Form State
  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [subcategory, setSubcategory] = useState(subcategoryParam);
  const [condition, setCondition] = useState(conditionParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [location, setLocation] = useState(locationParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  // Data & UI State
  const [paginatedData, setPaginatedData] = useState<PaginatedListings>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<ListingWithDetails[]>([]);

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 5));
        }
      } catch {}
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim() || typeof window === 'undefined') return;
    try {
      const clean = term.trim();
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions as query changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      let isCurrent = true;
      getSearchSuggestions(query).then((res) => {
        if (isCurrent) setSuggestions(res);
      });
      return () => {
        isCurrent = false;
      };
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Sync state with URL params & execute query
  useEffect(() => {
    setQuery(queryParam);
    setCategory(categoryParam);
    setSubcategory(subcategoryParam);
    setCondition(conditionParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setLocation(locationParam);
    setSortBy(sortParam);
    setCurrentPage(pageParam);

    async function fetchFiltered() {
      setLoading(true);
      try {
        const data = await getPaginatedListings({
          query: queryParam || undefined,
          category: categoryParam || undefined,
          subcategory: subcategoryParam || undefined,
          condition: conditionParam || undefined,
          minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
          maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
          location: locationParam || undefined,
          sortBy: sortParam,
          page: pageParam,
          pageSize: 12,
        });
        setPaginatedData(data);
      } catch (err) {
        console.error('Error fetching paginated listings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiltered();
  }, [
    queryParam,
    categoryParam,
    subcategoryParam,
    conditionParam,
    minPriceParam,
    maxPriceParam,
    locationParam,
    sortParam,
    pageParam,
  ]);

  // Load recently viewed
  useEffect(() => {
    getRecentlyViewed(user?.id, 6).then((items) => {
      setRecentlyViewed(items);
    }).catch(() => {});
  }, [user]);

  // Apply filters to URL
  const applyFilters = (newPage: number = 1, overrideQuery?: string) => {
    const activeQ = overrideQuery !== undefined ? overrideQuery : query;
    if (activeQ.trim()) saveRecentSearch(activeQ.trim());

    const params = new URLSearchParams();
    if (activeQ.trim()) params.set('q', activeQ.trim());
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (location.trim()) params.set('location', location.trim());
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
    if (newPage > 1) params.set('page', newPage.toString());

    router.push(`/search?${params.toString()}`);
    setShowMobileFilters(false);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
    applyFilters(1, term);
  };

  const handleReset = () => {
    setQuery('');
    setCategory('');
    setSubcategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSortBy('newest');
    setCurrentPage(1);
    router.push('/search');
    setShowMobileFilters(false);
    setShowSuggestions(false);
  };

  const activeCategoryObj = CATEGORIES.find((c) => c.id === category);
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  const hasActiveFilters = Boolean(
    categoryParam ||
    subcategoryParam ||
    conditionParam ||
    minPriceParam ||
    maxPriceParam ||
    locationParam ||
    queryParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters(1);
          }}
          className="flex flex-col sm:flex-row gap-3 relative"
        >
          {/* Query input with Auto-suggestions dropdown */}
          <div ref={searchContainerRef} className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for items, brands, or keywords..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {/* Auto Suggestions */}
                {suggestions.length > 0 && (
                  <div className="pb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> Suggestions
                    </p>
                    <div className="space-y-0.5">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(s)}
                          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 text-xs flex items-center justify-between group transition-colors"
                        >
                          <span>{s}</span>
                          <span className="text-slate-500 group-hover:text-indigo-400 text-[10px]">Search</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-2 flex items-center gap-1.5">
                      <History className="w-3 h-3 text-slate-400" /> Recent Searches
                    </p>
                    <div className="space-y-0.5">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(term)}
                          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-2 group transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Search Terms */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-amber-400" /> Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {POPULAR_SEARCH_TERMS.slice(0, 8).map((term, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(term)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-300 text-[11px] font-medium border border-slate-700/60 transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location input */}
          <div className="relative sm:w-64">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Mumbai)"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="sm:px-8 rounded-2xl">
            Search
          </Button>
        </form>

        {/* Popular Tags Fast Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-500 text-[11px] font-semibold shrink-0">Popular:</span>
          {POPULAR_SEARCH_TERMS.slice(0, 6).map((term, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(term)}
              className="shrink-0 px-3 py-1 rounded-full bg-slate-950 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-slate-800 text-xs transition-all"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Filter Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200">{paginatedData.total}</span> listings found
            {queryParam && <span>for &quot;{queryParam}&quot;</span>}
            {categoryParam && <span className="capitalize">in {categoryParam}</span>}
            {subcategoryParam && <span className="text-indigo-400">({subcategoryParam})</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('sort', e.target.value);
                  params.set('page', '1');
                  router.push(`/search?${params.toString()}`);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-slate-500 text-[11px] font-semibold">Active Filters:</span>
            {queryParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                Keyword: {queryParam}
                <button onClick={() => applyFilters(1, '')} className="hover:text-white">✕</button>
              </span>
            )}
            {categoryParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs capitalize">
                Category: {categoryParam}
                <button
                  onClick={() => {
                    setCategory('');
                    setSubcategory('');
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete('category');
                    p.delete('subcategory');
                    router.push(`/search?${p.toString()}`);
                  }}
                  className="hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}
            {subcategoryParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                Subcategory: {subcategoryParam}
                <button
                  onClick={() => {
                    setSubcategory('');
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete('subcategory');
                    router.push(`/search?${p.toString()}`);
                  }}
                  className="hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}
            {conditionParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                Condition: {conditionParam}
                <button
                  onClick={() => {
                    setCondition('');
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete('condition');
                    router.push(`/search?${p.toString()}`);
                  }}
                  className="hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}
            {(minPriceParam || maxPriceParam) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                Price: ₹{minPriceParam || 0} - ₹{maxPriceParam || 'Any'}
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete('minPrice');
                    p.delete('maxPrice');
                    router.push(`/search?${p.toString()}`);
                  }}
                  className="hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              onClick={handleReset}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Refine Search</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory('');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter (Dynamic) */}
          {availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Subcategories</option>
                {availableSubcategories.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            onClick={() => applyFilters(1)}
            variant="primary"
            size="sm"
            className="w-full rounded-xl"
          >
            Apply Filters
          </Button>
        </div>

        {/* Results Listings Grid */}
        <div className="md:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900 rounded-2xl border border-slate-800 h-72 animate-pulse p-4 space-y-3"
                >
                  <div className="bg-slate-800 rounded-xl aspect-4/3 w-full" />
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : paginatedData.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedData.items.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {paginatedData.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                  <div className="text-xs text-slate-400">
                    Showing {(paginatedData.page - 1) * paginatedData.pageSize + 1} to{' '}
                    {Math.min(paginatedData.page * paginatedData.pageSize, paginatedData.total)} of{' '}
                    <span className="font-semibold text-slate-200">{paginatedData.total}</span> items
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => applyFilters(paginatedData.page - 1)}
                      disabled={paginatedData.page <= 1}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: paginatedData.totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        pageNum === 1 ||
                        pageNum === paginatedData.totalPages ||
                        (pageNum >= paginatedData.page - 1 && pageNum <= paginatedData.page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => applyFilters(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                              pageNum === paginatedData.page
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => applyFilters(paginatedData.page + 1)}
                      disabled={paginatedData.page >= paginatedData.totalPages}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <PackageX className="w-14 h-14 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  No matching listings found
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try broadening your search query, selecting different subcategories, or clearing price filters.
                </p>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Recently Viewed Carousel Section */}
      {recentlyViewed.length > 0 && (
        <div className="pt-10 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-100">Recently Viewed by You</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentlyViewed.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Filters Drawer Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base">Filter Listings</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {availableSubcategories.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="">All Subcategories</option>
                    {availableSubcategories.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
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
                <label className="text-xs font-bold text-slate-400 block mb-1">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
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
                onClick={() => applyFilters(1)}
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
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading marketplace search...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
