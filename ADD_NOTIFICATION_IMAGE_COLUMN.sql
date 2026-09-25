-- ============================================
-- ADD PRODUCT IMAGE COLUMN TO NOTIFICATIONS
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Add product_image column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS product_image text;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'product_image';

SELECT '✅ Notifications table updated with product_image column!' as status;
