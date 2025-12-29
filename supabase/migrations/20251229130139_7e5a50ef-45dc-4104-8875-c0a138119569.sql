-- Add latitude and longitude columns to winemakers table
ALTER TABLE public.winemakers
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;