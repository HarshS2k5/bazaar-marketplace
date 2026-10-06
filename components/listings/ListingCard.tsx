'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Phone, PhoneOff } from 'lucide-react';
import { ListingWithDetails } from '@/types';
import { formatPrice, formatDate, formatPhone, cleanPhoneForDialer } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from './FavoriteButton';

interface ListingCardProps {
  listing: ListingWithDetails;
}

export function ListingCard({ listing }: ListingCardProps) {
  const seller = listing.seller;
  const sellerPhone = seller?.phone?.trim() || listing.phone?.trim() || null;
  const sellerName = seller?.name?.trim() || 'Verified Seller';
  const hasValidPhone = Boolean(sellerPhone && sellerPhone.replace(/\D/g, '').length >= 10);
  const formattedPhone = hasValidPhone ? formatPhone(sellerPhone) : 'Phone number unavailable';
  const dialerUrl = hasValidPhone ? `tel:${cleanPhoneForDialer(sellerPhone)}` : '#';

  const primaryImage =
    listing.images?.find((img) => img.is_primary)?.image_url ||
    listing.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';

  const href = `/listing/${listing.slug || listing.id}`;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container */}
      <Link href={href} className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 block">
        <Image
          src={primaryImage}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Condition Tag Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge condition={listing.condition}>{listing.condition}</Badge>
        </div>

        {/* Sold overlay if status is sold */}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Floating Favorite Button */}
      <div className="absolute top-3 right-3 z-20">
        <FavoriteButton listingId={listing.id} />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              {formatPrice(listing.price)}
            </span>
          </div>

          {/* Title */}
          <Link href={href} className="block mt-1">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Seller Info & Contact Action */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {seller?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seller.avatar_url}
                alt={sellerName}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                {sellerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate" title={sellerName}>
                {sellerName}
              </p>
              <p className="text-[11px] text-slate-500 truncate" title={formattedPhone}>
                {formattedPhone}
              </p>
            </div>
          </div>

          {hasValidPhone ? (
            <a
              href={dialerUrl}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all shrink-0"
              title={`Call ${sellerName} (${formattedPhone})`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-medium shrink-0 cursor-not-allowed"
              title="Phone number unavailable"
            >
              <PhoneOff className="w-3 h-3" />
              <span>Unavailable</span>
            </span>
          )}
        </div>

        {/* Footer Meta: Location & Relative Date */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{formatDate(listing.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
