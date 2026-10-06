'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  HelpCircle,
  ExternalLink,
  Eye 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader, ImageItem } from '@/components/listings/ImageUploader';
import { uploadListingImage } from '@/lib/supabase/storage';
import { createListing } from '@/lib/data/listings';
import { moderateListingContent } from '@/lib/moderation';
import { checkListingSpam, recordListingSubmission } from '@/lib/security/rate-limit';
import { CategorySlug, ItemCondition } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function SellPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateProfile } = useAuth();

  const [images, setImages] = useState<ImageItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<CategorySlug>('electronics');
  const [subcategory, setSubcategory] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  // Autofill user details if available
  useEffect(() => {
    if (user) {
      if (user.phone && !phone) setPhone(user.phone);
      if (user.location && !location) setLocation(user.location);
    }
  }, [user]);

  // Auth guard: if not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/sell');
    }
  }, [user, authLoading, router]);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (images.length === 0) {
      errs.images = 'Please upload at least one photo of your item.';
    }

    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    } else if (title.trim().length > 100) {
      errs.title = 'Title must be under 100 characters.';
    }

    if (!description.trim() || description.trim().length < 15) {
      errs.description = 'Please provide a descriptive explanation (at least 15 characters).';
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = 'Please enter a valid positive price.';
    }

    if (!location.trim()) {
      errs.location = 'Please enter your neighborhood or city.';
    }

    // Phone validation (at least 10 digits)
    const phoneDigits = phone.replace(/[^\d]/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number for buyers to call.';
    }

    if (!agreedToRules) {
      errs.rules = 'You must confirm that your item complies with the marketplace rules.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setModerationWarning(null);

    // 1. Anti-spam & duplicate check
    const spamCheck = checkListingSpam(user.id, title, parseFloat(price));
    if (!spamCheck.allowed) {
      setSubmitError(spamCheck.reason || 'Spam prevention limit reached.');
      setIsSubmitting(false);
      return;
    }

    // 2. Multi-layer content moderation inspection
    try {
      const moderationResult = await moderateListingContent({
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        location: location.trim(),
        phone: phone.trim(),
        images: images.map((i) => i.file || i.previewUrl),
      });

      // If rejected by safety policy: block submission and let seller revise
      if (moderationResult.status === 'rejected') {
        setSubmitError(moderationResult.publicMessage);
        setIsSubmitting(false);
        return;
      }

      // If borderline: will be saved as 'pending' review
      const targetStatus = moderationResult.status === 'pending' ? 'pending' : 'approved';

      // 3. Process image uploads
      const uploadedUrls: string[] = [];
      const sortedImages = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

      for (const item of sortedImages) {
        if (item.file) {
          const result = await uploadListingImage(item.file, user.id);
          uploadedUrls.push(result.url);
        } else {
          uploadedUrls.push(item.previewUrl);
        }
      }

      // 4. Create listing with moderation metadata
      const created = await createListing(
        {
          seller_id: user.id,
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          subcategory: subcategory || null,
          condition,
          location: location.trim(),
          phone: phone.trim(),
          status: targetStatus,
          moderation_notes: moderationResult.internalFlags.length > 0 
            ? moderationResult.internalFlags.join(', ') 
            : 'Automated safety check passed',
          moderation_score: moderationResult.score,
          seller: {
            ...user,
            phone: phone.trim(),
            location: location.trim(),
          },
          images: [],
        },
        uploadedUrls
      );

      // Keep user's profile phone up to date if not already set or changed
      try {
        if (!user.phone || user.phone !== phone.trim()) {
          await updateProfile({ phone: phone.trim(), location: location.trim() });
        }
      } catch {}

      // Record successful creation for anti-spam tracking
      recordListingSubmission(user.id, title, parseFloat(price));

      // 5. Redirection based on moderation status
      if (targetStatus === 'pending') {
        router.push('/dashboard?notice=pending_review');
      } else {
        router.push(`/listing/${created.slug || created.id}`);
      }
    } catch (err: any) {
      console.error('Failed to create listing:', err);
      setSubmitError(err.message || 'Something went wrong while publishing your ad.');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sell an Item
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Post your classified ad in seconds. All listings are verified for community safety.
        </p>
      </div>

      {/* Moderation Rejection Error Banner */}
      {submitError && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl flex items-start gap-3.5 text-sm text-rose-900 animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-950">Listing Could Not Be Approved</p>
            <p className="text-xs leading-relaxed text-rose-800">{submitError}</p>
            <p className="text-[11px] text-rose-600 pt-1 font-semibold">
              Please review your title, description, and photos, then submit again.
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 space-y-8">
        
        {/* Section 1: Photos */}
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">1. Photos</h2>
            <p className="text-xs text-slate-500">
              Photos are automatically checked for quality and content safety.
            </p>
          </div>

          <ImageUploader images={images} onChange={setImages} />
          {errors.images && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.images}</span>
            </p>
          )}
        </div>

        {/* Section 2: Details */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">2. Item Details</h2>
            <p className="text-xs text-slate-500">
              Include brand, model, and key specifications.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sony PlayStation 5 Disc Edition with 2 Controllers"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.title ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category, Subcategory & Condition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as CategorySlug);
                  setSubcategory('');
                }}
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
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select (Optional)</option>
                {(CATEGORIES.find((c) => c.id === category)?.subcategories || []).map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Condition <span className="text-rose-500">*</span>
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

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Price (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45000"
                className={`w-full bg-slate-50 border rounded-xl pl-8 pr-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.price ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-rose-600 mt-1">{errors.price}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, reason for selling, accessories included, warranty details, etc..."
              className={`w-full bg-slate-50 border rounded-xl p-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.description ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Section 3: Contact & Location */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">3. Contact & Location</h2>
            <p className="text-xs text-slate-500">
              Buyers will dial this phone number directly from the ad page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Location (City / Area) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. City, Neighborhood"
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.location ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-rose-600 mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.phone ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Mandatory Marketplace Safety Agreement */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <input
              type="checkbox"
              id="rulesAgreement"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-1 shrink-0 cursor-pointer"
            />
            <label htmlFor="rulesAgreement" className="text-xs sm:text-sm text-slate-700 leading-relaxed cursor-pointer select-none">
              <strong>By posting this listing, you agree that your item follows our marketplace rules.</strong> Prohibited, illegal, dangerous, or inappropriate items are not allowed.{' '}
              <Link
                href="/rules"
                target="_blank"
                className="text-emerald-700 underline font-semibold hover:text-emerald-800 inline-flex items-center gap-0.5 ml-1"
              >
                <span>Read Full Marketplace Rules</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </label>
          </div>
          {errors.rules && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.rules}</span>
            </p>
          )}
        </div>

        {/* Submit & Preview Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Items pass through automated moderation before public indexation.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                if (validate()) {
                  setShowPreviewModal(true);
                }
              }}
              className="w-full sm:w-auto px-6 font-semibold"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Preview Listing
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full sm:w-auto px-8 font-bold"
            >
              Publish Listing
            </Button>
          </div>
        </div>

      </form>

      {/* Listing Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Listing Preview"
        description="Verify how your listing will appear to buyers across Bazaar."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {images.length > 0 && (
            <div className="aspect-16/9 relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0].previewUrl}
                alt={title || 'Item Preview'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-black text-slate-900">
                {formatPrice(parseFloat(price) || 0)}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {condition}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {category.replace('-', ' ')}
                </span>
                {subcategory && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {subcategory}
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{title}</h3>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line max-h-36 overflow-y-auto">
            {description}
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Location: <strong>{location}</strong></span>
            <span>Contact Phone: <strong>{phone}</strong></span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewModal(false)}
            >
              Back to Editing
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={(e) => {
                setShowPreviewModal(false);
                handleSubmit(e as any);
              }}
            >
              Looks Great, Publish Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
