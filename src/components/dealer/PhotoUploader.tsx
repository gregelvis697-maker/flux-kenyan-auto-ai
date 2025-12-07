import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2, GripVertical, Maximize2 } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { PhotoGallery } from './PhotoGallery';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onPhotosChange, maxPhotos = 10 }: PhotoUploaderProps) {
  const { uploading, uploadProgress, compressionProgress } = usePhotoUpload();
  const { uploadMultiplePhotos } = usePhotoUpload();
  const [previews, setPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit number of photos
    const remainingSlots = maxPhotos - photos.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more photo(s)`);
    }

    // Create local previews first
    const newPreviews = filesToUpload.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setIsCompressing(true);

    // Upload files
    const uploadedPhotos = await uploadMultiplePhotos(filesToUpload);
    
    // Clear previews and add actual URLs
    setPreviews([]);
    setIsCompressing(false);
    newPreviews.forEach(url => URL.revokeObjectURL(url));
    
    const newPhotoUrls = uploadedPhotos.map(p => p.url);
    onPhotosChange([...photos, ...newPhotoUrls]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newPhotos = [...photos];
    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    
    onPhotosChange(newPhotos);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch-based reordering
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);

  const handleTouchStart = useCallback((index: number) => {
    setTouchDragIndex(index);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent, currentIndex: number) => {
    if (touchDragIndex === null) return;
    
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const photoElement = elements.find(el => el.getAttribute('data-photo-index'));
    
    if (photoElement) {
      const targetIndex = parseInt(photoElement.getAttribute('data-photo-index') || '-1');
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        setDragOverIndex(targetIndex);
      }
    }
  }, [touchDragIndex]);

  const handleTouchEnd = useCallback((dropIndex: number) => {
    if (touchDragIndex !== null && touchDragIndex !== dropIndex && dragOverIndex !== null) {
      const newPhotos = [...photos];
      const [draggedPhoto] = newPhotos.splice(touchDragIndex, 1);
      newPhotos.splice(dragOverIndex, 0, draggedPhoto);
      onPhotosChange(newPhotos);
    }
    setTouchDragIndex(null);
    setDragOverIndex(null);
  }, [touchDragIndex, dragOverIndex, photos, onPhotosChange]);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Photos ({photos.length}/{maxPhotos})
          {photos.length > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              Drag to reorder • First photo is primary
            </span>
          )}
        </label>
        {photos.length < maxPhotos && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-8 text-xs"
          >
            {uploading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Upload className="h-3 w-3 mr-1" />
            )}
            Upload
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
          {isCompressing && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Compressing...</span>
                <span>{compressionProgress}%</span>
              </div>
              <Progress value={compressionProgress} className="h-1.5" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        </div>
      )}

      {/* Photo Grid with Drag & Drop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {/* Uploaded Photos */}
        {photos.map((url, index) => (
          <div
            key={`photo-${index}`}
            data-photo-index={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onTouchStart={() => handleTouchStart(index)}
            onTouchMove={(e) => handleTouchMove(e, index)}
            onTouchEnd={() => handleTouchEnd(index)}
            className={`relative aspect-square rounded-lg overflow-hidden bg-muted/30 group cursor-move transition-all duration-200 ${
              draggedIndex === index ? 'opacity-50 scale-95' : ''
            } ${
              dragOverIndex === index && draggedIndex !== index
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                : ''
            } ${index === 0 ? 'ring-2 ring-primary/50' : ''}`}
          >
            <img
              src={url}
              alt={`Vehicle photo ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            
            {/* Primary badge */}
            {index === 0 && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[8px] sm:text-[10px] font-medium rounded">
                Primary
              </span>
            )}

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => openGallery(index)}
                className="p-1.5 bg-background/80 hover:bg-background rounded-full transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="p-1.5 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Drag handle indicator */}
            <div className="absolute bottom-1 right-1 p-0.5 bg-background/60 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        ))}

        {/* Preview Photos (uploading) */}
        {previews.map((url, index) => (
          <div
            key={`preview-${index}`}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted/30 animate-pulse"
          >
            <img
              src={url}
              alt={`Uploading ${index + 1}`}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        {photos.length < maxPhotos && !uploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 bg-muted/10 hover:bg-muted/20 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Add</span>
          </button>
        )}
      </div>

      {photos.length === 0 && previews.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/50 hover:border-primary/50 rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors bg-muted/5 hover:bg-muted/10"
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Click or drag photos to upload
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Images are auto-compressed for optimal quality
          </p>
        </div>
      )}

      {/* Photo Gallery Modal */}
      <PhotoGallery
        photos={photos}
        initialIndex={galleryIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </div>
  );
}
