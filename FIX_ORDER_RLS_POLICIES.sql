-- ============================================
-- FIX ORDER RLS POLICIES
-- ============================================
-- This fixes BUG 1 & 2:
-- - Admin can see ALL orders
-- - Regular users can only see THEIR OWN orders
-- ============================================

-- Drop existing order policies
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
DROP POLICY IF EXISTS "orders_delete_own" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;

-- Create new policies

-- Policy 1: Users can SELECT their own orders
CREATE POLICY "orders_select_own"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Admins can SELECT ALL orders
CREATE POLICY "orders_admin_select_all"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 3: Users can INSERT their own orders
CREATE POLICY "orders_insert_own"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 4: Admins can UPDATE any order
CREATE POLICY "orders_admin_update"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 5: Admins can DELETE any order
CREATE POLICY "orders_admin_delete"
ON public.orders
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '✅ Order RLS policies updated successfully!' as status;

-- Show all order policies
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
