/**
 * Cloudinary Responsive Image URL Transformation Helper
 * Formats raw Cloudinary URLs with dynamic width, height, quality (q_auto), and format (f_auto)
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';

export function getOptimizedImageUrl(
  originalUrl?: string | null,
  options: ImageOptions = {}
): string {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return DEFAULT_FALLBACK;
  }

  const trimmed = originalUrl.trim();

  // If URL is an unrenderable blob or empty, return default fallback
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:') || trimmed === '') {
    return DEFAULT_FALLBACK;
  }

  // Pass through relative local static assets (e.g. /logo-ghurabo.png, /banner-one.png)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    // Handle Cloudinary URLs
    if (trimmed.includes('cloudinary.com') && trimmed.includes('/upload/')) {
      // If already transformed with c_ or w_, don't add redundant segments
      if (trimmed.includes('/upload/c_') || trimmed.includes('/upload/w_')) {
        return trimmed;
      }

      const {
        width = 600,
        height = 400,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
      } = options;

      const transformSegment = `c_${crop},w_${width},h_${height},q_${quality},f_${format}`;
      return trimmed.replace('/upload/', `/upload/${transformSegment}/`);
    }

    // Handle Unsplash URLs
    if (trimmed.includes('unsplash.com')) {
      const { width = 600, quality = 80 } = options;
      const url = new URL(trimmed);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', width.toString());
      url.searchParams.set('q', quality.toString());
      return url.toString();
    }
  } catch {
    // If URL parsing fails, return original or fallback safely
    return trimmed.startsWith('http') ? trimmed : DEFAULT_FALLBACK;
  }

  return trimmed;
}
