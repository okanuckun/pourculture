-- Add image_url column to forum_topics
ALTER TABLE public.forum_topics ADD COLUMN image_url text;

-- Create storage bucket for forum images
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true);

-- Storage policies for forum images
CREATE POLICY "Forum images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-images');

CREATE POLICY "Authenticated users can upload forum images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'forum-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own forum images"
ON storage.objects FOR DELETE
USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);