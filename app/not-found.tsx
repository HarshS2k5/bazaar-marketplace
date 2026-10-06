import React from 'react';
import Link from 'next/link';
import { PackageX, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <PackageX className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Listing Not Found
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            The item you are searching for might have been sold, deleted by the seller, or the link may be incorrect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full">
              <Home className="w-4 h-4 mr-1.5" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/search" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full">
              <Search className="w-4 h-4 mr-1.5" />
              <span>Browse All Deals</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
