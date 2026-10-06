/**
 * BAZAAR MARKETPLACE - ANTI-SPAM & RATE LIMITING SERVICE
 * Protects against bot flooding, duplicate listings, and report spamming
 */

interface RateLimitEntry {
  timestamps: number[];
  lastTitle?: string;
  lastPrice?: number;
}

// In-memory tracker keyed by user ID or IP
const listingRateLimits = new Map<string, RateLimitEntry>();
const reportRateLimits = new Map<string, number[]>();

const MAX_LISTINGS_PER_HOUR = 8;
const MAX_REPORTS_PER_15_MIN = 6;
const ONE_HOUR_MS = 60 * 60 * 1000;
const FIFTEEN_MIN_MS = 15 * 60 * 1000;

export interface SpamCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a user is exceeding listing creation frequency or submitting duplicate items
 */
export function checkListingSpam(
  userId: string,
  title: string,
  price: number
): SpamCheckResult {
  const now = Date.now();
  let entry = listingRateLimits.get(userId);

  if (!entry) {
    entry = { timestamps: [], lastTitle: '', lastPrice: 0 };
    listingRateLimits.set(userId, entry);
  }

  // Filter timestamps within the last hour
  entry.timestamps = entry.timestamps.filter((t) => now - t < ONE_HOUR_MS);

  // 1. Rate limit check
  if (entry.timestamps.length >= MAX_LISTINGS_PER_HOUR) {
    return {
      allowed: false,
      reason: `You have reached the maximum limit of ${MAX_LISTINGS_PER_HOUR} listings per hour. Please wait a short while before posting again.`,
    };
  }

  // 2. Duplicate ad check: exact title and price posted within the last 5 minutes
  const isDuplicate =
    entry.lastTitle &&
    entry.lastTitle.toLowerCase().trim() === title.toLowerCase().trim() &&
    entry.lastPrice === price &&
    entry.timestamps.length > 0 &&
    now - entry.timestamps[entry.timestamps.length - 1] < 5 * 60 * 1000;

  if (isDuplicate) {
    return {
      allowed: false,
      reason: 'A listing with the identical title and price was just posted. Please avoid submitting duplicate ads.',
    };
  }

  return { allowed: true };
}

/**
 * Record a successful listing submission for rate limiting
 */
export function recordListingSubmission(
  userId: string,
  title: string,
  price: number
): void {
  const entry = listingRateLimits.get(userId) || { timestamps: [] };
  entry.timestamps.push(Date.now());
  entry.lastTitle = title;
  entry.lastPrice = price;
  listingRateLimits.set(userId, entry);
}

/**
 * Check if a user is rate-limited on submitting reports
 */
export function checkReportRateLimit(userId: string): SpamCheckResult {
  const now = Date.now();
  let timestamps = reportRateLimits.get(userId) || [];

  // Filter timestamps within last 15 minutes
  timestamps = timestamps.filter((t) => now - t < FIFTEEN_MIN_MS);
  reportRateLimits.set(userId, timestamps);

  if (timestamps.length >= MAX_REPORTS_PER_15_MIN) {
    return {
      allowed: false,
      reason: 'Too many reports submitted recently. Thank you for your vigilance; our moderation team is reviewing existing reports.',
    };
  }

  return { allowed: true };
}

export function recordReportSubmission(userId: string): void {
  const timestamps = reportRateLimits.get(userId) || [];
  timestamps.push(Date.now());
  reportRateLimits.set(userId, timestamps);
}
