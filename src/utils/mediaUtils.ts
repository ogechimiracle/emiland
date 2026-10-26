/**
 * Utilities for optimizing images and parsing video stream URLs
 */

export function readFileAsOptimizedDataUrl(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<{ url: string; mediaType: 'image' | 'video' }> {
  return new Promise((resolve, reject) => {
    // If it's a video file
    if (file.type.startsWith('video/')) {
      const isLarge = file.size > 25 * 1024 * 1024;
      if (isLarge) {
        reject(
          new Error(
            `Video file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) is too large for direct browser embedding. Please paste a video URL (YouTube, Vimeo, Cloudinary, AWS S3, or direct MP4 link) instead.`
          )
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result as string, mediaType: 'video' });
      };
      reader.onerror = () => reject(new Error('Failed to read video file'));
      reader.readAsDataURL(file);
      return;
    }

    // If it's an image
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({ url: rawDataUrl, mediaType: 'image' });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Try exporting as webp first, then jpeg
          let finalDataUrl = '';
          try {
            const webp = canvas.toDataURL('image/webp', quality);
            if (webp && webp.startsWith('data:image/webp')) {
              finalDataUrl = webp;
            }
          } catch {}

          if (!finalDataUrl) {
            finalDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve({ url: finalDataUrl, mediaType: 'image' });
        } catch {
          resolve({ url: rawDataUrl, mediaType: 'image' });
        }
      };
      img.onerror = () => resolve({ url: rawDataUrl, mediaType: 'image' });
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'html5' | 'empty';
  embedUrl: string;
  originalUrl: string;
}

export function parseVideoInfo(url: string): VideoInfo {
  if (!url || !url.trim()) {
    return { type: 'empty', embedUrl: '', originalUrl: '' };
  }

  const cleanUrl = url.trim();

  // YouTube matchers: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&rel=0`,
      originalUrl: cleanUrl,
    };
  }

  // Vimeo matchers: vimeo.com/ID
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&playsinline=1`,
      originalUrl: cleanUrl,
    };
  }

  // Standard HTML5 video link (mp4, webm, mov, or data URL)
  return {
    type: 'html5',
    embedUrl: cleanUrl,
    originalUrl: cleanUrl,
  };
}
