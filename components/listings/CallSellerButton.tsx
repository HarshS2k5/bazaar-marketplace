'use client';

import React, { useState } from 'react';
import { Phone, PhoneOff, ShieldAlert, Check, Copy, ExternalLink } from 'lucide-react';
import { formatPhone, cleanPhoneForDialer } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface CallSellerButtonProps {
  phone?: string | null;
  sellerName?: string;
  className?: string;
}

export function CallSellerButton({ phone, sellerName = 'Seller', className }: CallSellerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const dialable = cleanPhoneForDialer(phone);
  const isAvailable = Boolean(phone && dialable && dialable.replace(/\D/g, '').length >= 10);
  const formattedNumber = isAvailable ? formatPhone(phone) : 'Phone number unavailable';
  const telDialerUrl = isAvailable ? `tel:${dialable}` : '#';

  if (!isAvailable) {
    return (
      <Button
        disabled
        variant="outline"
        size="lg"
        className={`w-full bg-slate-100 border-slate-200 text-slate-400 font-medium text-sm py-3.5 flex items-center justify-center gap-2 rounded-xl cursor-not-allowed ${className || ''}`}
        title="Seller has not provided a contact phone number"
      >
        <PhoneOff className="w-4 h-4 text-slate-400" />
        <span>Phone number unavailable</span>
      </Button>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectDial = () => {
    window.location.href = telDialerUrl;
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        size="lg"
        className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-3.5 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 rounded-xl ${className || ''}`}
      >
        <Phone className="w-5 h-5 animate-pulse" />
        <span>Call Seller ({formattedNumber})</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Contact Seller"
        description={`Connect directly with ${sellerName} regarding this item.`}
      >
        <div className="space-y-5">
          {/* Phone Display Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Seller Phone Number</p>
              <p className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">{formattedNumber}</p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Safety Notice Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-semibold text-amber-950">Marketplace Safety Reminder</p>
              <p className="leading-relaxed">
                Never share passwords, OTPs, or banking information with a buyer or seller. Always inspect the item in person in a safe public spot before making payment.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <a
              href={telDialerUrl}
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center font-bold text-sm px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Open Phone Dialer ({formattedNumber})</span>
            </a>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsOpen(false)}
              className="w-full text-slate-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
