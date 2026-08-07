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

export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptions = {}
): string {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';
  }

  // Handle Cloudinary URLs
  if (originalUrl.includes('cloudinary.com') && originalUrl.includes('/upload/')) {
    const {
      width = 600,
      height = 400,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
    } = options;

    const transformSegment = `c_${crop},w_${width},h_${height},q_${quality},f_${format}`;
    return originalUrl.replace('/upload/', `/upload/${transformSegment}/`);
  }

  // Handle Unsplash URLs
  if (originalUrl.includes('unsplash.com')) {
    const { width = 600, quality = 80 } = options;
    const url = new URL(originalUrl);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());
    return url.toString();
  }

  return originalUrl;
}
