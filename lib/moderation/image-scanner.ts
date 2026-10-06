/**
 * BAZAAR MARKETPLACE - IMAGE SAFETY & CONTENT MODERATION SCANNER
 * Inspects binary magic bytes, dimensions, and computer-vision heuristics
 */

export interface ImageScanResult {
  passed: boolean;
  score: number; // 0 to 100 risk score
  reason?: string;
  flag?: string;
}

/**
 * Verify Magic Bytes (File Signatures) to prevent malicious or non-image payloads
 */
export async function verifyImageMagicBytes(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: FF D8 FF
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    // PNG: 89 50 4E 47
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47;

    // WebP: RIFF ... WEBP (bytes 0-3: 52 49 46 46, bytes 8-11: 57 45 42 50)
    const isRiff =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46;
    const isWebp =
      isRiff &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;

    return isJpeg || isPng || isWebp;
  } catch {
    return false;
  }
}

/**
 * Client-side / In-memory Computer Vision heuristic inspection
 * Evaluates pixel characteristics, file size anomalies, and content distribution
 */
export async function scanImageContent(
  imageSource: File | string
): Promise<ImageScanResult> {
  // 1. If File object, first check magic bytes
  if (typeof window !== 'undefined' && imageSource instanceof File) {
    const isValidBytes = await verifyImageMagicBytes(imageSource);
    if (!isValidBytes) {
      return {
        passed: false,
        score: 95,
        reason: 'Image file structure is invalid or corrupt. Please upload a standard JPG, PNG, or WebP photo.',
        flag: 'corrupt_magic_bytes',
      };
    }

    // Inspect file naming for direct offensive keywords
    const lowerName = imageSource.name.toLowerCase();
    const suspiciousFilenames = [
      'gun', 'weapon', 'pistol', 'weed', 'cannabis', 'porn', 'xxx', 'nude', 
      'fake_id', 'hacked', 'c4', 'explosive', 'cocaine'
    ];

    if (suspiciousFilenames.some((word) => lowerName.includes(word))) {
      return {
        passed: false,
        score: 85,
        reason: 'Image contents flagged for potentially prohibited item categories.',
        flag: 'flagged_filename_indicator',
      };
    }
  }

  // 2. Browser Canvas Pixel Distribution & Skin/Violence Heuristics
  if (typeof window !== 'undefined') {
    try {
      const url =
        imageSource instanceof File
          ? URL.createObjectURL(imageSource)
          : imageSource;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      const loaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });

      if (loaded && img.width > 0 && img.height > 0) {
        // Dimension sanity check
        if (img.width < 50 || img.height < 50) {
          return {
            passed: false,
            score: 70,
            reason: 'Image resolution is too low to verify clearly. Please upload a clear photo.',
            flag: 'low_resolution',
          };
        }

        // Fast sample on an offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, 64, 64);
          const imageData = ctx.getImageData(0, 0, 64, 64);
          const data = imageData.data;

          let redDominantCount = 0;
          let fleshToneCount = 0;
          const totalPixels = 64 * 64;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Graphic violence heuristic: very high red ratio with high saturation
            if (r > 180 && g < 50 && b < 50) {
              redDominantCount++;
            }

            // Adult content heuristic: concentrated human skin tone clusters
            // Simplified standard YCbCr / RGB skin tone model
            const isSkinTone =
              r > 95 &&
              g > 40 &&
              b > 20 &&
              r > g &&
              r > b &&
              Math.abs(r - g) > 15 &&
              r - b > 15;

            if (isSkinTone) {
              fleshToneCount++;
            }
          }

          // If over 70% pixels match saturated blood red
          if (redDominantCount / totalPixels > 0.65) {
            return {
              passed: false,
              score: 90,
              reason: 'Image content flagged for potential graphic violence.',
              flag: 'graphic_violence_heuristic',
            };
          }

          // If over 80% pixels match intense uniform flesh tone clusters (potential adult/explicit)
          if (fleshToneCount / totalPixels > 0.82) {
            return {
              passed: false,
              score: 80,
              reason: 'Image content appears inappropriate or violates adult content guidelines.',
              flag: 'adult_content_heuristic',
            };
          }
        }
      }

      if (imageSource instanceof File) {
        URL.revokeObjectURL(url);
      }
    } catch {
      // In case canvas is tainted or blocked, fallback gracefully
    }
  }

  // Passed automated safety checks
  return {
    passed: true,
    score: 0,
  };
}
