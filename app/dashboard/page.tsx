'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Package, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Layers,
  ShoppingBag,
  TrendingUp,
  Clock,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSellerListings, deleteListing, updateListing } from '@/lib/data/listings';
import { ListingWithDetails, ListingStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noticeParam = searchParams.get('notice');

  const { user, loading: authLoading } = useAuth();

  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'sold'>('all');

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState<ListingWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      const data = await getSellerListings(user.id);
      setListings(data);
      setLoading(false);
    }

    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/dashboard');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteListing(itemToDelete.id);
      setListings((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete listing:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (item: ListingWithDetails) => {
    const nextStatus: ListingStatus = item.status === 'active' || item.status === 'approved' ? 'sold' : 'approved';
    try {
      await updateListing(item.id, { status: nextStatus });
      setListings((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, status: nextStatus } : l))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Metrics
  const totalCount = listings.length;
  const activeCount = listings.filter((l) => l.status === 'active' || l.status === 'approved').length;
  const pendingCount = listings.filter((l) => l.status === 'pending').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;
  const totalViews = listings.reduce((acc, curr) => acc + (curr.views || 0), 0);

  // Tab filtering
  const filteredListings = listings.filter((l) => {
    if (activeTab === 'active') return l.status === 'active' || l.status === 'approved';
    if (activeTab === 'pending') return l.status === 'pending';
    if (activeTab === 'sold') return l.status === 'sold';
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading your seller dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Notice Banner for Pending Review */}
      {noticeParam === 'pending_review' && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-4 animate-in fade-in">
          <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950 text-sm">Listing Submitted for Safety Review</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your item was successfully uploaded and is currently undergoing automated and community moderation. Once verified by our Trust &amp; Safety team, it will become publicly visible across the marketplace.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Seller Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your ads, track buyer engagement, and check safety approval status.
          </p>
        </div>

        <Link href="/sell">
          <Button variant="primary" size="md" className="rounded-xl shadow-sm">
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ad</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Listings</p>
            <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active &amp; Approved</p>
            <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Views</p>
            <p className="text-2xl font-bold text-blue-700">{totalViews}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Ads ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'active'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active ({activeCount})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Review ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('sold')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'sold'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sold ({soldCount})
        </button>
      </div>

      {/* Listings List */}
      {filteredListings.length > 0 ? (
        <div className="space-y-4">
          {filteredListings.map((item) => {
            const primaryImg =
              item.images?.find((img) => img.is_primary)?.image_url ||
              item.images?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <Image
                      src={primaryImg}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge status={item.status}>
                        {item.status === 'pending' ? 'PENDING REVIEW' : item.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-400 capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                      {item.title}
                    </h3>

                    <p className="text-base font-extrabold text-slate-900">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Posted {formatDate(item.created_at)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item.views} views</span>
                      </span>
                    </div>

                    {item.status === 'pending' && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-1">
                        Awaiting moderation verification before public appearance.
                      </p>
                    )}

                    {item.status === 'rejected' && (
                      <p className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-block mt-1">
                        Needs Revision: {item.moderation_notes || 'Content violates marketplace safety policy.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Toggle Status Button (Only for approved/active/sold items) */}
                  {(item.status === 'active' || item.status === 'approved' || item.status === 'sold') && (
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      {item.status === 'sold' ? 'Reactivate' : 'Mark Sold'}
                    </button>
                  )}

                  {/* Public Link (Only if approved/active) */}
                  {(item.status === 'active' || item.status === 'approved') && (
                    <Link
                      href={`/listing/${item.slug || item.id}`}
                      target="_blank"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="View Public Listing"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}

                  {/* Edit */}
                  <Link
                    href={`/listing/${item.id}/edit`}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Edit Listing"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              No listings in this category
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven&apos;t posted any items matching this filter yet.
            </p>
          </div>
          <Link href="/sell" className="inline-block">
            <Button variant="primary" size="sm">
              Post an Item
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Delete Listing?"
        description="Are you sure you want to permanently remove this listing from Bazaar?"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 space-y-1">
              <p className="font-semibold">This action cannot be undone.</p>
              <p>
                Deleting &quot;{itemToDelete?.title}&quot; will remove all its photos and direct dial links.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Yes, Delete Ad
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
