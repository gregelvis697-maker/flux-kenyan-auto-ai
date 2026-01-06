-- Create contact_requests table for buyer inquiries
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can create contact requests
CREATE POLICY "Authenticated users can create contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Buyers can view their own contact requests
CREATE POLICY "Users can view their own contact requests"
ON public.contact_requests
FOR SELECT
USING (auth.uid() = buyer_id);

-- Dealers can view contact requests for their vehicles
CREATE POLICY "Dealers can view contact requests for their vehicles"
ON public.contact_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = contact_requests.vehicle_id 
    AND v.dealer_id = auth.uid()
  )
);

-- Dealers can update (mark as read) contact requests for their vehicles
CREATE POLICY "Dealers can update contact requests for their vehicles"
ON public.contact_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = contact_requests.vehicle_id 
    AND v.dealer_id = auth.uid()
  )
);