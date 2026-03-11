import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface VehiclePhotoGalleryProps {
  photos: string[];
  alt: string;
}

export function VehiclePhotoGallery({ photos, alt }: VehiclePhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const hasPhotos = photos && photos.length > 0;
  const total = hasPhotos ? photos.length : 0;

  const goTo = useCallback((index: number) => {
    setCurrentIndex((index + total) % total);
  }, [total]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Auto-advance
  useEffect(() => {
    if (!hasPhotos || total <= 1 || isPaused || lightboxOpen) return;
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [hasPhotos, total, isPaused, lightboxOpen, goNext]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbnailRef.current) return;
    const thumb = thumbnailRef.current.children[currentIndex] as HTMLElement;
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentIndex]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, goNext, goPrev]);

  if (!hasPhotos) {
    return (
      <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
        <Car className="h-20 w-20 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Photo */}
      <div
        className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={photos[currentIndex]}
          alt={`${alt} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />

        {/* Nav Arrows */}
        {total > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm hover:bg-background/90 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm hover:bg-background/90 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Photo Counter */}
        <div className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full">
          {currentIndex + 1}/{total}
        </div>

        {/* Dot Indicators */}
        {total > 1 && total <= 12 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex ? "bg-primary scale-125" : "bg-foreground/40"
                )}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div
          ref={thumbnailRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {photos.map((photo, i) => (
            <button
              key={i}
              className={cn(
                "flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                "w-[100px] h-[75px] md:w-[100px] md:h-[75px] w-[80px] h-[60px]",
                i === currentIndex
                  ? "border-primary ring-1 ring-primary/50"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
              onClick={() => goTo(i)}
              aria-label={`View photo ${i + 1}`}
            >
              <img
                src={photo}
                alt={`${alt} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none [&>button]:hidden">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 h-10 w-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <img
              src={photos[currentIndex]}
              alt={`${alt} - Full size ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {total > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={goNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {currentIndex + 1} / {total}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
