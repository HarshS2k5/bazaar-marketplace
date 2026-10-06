'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorite, isFavorite } from '@/lib/data/listings';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  className,
  size = 'md',
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      isFavorite(listingId, user.id).then((val) => setFavorited(val));
    }
  }, [listingId, user]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?redirect=/listing/${listingId}`);
      return;
    }

    // Optimistic toggle
    const nextState = !favorited;
    setFavorited(nextState);
    setLoading(true);

    try {
      const result = await toggleFavorite(listingId, user.id);
      setFavorited(result);
    } catch {
      // Revert on error
      setFavorited(!nextState);
    } finally {
      setLoading(false);
    }
  };

  const sizes = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className={cn(
        'rounded-full flex items-center justify-center transition-all backdrop-blur-xs select-none shadow-xs active:scale-90',
        favorited
          ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200'
          : 'bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200/80',
        sizes[size],
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-transform',
          favorited ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600'
        )}
      />
    </button>
  );
}
