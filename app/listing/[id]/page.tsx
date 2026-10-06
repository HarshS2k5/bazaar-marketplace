import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  MapPin, 
  Clock, 
  Eye, 
  Share2, 
  ShieldCheck, 
  User, 
  Tag, 
  CheckCircle, 
  ArrowLeft,
  ChevronRight,
  Phone,
  PhoneOff
} from 'lucide-react';
import { getListingById, getListings } from '@/lib/data/listings';
import { formatPrice, formatDate, formatPhone } from '@/lib/utils';
import { ImageGallery } from '@/components/listings/ImageGallery';
import { CallSellerButton } from '@/components/listings/CallSellerButton';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { ReportModal } from '@/components/listings/ReportModal';
import { ShareButton } from '@/components/listings/ShareButton';
import { Badge } from '@/components/ui/Badge';
import { ListingCard } from '@/components/listings/ListingCard';

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return {
      title: 'Item Not Found - Bazaar',
      description: 'The listing you are looking for does not exist or has been removed.',
    };
  }

  const primaryImage = listing.images?.find((img) => img.is_primary)?.image_url || listing.images?.[0]?.image_url;

  return {
    title: `${listing.title} - ${formatPrice(listing.price)} | Bazaar`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${listing.title} - ${formatPrice(listing.price)}`,
      description: listing.description.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  // Related listings in the same category
  const allListings = await getListings({ category: listing.category });
  const relatedListings = allListings.filter((item) => item.id !== listing.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href={`/category/${listing.category}`} className="capitalize hover:text-emerald-600 transition-colors">
          {listing.category.replace('-', ' ')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{listing.title}</span>
      </nav>

      {/* Main Grid: Gallery + Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ImageGallery images={listing.images} title={listing.title} />

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Description
            </h3>
            <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>

            {/* Quick Details Chips */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block font-medium">Category</span>
                <span className="text-sm font-semibold text-slate-800 capitalize">
                  {listing.category.replace('-', ' ')}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block font-medium">Condition</span>
                <span className="text-sm font-semibold text-slate-800">
                  {listing.condition}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400 block font-medium">Location</span>
                <span className="text-sm font-semibold text-slate-800 truncate block">
                  {listing.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Seller, Call Button & Safety (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Price & Title Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {formatPrice(listing.price)}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <Badge condition={listing.condition}>{listing.condition}</Badge>
                  {listing.status === 'sold' && (
                    <Badge variant="danger">Item Sold</Badge>
                  )}
                  <span className="text-xs text-slate-400">
                    ID: {listing.id.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Top Favorite Toggle */}
              <FavoriteButton listingId={listing.id} size="lg" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {listing.title}
            </h1>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(listing.created_at)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.views} views</span>
              </span>
            </div>

            {/* Prominent Call Seller Section */}
            {(() => {
              const sellerPhone = listing.seller?.phone?.trim() || listing.phone?.trim() || null;
              const sellerName = listing.seller?.name?.trim() || 'Verified Seller';
              const hasValidPhone = Boolean(sellerPhone && sellerPhone.replace(/\D/g, '').length >= 10);

              return (
                <div className="pt-3 space-y-3">
                  <CallSellerButton
                    phone={sellerPhone}
                    sellerName={sellerName}
                  />

                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      Seller contact:{' '}
                      <span className="font-semibold text-slate-800">
                        {hasValidPhone ? formatPhone(sellerPhone) : 'Phone number unavailable'}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Seller Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Seller Information
            </h4>
            
            <div className="flex items-center gap-3.5">
              {listing.seller?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.seller.avatar_url}
                  alt={listing.seller.name || 'Seller'}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                  {listing.seller?.name ? listing.seller.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-base truncate">
                  {listing.seller?.name || 'Local Seller'}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Phone Seller</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
              <p>Member on Bazaar since {listing.seller?.created_at ? new Date(listing.seller.created_at).getFullYear() : '2025'}</p>
              <p>Location: {listing.seller?.location || listing.location}</p>
              <p>
                Direct Contact:{' '}
                <span className="font-semibold text-slate-700">
                  {formatPhone(listing.seller?.phone || listing.phone)}
                </span>
              </p>
            </div>
          </div>

          {/* Safety Reminder Card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Buyer Safety Reminder</span>
            </div>
            <p className="text-xs font-semibold text-amber-950">
              Stay safe: Never share passwords, OTPs, banking PINs, or sensitive personal information with another user.
            </p>
            <ul className="text-xs text-amber-900/90 space-y-1.5 pl-5 list-disc leading-relaxed">
              <li>Always meet in a safe, public place to inspect the item in person.</li>
              <li>Inspect condition & test working order before handing over payment.</li>
              <li>Never wire advance token money via UPI or cash transfer.</li>
            </ul>
            <div className="pt-1 border-t border-amber-200/60">
              <Link href="/rules" className="text-[11px] font-bold text-amber-900 hover:underline">
                View All Marketplace Safety Rules →
              </Link>
            </div>
          </div>

          {/* Report & Share Buttons */}
          <div className="flex items-center justify-between px-2 pt-1">
            <ReportModal listingId={listing.id} listingTitle={listing.title} />
            <ShareButton title={listing.title} />
          </div>

        </div>
      </div>

      {/* Related Listings Section */}
      {relatedListings.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Similar Items in {listing.category.replace('-', ' ')}
            </h3>
            <Link
              href={`/category/${listing.category}`}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {relatedListings.map((rel) => (
              <ListingCard key={rel.id} listing={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
