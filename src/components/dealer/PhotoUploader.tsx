import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onPhotosChange, maxPhotos = 10 }: PhotoUploaderProps) {
  const { uploading, uploadProgress, uploadMultiplePhotos } = usePhotoUpload();
  const [previews, setPreviews] = useState<string[]>([]);
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

    // Upload files
    const uploadedPhotos = await uploadMultiplePhotos(filesToUpload);
    
    // Clear previews and add actual URLs
    setPreviews([]);
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

  const removePreview = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Photos ({photos.length}/{maxPhotos})
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
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {/* Uploaded Photos */}
        {photos.map((url, index) => (
          <div
            key={`photo-${index}`}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted/30 group"
          >
            <img
              src={url}
              alt={`Vehicle photo ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
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
            Supports JPEG, PNG, GIF, WebP, HEIC
          </p>
        </div>
      )}
    </div>
  );
}
