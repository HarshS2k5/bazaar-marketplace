/**
 * BAZAAR MARKETPLACE - MULTI-LAYER CONTENT MODERATION ENGINE
 * Analyzes text, leetspeak, category matches, image safety, and returns a verified verdict.
 */

import { CategorySlug, ModerationResult } from '@/types';
import { 
  PROHIBITED_CATEGORIES, 
  normalizeText, 
  detectObfuscatedPhrases 
} from './prohibited-items';
import { scanImageContent } from './image-scanner';

export interface ListingInputData {
  title: string;
  description: string;
  category: CategorySlug;
  price: number;
  location: string;
  phone: string;
  images?: (File | string)[];
}

export async function moderateListingContent(
  input: ListingInputData
): Promise<ModerationResult> {
  const flags: string[] = [];
  let riskScore = 0;

  const rawTitle = input.title || '';
  const rawDescription = input.description || '';
  const combinedText = `${rawTitle} ${rawDescription}`;
  const normalized = normalizeText(combinedText);
  const obfuscatedHits = detectObfuscatedPhrases(combinedText);

  // 1. Direct Pattern & Keyword Matching across Policy Categories
  for (const cat of PROHIBITED_CATEGORIES) {
    // Check keywords
    for (const kw of cat.keywords) {
      if (normalized.includes(kw) || combinedText.toLowerCase().includes(kw)) {
        flags.push(`${cat.id}:${kw}`);
        riskScore += cat.riskLevel === 'critical' ? 60 : 35;
      }
    }

    // Check regex patterns (handles leetspeak and obfuscated spacing)
    for (const pattern of cat.patterns) {
      if (pattern.test(normalized) || pattern.test(combinedText)) {
        flags.push(`${cat.id}:regex_pattern_match`);
        riskScore += cat.riskLevel === 'critical' ? 70 : 40;
      }
    }
  }

  // Obfuscated phrase hits
  if (obfuscatedHits.length > 0) {
    for (const hit of obfuscatedHits) {
      flags.push(`obfuscated:${hit}`);
      riskScore += 50;
    }
  }

  // 2. Category Anomaly / Mismatch Checks
  // e.g., High-tech products listed under "Books" with suspicious low pricing
  const techCategories = ['phones', 'computers', 'gaming', 'electronics'];
  if (!techCategories.includes(input.category)) {
    const techKeywords = ['iphone 15 pro', 'macbook pro m3', 'rtx 4090', 'playstation 5'];
    if (techKeywords.some((k) => normalized.includes(k))) {
      flags.push('category_mismatch');
      riskScore += 20;
    }
  }

  // 3. Financial Wire Scam Phrases
  const scamTriggers = [
    'pay advance', 'western union', 'transfer money before meeting', 
    'gift card code', 'crypto only', 'send pin'
  ];
  if (scamTriggers.some((t) => normalized.includes(t))) {
    flags.push('financial_wire_warning');
    riskScore += 45;
  }

  // 4. Image Moderation Scan (if images provided)
  if (input.images && input.images.length > 0) {
    for (const img of input.images) {
      try {
        const scan = await scanImageContent(img);
        if (!scan.passed) {
          flags.push(`image:${scan.flag || 'flagged'}`);
          riskScore += scan.score;
        }
      } catch {
        // Fallback safely
      }
    }
  }

  // 5. Final Classification Verdict
  // Critical / severe violations (> 60 score) -> REJECTED
  if (riskScore >= 60) {
    return {
      status: 'rejected',
      score: Math.min(riskScore, 100),
      publicMessage: 
        'This listing could not be approved because its contents appear to violate Bazaar\'s Marketplace Safety Policies (prohibited goods, restricted products, or unsafe payment methods). Please edit your listing details and submit again.',
      internalFlags: flags,
    };
  }

  // Suspicious / border-line items (25 to 59 score) -> PENDING REVIEW
  if (riskScore >= 25) {
    return {
      status: 'pending',
      score: riskScore,
      publicMessage: 
        'Your listing has been submitted and is currently pending review by our Trust & Safety moderation team. It will appear publicly once verified.',
      internalFlags: flags,
    };
  }

  // Passed cleanly -> APPROVED
  return {
    status: 'approved',
    score: riskScore,
    publicMessage: 'Listing approved and published successfully.',
    internalFlags: flags,
  };
}
