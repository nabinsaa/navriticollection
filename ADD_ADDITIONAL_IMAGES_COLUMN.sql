-- ============================================
-- ADD ADDITIONAL IMAGES COLUMN TO PRODUCTS TABLE
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Add additional_images column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS additional_images jsonb DEFAULT '[]'::jsonb;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'additional_images';

SELECT '✅ additional_images column added successfully!' as status;
