-- Create storage bucket for vehicle photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-photos',
  'vehicle-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff']
);

-- Allow authenticated dealers to upload photos
CREATE POLICY "Dealers can upload vehicle photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow anyone to view vehicle photos (public bucket)
CREATE POLICY "Anyone can view vehicle photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-photos');

-- Allow dealers to update their own photos
CREATE POLICY "Dealers can update their vehicle photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vehicle-photos' AND auth.role() = 'authenticated');

-- Allow dealers to delete their own photos
CREATE POLICY "Dealers can delete their vehicle photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-photos' AND auth.role() = 'authenticated');