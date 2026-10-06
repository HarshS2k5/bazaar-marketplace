import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPhone(phone: string): string {
  // Strip non-digits except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return phone;

  // If 10 digits Indian mobile
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    const raw = cleaned.slice(3);
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  return phone;
}

export function cleanPhoneForDialer(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91${digits}`;
  return digits;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function generateSlug(title: string, id: string): string {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  // Take the first 8 characters of UUID or id
  const shortId = id.split('-')[0] || id;
  return `${cleanTitle}-${shortId}`;
}

export function extractIdFromSlug(slug: string): string {
  // If slug is a full uuid
  if (slug.length >= 32 && slug.includes('-') && slug.split('-').length === 5) {
    return slug;
  }
  // If slug has the shortId appended at the end
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
