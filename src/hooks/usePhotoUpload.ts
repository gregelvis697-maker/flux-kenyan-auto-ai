import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedPhoto {
  url: string;
  path: string;
}

export function usePhotoUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhoto = async (file: File, folder: string = 'vehicles'): Promise<UploadedPhoto | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('vehicle-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(data.path);

      return { url: publicUrl, path: data.path };
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const uploadMultiplePhotos = async (files: File[], folder: string = 'vehicles'): Promise<UploadedPhoto[]> => {
    setUploading(true);
    setUploadProgress(0);
    const uploadedPhotos: UploadedPhoto[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const photo = await uploadPhoto(files[i], folder);
        if (photo) {
          uploadedPhotos.push(photo);
        }
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      toast({
        title: 'Success',
        description: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      });

      return uploadedPhotos;
    } catch (error) {
      toast({
        title: 'Upload Error',
        description: 'Failed to upload some photos',
        variant: 'destructive',
      });
      return uploadedPhotos;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deletePhoto = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('vehicle-photos')
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadPhoto,
    uploadMultiplePhotos,
    deletePhoto,
  };
}
