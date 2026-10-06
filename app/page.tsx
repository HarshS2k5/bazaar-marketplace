import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  TrendingUp, 
  PlusCircle, 
  Tv, 
  Smartphone, 
  Laptop, 
  Gamepad2, 
  Car, 
  Bike, 
  Armchair, 
  Shirt, 
  BookOpen, 
  Trophy, 
  Home, 
  Package 
} from 'lucide-react';
import { getListings } from '@/lib/data/listings';
import { ListingCard } from '@/components/listings/ListingCard';
import { CATEGORIES } from '@/lib/constants';

// Helper icon resolver
function getCategoryIcon(iconName: string) {
  const iconProps = { className: 'w-6 h-6' };
  switch (iconName) {
    case 'Tv': return <Tv {...iconProps} />;
    case 'Smartphone': return <Smartphone {...iconProps} />;
    case 'Laptop': return <Laptop {...iconProps} />;
    case 'Gamepad2': return <Gamepad2 {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    case 'Bike': return <Bike {...iconProps} />;
    case 'Armchair': return <Armchair {...iconProps} />;
    case 'Shirt': return <Shirt {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'Trophy': return <Trophy {...iconProps} />;
    case 'Home': return <Home {...iconProps} />;
    default: return <Package {...iconProps} />;
  }
}

export default async function HomePage() {
  const allListings = await getListings();
  const recentListings = allListings.slice(0, 8);
  const electronicsListings = allListings.filter(
    (item) => item.category === 'electronics' || item.category === 'phones' || item.category === 'computers'
  ).slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Verified Peer-to-Peer Classifieds</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Buy & Sell Things <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Near You
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Find great deals or sell things you no longer need. Contact trusted sellers directly by phone with zero middleman fees.
          </p>

          {/* Large Hero Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <form action="/search" method="GET" className="relative group">
              <div className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/20 transition-all focus-within:ring-4 focus-within:ring-emerald-500/20">
                <div className="flex items-center flex-1 w-full pl-3 sm:pl-4">
                  <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search for phones, bikes, furniture, games..."
                    className="w-full text-slate-900 placeholder-slate-400 text-sm sm:text-base outline-none bg-transparent py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-7 py-3 rounded-xl sm:rounded-full transition-all shadow-md hover:shadow-emerald-600/30 shrink-0"
                >
                  Find Deals
                </button>
              </div>
            </form>

            {/* Popular quick searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
              <span className="font-medium text-slate-500">Popular:</span>
              {['iPhone 14', 'PlayStation 5', 'Mountain Bike', 'MacBook M2', 'Royal Enfield'].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="hover:text-emerald-400 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Explore Popular Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse top product collections from sellers in your region
            </p>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all text-center flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                {getCategoryIcon(cat.icon)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fresh Recommendations / Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Just Listed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Fresh Recommendations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Newly uploaded items available right now
            </p>
          </div>

          <Link
            href="/search"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 group"
          >
            <span>View all ({allListings.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No listings yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first to list an item for sale!</p>
            <Link href="/sell" className="inline-block mt-4">
              <span className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                Post an Ad
              </span>
            </Link>
          </div>
        )}
      </section>

      {/* Featured Electronics Spotlight */}
      {electronicsListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-emerald-400 font-semibold text-xs tracking-wider uppercase">
                  Top Electronics Deals
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  Phones, Computers & Gadgets
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  High performance tech verified by local owners
                </p>
              </div>

              <Link
                href="/category/electronics"
                className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 w-fit"
              >
                <span>Browse Electronics</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {electronicsListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sell Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Free to List
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Got something to sell? Post your item in 2 minutes.
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Upload multiple photos, set your price, and receive direct phone calls from eager buyers in your city.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2.5 bg-white text-emerald-900 hover:bg-emerald-50 text-base font-bold px-8 py-4 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Sell an Item Now</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
