'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  Trash2, 
  ExternalLink, 
  User, 
  Flag 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getReports, deleteListing } from '@/lib/data/listings';
import { Report } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportsData() {
      setLoading(true);
      const data = await getReports();
      setReports(data);
      setLoading(false);
    }

    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (user.role === 'admin') {
        loadReportsData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router]);

  const handleDismiss = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleDeleteListing = async (listingId: string, reportId: string) => {
    if (!confirm('Are you sure you want to remove this reported listing from the platform?')) return;
    try {
      await deleteListing(listingId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error('Admin removal error:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Checking moderation privileges...</p>
      </div>
    );
  }

  // Unauthorized guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Restricted Admin Area</h2>
        <p className="text-sm text-slate-500">
          This portal is reserved for Bazaar marketplace moderators and system administrators.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="md">Return to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Moderator Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trust & Safety Moderation
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm">
            Review reported listings, investigate fraud flags, and keep buyers safe.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl text-center shrink-0">
          <span className="text-2xl font-bold block">{reports.length}</span>
          <span className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">
            Pending Reports
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            User Flags & Listing Reports
          </h2>
          <span className="text-xs text-slate-500">
            Ordered by newest first
          </span>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Flag className="w-3 h-3 text-rose-500" />
                      <span>{report.reason}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported {formatDate(report.created_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {report.listing?.title || `Listing ID: ${report.listing_id.slice(0, 8)}`}
                    </h3>
                    {report.description && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-1 border border-slate-100">
                        &quot;{report.description}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {report.listing && (
                    <Link
                      href={`/listing/${report.listing.slug || report.listing.id}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1"
                    >
                      <span>View Ad</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  <Button
                    onClick={() => handleDismiss(report.id)}
                    variant="outline"
                    size="sm"
                    className="text-slate-600"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>Dismiss</span>
                  </Button>

                  <Button
                    onClick={() => handleDeleteListing(report.listing_id, report.id)}
                    variant="danger"
                    size="sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Take Down Ad</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <ShieldCheck className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">All clear!</h3>
            <p className="text-xs text-slate-500">
              There are currently zero open reports or reported listings requiring moderation.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
