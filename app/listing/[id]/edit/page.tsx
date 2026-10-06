'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getListingById, updateListing } from '@/lib/data/listings';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { ImageUploader, ImageItem } from '@/components/listings/ImageUploader';
import { uploadListingImage } from '@/lib/supabase/storage';
import { CategorySlug, ItemCondition, ListingStatus, ListingWithDetails } from '@/types';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Form states
  const [images, setImages] = useState<ImageItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<CategorySlug>('electronics');
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<ListingStatus>('active');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      const data = await getListingById(id);
      if (!data) {
        setLoading(false);
        return;
      }

      // Check ownership
      if (user && data.seller_id !== user.id && user.role !== 'admin') {
        setIsUnauthorized(true);
        setLoading(false);
        return;
      }

      setListing(data);
      setTitle(data.title);
      setDescription(data.description);
      setPrice(data.price.toString());
      setCategory(data.category);
      setCondition(data.condition);
      setLocation(data.location);
      setPhone(data.phone);
      setStatus(data.status);

      // Map images
      const initialImgs: ImageItem[] = (data.images || []).map((img, idx) => ({
        id: img.id,
        previewUrl: img.image_url,
        isPrimary: img.is_primary || idx === 0,
      }));
      setImages(initialImgs);
      setLoading(false);
    }

    if (!authLoading) {
      if (!user) {
        router.push(`/login?redirect=/listing/${id}/edit`);
      } else {
        loadData();
      }
    }
  }, [id, user, authLoading, router]);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (images.length === 0) {
      errs.images = 'Please have at least one photo for your item.';
    }

    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    }

    if (!description.trim() || description.trim().length < 15) {
      errs.description = 'Description must be at least 15 characters long.';
    }

    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) {
      errs.price = 'Please enter a valid positive price.';
    }

    if (!location.trim()) {
      errs.location = 'Please enter a location.';
    }

    const phoneDigits = phone.replace(/[^\d]/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      errs.phone = 'Please provide a valid 10-digit phone number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user || !listing) return;

    // Double check ownership
    if (listing.seller_id !== user.id && user.role !== 'admin') {
      setIsUnauthorized(true);
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      const finalImageUrls: string[] = [];
      const sortedImages = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

      for (const img of sortedImages) {
        if (img.file) {
          const res = await uploadListingImage(img.file, user.id);
          finalImageUrls.push(res.url);
        } else {
          finalImageUrls.push(img.previewUrl);
        }
      }

      await updateListing(
        listing.id,
        {
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          condition,
          location: location.trim(),
          phone: phone.trim(),
          status,
        },
        finalImageUrls
      );

      router.push(`/listing/${listing.slug || listing.id}`);
    } catch (err: any) {
      console.error('Failed to update listing:', err);
      setSubmitError(err.message || 'Failed to update listing.');
      setIsSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading listing data...</p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">
          You do not have permission to edit this listing. Only the original seller who created this ad can modify it.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">Return to Homepage</Button>
        </Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Listing Not Found</h2>
        <Link href="/dashboard">
          <Button variant="primary" size="md">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div>
        <Link
          href={`/listing/${listing.slug || listing.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listing</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Listing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Make updates to your item description, price, status, or photos.
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
        
        {/* Status Toggle */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Ad Status</span>
            <p className="text-sm font-bold text-slate-900">
              {status === 'active' ? 'Active & Visible to Buyers' : 'Marked as Sold Out'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                status === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus('sold')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                status === 'sold'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              Mark Sold
            </button>
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Photos</h2>
          <ImageUploader images={images} onChange={setImages} />
          {errors.images && <p className="text-xs text-rose-600">{errors.images}</p>}
        </div>

        {/* Details */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Price (₹)
            </label>
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href={`/listing/${listing.slug || listing.id}`}>
            <Button type="button" variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>

      </form>
    </div>
  );
}
