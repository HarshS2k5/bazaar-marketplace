'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  Trash2, 
  ExternalLink, 
  User, 
  Flag,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  UserX,
  UserCheck,
  Search,
  Filter,
  Layers,
  Ban
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  getReports, 
  getPendingListings, 
  approveListing, 
  rejectListing, 
  removeListing, 
  resolveReport, 
  getUsersList, 
  setUserSuspension 
} from '@/lib/data/listings';
import { Report, ListingWithDetails, Profile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatPrice } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'users'>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingListings, setPendingListings] = useState<ListingWithDetails[]>([]);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<ListingWithDetails | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Violates community policy (prohibited or restricted goods)');

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      const [reps, pending, users] = await Promise.all([
        getReports(),
        getPendingListings(),
        getUsersList(),
      ]);
      setReports(reps);
      setPendingListings(pending);
      setUsersList(users);
      setLoading(false);
    }

    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (user.role === 'admin') {
        loadAdminData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router]);

  // Actions: Pending Queue
  const handleApprove = async (id: string) => {
    await approveListing(id);
    setPendingListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    await rejectListing(rejectingItem.id, rejectionReason);
    setPendingListings((prev) => prev.filter((item) => item.id !== rejectingItem.id));
    setRejectingItem(null);
  };

  // Actions: Reports Queue
  const handleDismissReport = async (reportId: string) => {
    await resolveReport(reportId, 'dismissed');
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleTakeDownListing = async (listingId: string, reportId: string) => {
    if (!confirm('Are you sure you want to permanently take down this listing?')) return;
    await removeListing(listingId);
    await resolveReport(reportId, 'resolved');
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setPendingListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  // Actions: User Suspension
  const handleToggleSuspend = async (targetUser: Profile) => {
    const nextState = !targetUser.is_suspended;
    const msg = nextState
      ? `Suspend ${targetUser.name}? All active ads by this seller will be removed immediately.`
      : `Unsuspend ${targetUser.name}?`;

    if (!confirm(msg)) return;

    await setUserSuspension(targetUser.id, nextState);
    setUsersList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, is_suspended: nextState } : u))
    );
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Authenticating moderation privileges...</p>
      </div>
    );
  }

  // Unauthorized guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Restricted Admin Area</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          This portal is reserved strictly for authorized Bazaar Trust & Safety moderators. Normal user accounts do not have access.
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
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-indigo-900/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Marketplace Moderation Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trust & Safety Administration
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm">
            Review pending listings, investigate community reports, and enforce marketplace safety policies.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/10">
            <span className="text-xl sm:text-2xl font-bold block text-amber-300">{pendingListings.length}</span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              Pending Review
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/10">
            <span className="text-xl sm:text-2xl font-bold block text-rose-300">{reports.length}</span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              Open Reports
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-2 sm:px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals ({pendingListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-2 sm:px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>User Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 sm:px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User Management ({usersList.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Listings Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Listings Awaiting Moderation Approval
            </h2>
            <span className="text-xs text-slate-500">
              Only approved items appear in public search results
            </span>
          </div>

          {pendingListings.length > 0 ? (
            <div className="space-y-4">
              {pendingListings.map((item) => {
                const primaryImg =
                  item.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image src={primaryImg} alt={item.title} fill className="object-cover" />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                          <span className="text-xs text-slate-500 capitalize">
                            Category: {item.category}
                          </span>
                          {item.moderation_score !== undefined && item.moderation_score > 0 && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                              Risk Score: {item.moderation_score}/100
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="font-bold text-slate-900">{formatPrice(item.price)}</span>
                          <span>•</span>
                          <span>Seller: {item.seller?.name || item.seller_id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>Phone: {item.phone}</span>
                        </div>

                        {item.moderation_notes && (
                          <div className="pt-1">
                            <span className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                              Flagged Signals: {item.moderation_notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
                      <Link
                        href={`/listing/${item.slug || item.id}`}
                        target="_blank"
                        className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </Link>

                      <Button
                        onClick={() => handleApprove(item.id)}
                        variant="primary"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        <span>Approve Ad</span>
                      </Button>

                      <Button
                        onClick={() => setRejectingItem(item)}
                        variant="danger"
                        size="sm"
                        className="font-bold"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Queue is Clear!</h3>
              <p className="text-xs text-slate-500">
                All submitted listings have been reviewed and approved.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Community User Reports
            </h2>
            <span className="text-xs text-slate-500">
              Reported suspicious, illegal, or scam listings
            </span>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
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
                          Reporter Note: &quot;{report.description}&quot;
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-slate-400">
                      Reported by: <span className="font-semibold text-slate-700">{report.reporter?.name || 'Anonymous User'}</span>
                    </div>
                  </div>

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
                      onClick={() => handleDismissReport(report.id)}
                      variant="outline"
                      size="sm"
                      className="text-slate-600"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Dismiss</span>
                    </Button>

                    <Button
                      onClick={() => handleTakeDownListing(report.listing_id, report.id)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Take Down</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <ShieldCheck className="w-14 h-14 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Zero Flagged Reports</h3>
              <p className="text-xs text-slate-500">
                There are currently no active user reports awaiting action.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Registered Users & Account Safety
            </h2>
            <span className="text-xs text-slate-500">
              Manage permissions and suspend accounts violating community terms
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Safety Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] text-slate-400">{u.location || 'Location unverified'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role?.toUpperCase() || 'USER'}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.is_suspended ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active & Good Standing</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                              u.is_suspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {u.is_suspended ? 'Unsuspend' : 'Suspend User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reject Listing Modal */}
      <Modal
        isOpen={Boolean(rejectingItem)}
        onClose={() => setRejectingItem(null)}
        title="Reject Listing"
        description="Provide a moderation notice. The seller will be prompted to edit and remove prohibited content."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectingItem(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
