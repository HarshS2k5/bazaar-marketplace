'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  PlusCircle, 
  Heart, 
  User, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { CATEGORIES } from '@/lib/constants';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                Bazaar
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-2">
                Market
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-xl mx-4 relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for phones, bikes, furniture, games..."
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder-slate-400 pl-11 pr-24 py-2.5 rounded-full text-sm border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Category Dropdown */}
            <div className="relative hidden lg:block" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Browse by Category</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.id}`}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-slate-400">View</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Saved Items / Favorites Icon */}
            <Link
              href="/favorites"
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition-colors relative"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:ring-2 hover:ring-emerald-500/20 transition-all"
                >
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          Admin Access
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Listings</span>
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>Saved Items</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          <span>Admin Moderation</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                          router.push('/');
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Sell Button */}
            <Link href="/sell">
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 shadow-sm shadow-emerald-600/30 font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell Item</span>
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, bikes, furniture..."
              className="w-full bg-slate-100 text-slate-900 placeholder-slate-400 pl-10 pr-20 py-2.5 rounded-full text-sm border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Explore Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-slate-600 hover:text-emerald-600 py-1.5 px-2 rounded-lg hover:bg-slate-50 truncate"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <Link
              href="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm text-slate-700 py-1.5"
            >
              <Heart className="w-4 h-4 text-slate-400" />
              <span>Saved Items</span>
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-slate-700 py-1.5"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>My Listings</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-indigo-600 py-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Admin Moderation</span>
                  </Link>
                )}
                <button
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                    router.push('/');
                  }}
                  className="flex items-center gap-2 text-sm text-rose-600 py-1.5 w-full text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
