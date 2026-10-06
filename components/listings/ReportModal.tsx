'use client';

import React, { useState } from 'react';
import { Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createReport } from '@/lib/data/listings';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface ReportModalProps {
  listingId: string;
  listingTitle: string;
}

const REPORT_REASONS = [
  'Fraud, scam or suspicious payment request',
  'Offensive, illegal or prohibited content',
  'Duplicate or spam listing',
  'Item is already sold or unavailable',
  'Inaccurate price or false product details',
  'Other violation',
];

export function ReportModal({ listingId, listingTitle }: ReportModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/listing/${listingId}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport(user.id, listingId, reason, description);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setDescription('');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors py-1"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Report this ad</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Report Suspicious Listing"
        description="Help us keep the marketplace safe. Reports are audited by moderators."
      >
        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            <h4 className="font-semibold text-slate-900 text-base">Thank you for your report</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Our moderation team will review &quot;{listingTitle}&quot; and take necessary action.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what is suspicious or inaccurate about this item..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Submitting false reports intentionally may lead to account penalties.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={isSubmitting}
              >
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
