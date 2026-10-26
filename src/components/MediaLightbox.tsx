import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: Array<{ url: string; title?: string; type?: 'image' | 'video' }>;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  projectTitle: string;
  categoryName?: string;
  location?: string;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  isOpen,
  onClose,
  mediaList,
  currentIndex,
  onSelectIndex,
  projectTitle,
  categoryName,
  location,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onSelectIndex((currentIndex - 1 + mediaList.length) % mediaList.length);
      }
      if (e.key === 'ArrowRight') {
        onSelectIndex((currentIndex + 1) % mediaList.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaList.length, onClose, onSelectIndex]);

  if (!isOpen || mediaList.length === 0) return null;

  const currentItem = mediaList[currentIndex] || mediaList[0];
  const isVideo = currentItem.type === 'video' ||
    currentItem.url.endsWith('.mp4') ||
    currentItem.url.endsWith('.webm') ||
    currentItem.url.includes('youtube') ||
    currentItem.url.includes('vimeo');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8 animate-fadeIn">
      {/* Top bar with details and close button */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between text-white z-10">
        <div>
          <h3 className="font-serif text-lg md:text-xl font-medium tracking-wide">
            {projectTitle}
          </h3>
          <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
            {categoryName && <span>{categoryName}</span>}
            {categoryName && location && <span aria-hidden="true">·</span>}
            {location && <span>{location}</span>}
            <span aria-hidden="true">·</span>
            <span>
              {currentIndex + 1} of {mediaList.length}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close fullscreen gallery"
          className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main media display */}
      <div className="relative w-full max-w-6xl max-h-[80vh] flex items-center justify-center">
        {isVideo ? (
          <div className="w-full aspect-video max-h-[75vh] flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <video
              src={currentItem.url}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <img
            src={currentItem.url}
            alt={currentItem.title || projectTitle}
            className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
          />
        )}

        {/* Previous Button */}
        {mediaList.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex - 1 + mediaList.length) % mediaList.length)}
            aria-label="Previous image"
            className="absolute left-2 md:-left-12 p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {mediaList.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex + 1) % mediaList.length)}
            aria-label="Next image"
            className="absolute right-2 md:-right-12 p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom thumbnails strip */}
      {mediaList.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto py-2">
          {mediaList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`relative w-16 h-12 rounded overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                idx === currentIndex ? 'border-[#D4A373] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={item.url} alt="" className="w-full h-full object-cover" />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
