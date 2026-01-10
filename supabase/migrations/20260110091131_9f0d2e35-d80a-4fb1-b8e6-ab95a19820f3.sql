-- Create a function to auto-create vehicle inventory when an import is marked as "received"
-- This completes the importer -> dealer handoff
CREATE OR REPLACE FUNCTION public.create_inventory_from_import()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'received'
  IF NEW.status = 'received' AND OLD.status = 'delivered' THEN
    -- Insert a new vehicle into inventory linked to this import request
    INSERT INTO public.vehicles (
      dealer_id,
      import_request_id,
      make,
      model,
      year,
      condition,
      fuel_type,
      engine_capacity,
      price,
      negotiable,
      description
    ) VALUES (
      NEW.dealer_id,
      NEW.id,
      NEW.make,
      NEW.model,
      NEW.year,
      'new'::vehicle_condition,
      'petrol'::fuel_type, -- Default, dealer can update
      '2.0L', -- Default, dealer can update
      NEW.budget,
      true,
      COALESCE(NEW.specs, 'Imported via Flux - ' || NEW.make || ' ' || NEW.model || ' ' || NEW.year)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_create_inventory_from_import ON public.dealer_import_requests;
CREATE TRIGGER trigger_create_inventory_from_import
  AFTER UPDATE ON public.dealer_import_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_from_import();