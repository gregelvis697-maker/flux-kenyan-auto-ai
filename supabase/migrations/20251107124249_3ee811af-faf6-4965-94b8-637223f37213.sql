-- Create enum for import request status
CREATE TYPE public.import_status AS ENUM (
  'requested',
  'accepted',
  'in_transit',
  'cleared',
  'delivered',
  'received'
);

-- Create enum for vehicle condition
CREATE TYPE public.vehicle_condition AS ENUM (
  'new',
  'used',
  'certified_pre_owned'
);

-- Create enum for fuel type
CREATE TYPE public.fuel_type AS ENUM (
  'petrol',
  'diesel',
  'electric',
  'hybrid',
  'plug_in_hybrid'
);

-- Create dealer_import_requests table
CREATE TABLE public.dealer_import_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  importer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  specs TEXT,
  budget DECIMAL(12, 2) NOT NULL,
  status import_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create vehicles/inventory table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  import_request_id UUID REFERENCES public.dealer_import_requests(id) ON DELETE SET NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  condition vehicle_condition NOT NULL DEFAULT 'used',
  fuel_type fuel_type NOT NULL,
  engine_capacity TEXT NOT NULL,
  mileage INTEGER,
  color TEXT,
  transmission TEXT,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  negotiable BOOLEAN NOT NULL DEFAULT true,
  is_sold BOOLEAN NOT NULL DEFAULT false,
  photos TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dealer_import_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dealer_import_requests
CREATE POLICY "Dealers can view their own import requests"
ON public.dealer_import_requests
FOR SELECT
USING (
  dealer_id = auth.uid() AND 
  has_role(auth.uid(), 'dealer'::app_role)
);

CREATE POLICY "Dealers can create import requests"
ON public.dealer_import_requests
FOR INSERT
WITH CHECK (
  dealer_id = auth.uid() AND 
  has_role(auth.uid(), 'dealer'::app_role)
);

CREATE POLICY "Dealers can update their own import requests"
ON public.dealer_import_requests
FOR UPDATE
USING (
  dealer_id = auth.uid() AND 
  has_role(auth.uid(), 'dealer'::app_role)
);

CREATE POLICY "Importers can view assigned requests"
ON public.dealer_import_requests
FOR SELECT
USING (
  importer_id = auth.uid() AND 
  has_role(auth.uid(), 'importer'::app_role)
);

CREATE POLICY "Importers can update assigned requests"
ON public.dealer_import_requests
FOR UPDATE
USING (
  importer_id = auth.uid() AND 
  has_role(auth.uid(), 'importer'::app_role)
);

CREATE POLICY "Admins can view all import requests"
ON public.dealer_import_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for vehicles
CREATE POLICY "Dealers can view their own vehicles"
ON public.vehicles
FOR SELECT
USING (
  dealer_id = auth.uid() AND 
  has_role(auth.uid(), 'dealer'::app_role)
);

CREATE POLICY "Dealers can create vehicles"
ON public.vehicles
FOR INSERT
WITH CHECK (
  dealer_id = auth.uid() AND 
  has_role(auth.uid(), 'dealer'::app_role)
);

CREATE POLICY "Dealers can update their own vehicles"
ON public.vehicles
FOR UPDATE
USING (
  dealer_id = auth.uid() AND 
  has_role(auth.uid(), 'dealer'::app_role)
);

CREATE POLICY "Dealers can delete their own vehicles"
ON public.vehicles
FOR DELETE
USING (
  dealer_id = auth.uid() AND 
  has_role(auth.uid(), 'dealer'::app_role)
);

CREATE POLICY "Anyone can view available vehicles"
ON public.vehicles
FOR SELECT
USING (is_sold = false);

CREATE POLICY "Admins can view all vehicles"
ON public.vehicles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_dealer_import_requests_updated_at
BEFORE UPDATE ON public.dealer_import_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();