-- Create storage bucket for venue and winemaker photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('venue-photos', 'venue-photos', true);

-- Storage policies for venue photos
CREATE POLICY "Anyone can view venue photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'venue-photos');

CREATE POLICY "Authenticated users can upload venue photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'venue-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own uploads" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'venue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'venue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);