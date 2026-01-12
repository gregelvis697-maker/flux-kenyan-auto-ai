-- Add policy to allow importers to read profiles for dealers they work with
-- This is needed to display dealer emails in importer dashboards
CREATE POLICY "Importers can view dealer profiles for assigned requests" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.dealer_import_requests dir
    WHERE dir.dealer_id = profiles.id 
    AND dir.importer_id = auth.uid()
  )
);

-- Add policy to allow dealers to view importer profiles for their requests
CREATE POLICY "Dealers can view importer profiles for their requests" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.dealer_import_requests dir
    WHERE dir.importer_id = profiles.id 
    AND dir.dealer_id = auth.uid()
  )
);