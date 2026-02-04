-- Add RLS policy for admins to update vehicles (for verification)
CREATE POLICY "Admins can update vehicles for verification"
ON public.vehicles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));