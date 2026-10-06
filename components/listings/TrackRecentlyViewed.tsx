'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addRecentlyViewed } from '@/lib/data/recently-viewed';

interface TrackRecentlyViewedProps {
  listingId: string;
}

export function TrackRecentlyViewed({ listingId }: TrackRecentlyViewedProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (listingId) {
      addRecentlyViewed(listingId, user?.id).catch(() => {});
    }
  }, [listingId, user?.id]);

  return null;
}
