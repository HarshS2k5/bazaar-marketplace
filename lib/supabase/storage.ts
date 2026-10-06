import { createClient } from './client';
import { isSupabaseConfigured } from '../data/listings';

export interface UploadResult {
  url: string;
  path: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export async function uploadListingImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  // 1. Validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size exceeds 5MB limit.');
  }

  // 2. Supabase Storage upload
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `listings/${fileName}`;

      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
      };
    } catch (e: any) {
      console.warn('Storage upload failed, using client data URL fallback:', e.message);
    }
  }

  // Fallback: Read as Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        path: `local/${file.name}`,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
