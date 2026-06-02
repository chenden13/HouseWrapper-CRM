-- =========================================================================
-- Supabase Security Remediation Script
-- =========================================================================

-- 1. SECURITY DEFINER function executable by public (anon_security_definer_function_executable)
-- Revoke execution rights on rls_auto_enable() from public, anon, and authenticated roles to prevent external REST/RPC calls
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated;

-- 2. Storage Bucket "photos" allows listing (public_bucket_allows_listing)
-- Drop the overly permissive SELECT policy on storage.objects for the photos bucket
DROP POLICY IF EXISTS " Allow Public Upload 1io9m69_1" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Upload 1io9m69_1" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Upload Insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Upload Update" ON storage.objects;

-- Recreate upload policies for photos bucket strictly for the anon/authenticated roles (no SELECT allowed to prevent listing)
CREATE POLICY "Allow Public Upload Insert"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow Public Upload Update"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'photos')
WITH CHECK (bucket_id = 'photos');


-- 3. Table Row Level Security (RLS) Always True (rls_policy_always_true)

-- --- Table: finance_records ---
DROP POLICY IF EXISTS "Allow all" ON public.finance_records;
DROP POLICY IF EXISTS "Allow select finance_records" ON public.finance_records;
DROP POLICY IF EXISTS "Allow insert finance_records" ON public.finance_records;
DROP POLICY IF EXISTS "Allow update finance_records" ON public.finance_records;
DROP POLICY IF EXISTS "Allow delete finance_records" ON public.finance_records;

-- SELECT is allowed publicly (needed to load finance records on the frontend)
CREATE POLICY "Allow select finance_records"
ON public.finance_records
FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT is limited to anon & authenticated roles
CREATE POLICY "Allow insert finance_records"
ON public.finance_records
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- UPDATE is limited to anon & authenticated roles
CREATE POLICY "Allow update finance_records"
ON public.finance_records
FOR UPDATE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- DELETE is limited to anon & authenticated roles
CREATE POLICY "Allow delete finance_records"
ON public.finance_records
FOR DELETE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'));


-- --- Table: finance_settlements ---
DROP POLICY IF EXISTS "Allow all sett" ON public.finance_settlements;
DROP POLICY IF EXISTS "Allow anyone to insert finance_settlements" ON public.finance_settlements;
DROP POLICY IF EXISTS "Allow select finance_settlements" ON public.finance_settlements;
DROP POLICY IF EXISTS "Allow insert finance_settlements" ON public.finance_settlements;

-- SELECT is allowed publicly
CREATE POLICY "Allow select finance_settlements"
ON public.finance_settlements
FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT is limited to anon & authenticated roles
CREATE POLICY "Allow insert finance_settlements"
ON public.finance_settlements
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.role() IN ('anon', 'authenticated'));


-- --- Table: purchase_records ---
DROP POLICY IF EXISTS "Allow anon insert" ON public.purchase_records;
DROP POLICY IF EXISTS "Allow anon update" ON public.purchase_records;
DROP POLICY IF EXISTS "Allow select purchase_records" ON public.purchase_records;
DROP POLICY IF EXISTS "Allow insert purchase_records" ON public.purchase_records;
DROP POLICY IF EXISTS "Allow update purchase_records" ON public.purchase_records;

-- SELECT is allowed publicly
CREATE POLICY "Allow select purchase_records"
ON public.purchase_records
FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT is limited to anon & authenticated roles
CREATE POLICY "Allow insert purchase_records"
ON public.purchase_records
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- UPDATE is limited to anon & authenticated roles
CREATE POLICY "Allow update purchase_records"
ON public.purchase_records
FOR UPDATE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));


-- --- Table: vehicle_master ---
DROP POLICY IF EXISTS "Allow anyone to upsert vehicle_master" ON public.vehicle_master;
DROP POLICY IF EXISTS "Allow select vehicle_master" ON public.vehicle_master;
DROP POLICY IF EXISTS "Allow insert vehicle_master" ON public.vehicle_master;
DROP POLICY IF EXISTS "Allow update vehicle_master" ON public.vehicle_master;

-- SELECT is allowed publicly
CREATE POLICY "Allow select vehicle_master"
ON public.vehicle_master
FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT is limited to anon & authenticated roles
CREATE POLICY "Allow insert vehicle_master"
ON public.vehicle_master
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- UPDATE is limited to anon & authenticated roles
CREATE POLICY "Allow update vehicle_master"
ON public.vehicle_master
FOR UPDATE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));


-- --- Table: customers ---
-- 1. Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers;
DROP POLICY IF EXISTS "Allow select customers" ON public.customers;
DROP POLICY IF EXISTS "Allow insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow delete customers" ON public.customers;

-- 3. Create RLS policies for customers
CREATE POLICY "Allow select customers"
ON public.customers
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert customers"
ON public.customers
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow update customers"
ON public.customers
FOR UPDATE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow delete customers"
ON public.customers
FOR DELETE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'));


-- --- Table: inventory ---
-- 1. Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Allow select inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow delete inventory" ON public.inventory;

-- 3. Create RLS policies for inventory
CREATE POLICY "Allow select inventory"
ON public.inventory
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert inventory"
ON public.inventory
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow update inventory"
ON public.inventory
FOR UPDATE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow delete inventory"
ON public.inventory
FOR DELETE
TO anon, authenticated
USING (auth.role() IN ('anon', 'authenticated'));


-- --- Table: inventory_logs ---
-- 1. Enable RLS
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Allow select inventory_logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "Allow insert inventory_logs" ON public.inventory_logs;

-- 3. Create RLS policies for inventory_logs
CREATE POLICY "Allow select inventory_logs"
ON public.inventory_logs
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert inventory_logs"
ON public.inventory_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.role() IN ('anon', 'authenticated'));
