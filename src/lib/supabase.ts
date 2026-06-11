import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual values during setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export function getSupabaseConfigStatus(): { ok: boolean; message: string } {
  if (!supabaseUrl || supabaseUrl.includes('your-project.supabase.co')) {
    return {
      ok: false,
      message: 'Supabase URL is not configured. Set VITE_SUPABASE_URL in .env.local.',
    };
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    return {
      ok: false,
      message: 'Supabase anon/public key is not configured. Set VITE_SUPABASE_ANON_KEY in .env.local.',
    };
  }

  return { ok: true, message: 'Supabase config looks valid.' };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ======================================================================
// COMPLETE DATABASE SCHEMA - v2 (Medicine + Batch architecture)
// ======================================================================
export const DATABASE_SCHEMA = `
-- =====================================================
-- MedStock - Medical Shop Management System
-- COMPLETE Supabase Database Schema v2
-- =====================================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor → New Query
-- 2. Paste this ENTIRE script
-- 3. Click "Run" 
-- 4. You should see "Success. No rows returned"
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LOOKUP / SETTINGS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_name TEXT NOT NULL DEFAULT 'My Medical Shop',
  shop_address TEXT,
  drug_license TEXT,
  gst_number TEXT,
  tax_enabled BOOLEAN DEFAULT FALSE,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  tax_name TEXT DEFAULT 'GST',
  low_stock_threshold INTEGER DEFAULT 10,
  expiry_alert_days INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (shop_name)
SELECT 'My Medical Shop'
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  short_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories
INSERT INTO categories (name, description) VALUES
  ('Analgesics', 'Pain relievers'),
  ('Antibiotics', 'Anti-bacterial medicines'),
  ('Antacids', 'Acidity & gastric medicines'),
  ('Antihistamines', 'Allergy medicines'),
  ('Antidiabetics', 'Diabetes medicines'),
  ('Cardiovascular', 'Heart & BP medicines'),
  ('Cough & Cold', 'Respiratory medicines'),
  ('Vitamins & Supplements', 'Nutritional supplements'),
  ('Skin Care', 'Dermatological products'),
  ('Eye Care', 'Ophthalmic products'),
  ('First Aid', 'Emergency supplies'),
  ('Others', 'Miscellaneous')
ON CONFLICT (name) DO NOTHING;

-- Default units
INSERT INTO units (name, short_name) VALUES
  ('Strip', 'strip'),
  ('Tablet', 'tab'),
  ('Capsule', 'cap'),
  ('Bottle', 'btl'),
  ('Tube', 'tube'),
  ('Box', 'box'),
  ('Piece', 'pcs'),
  ('Vial', 'vial'),
  ('Ampoule', 'amp'),
  ('Sachet', 'sac'),
  ('ML', 'ml'),
  ('Gram', 'gm')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- USER PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'staff')) DEFAULT 'staff',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    'admin'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SUPPLIERS
-- =====================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEDICINES (Master - unique by name)
-- =====================================================

CREATE TABLE IF NOT EXISTS medicines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  category_id UUID REFERENCES categories(id),
  unit_id UUID REFERENCES units(id),
  rack_location TEXT,
  hsn_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEDICINE BATCHES (Stock per batch + expiry)
-- One medicine can have MANY batches
-- =====================================================

CREATE TABLE IF NOT EXISTS medicine_batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  batch_number TEXT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
  expiry_date DATE NOT NULL,
  purchase_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(medicine_id, batch_number)
);

-- =====================================================
-- SALES
-- =====================================================

CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('amount', 'percentage')) DEFAULT 'amount',
  discount_value DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_enabled BOOLEAN DEFAULT FALSE,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'credit')) DEFAULT 'cash',
  created_by UUID REFERENCES profiles(id),
  synced_from TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SALE ITEMS (with FEFO batch reference)
-- =====================================================

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id),
  medicine_name TEXT NOT NULL,
  batch_id UUID REFERENCES medicine_batches(id),
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- =====================================================
-- PURCHASES
-- =====================================================

CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  invoice_number TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'partial')) DEFAULT 'pending',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id),
  medicine_name TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  purchase_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  expiry_date DATE NOT NULL
);

-- =====================================================
-- STOCK HISTORY (full audit trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medicine_id UUID REFERENCES medicines(id) NOT NULL,
  medicine_name TEXT NOT NULL,
  batch_id UUID REFERENCES medicine_batches(id),
  batch_number TEXT NOT NULL,
  movement_type TEXT CHECK (movement_type IN ('sale', 'purchase', 'adjustment', 'return', 'expired')) NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id UUID,
  reference_number TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SYNC LOGS (for Android offline sync)
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('insert', 'update', 'delete')) NOT NULL,
  payload JSONB,
  status TEXT CHECK (status IN ('pending', 'synced', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'app_settings','profiles','categories','units','suppliers',
    'medicines','medicine_batches','sales','sale_items',
    'purchases','purchase_items','stock_history','sync_logs'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "auth_select_%s" ON %I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "auth_insert_%s" ON %I FOR INSERT TO authenticated WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "auth_update_%s" ON %I FOR UPDATE TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "auth_delete_%s" ON %I FOR DELETE TO authenticated USING (true)', t, t);
  END LOOP;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_batches_medicine ON medicine_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON medicine_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_medicine ON stock_history(medicine_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_date ON stock_history(created_at);

-- =====================================================
-- TRIGGERS - Auto stock management
-- =====================================================

-- Decrease batch stock after sale
CREATE OR REPLACE FUNCTION decrease_batch_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE medicine_batches
  SET quantity = quantity - NEW.quantity, updated_at = NOW()
  WHERE id = NEW.batch_id;

  INSERT INTO stock_history (medicine_id, medicine_name, batch_id, batch_number, movement_type, quantity, reference_id)
  VALUES (NEW.medicine_id, NEW.medicine_name, NEW.batch_id, NEW.batch_number, 'sale', -NEW.quantity, NEW.sale_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_sale_item_insert ON sale_items;
CREATE TRIGGER after_sale_item_insert
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION decrease_batch_quantity();

-- Handle purchase restock
CREATE OR REPLACE FUNCTION handle_purchase_item()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id UUID;
BEGIN
  SELECT id INTO v_batch_id
  FROM medicine_batches
  WHERE medicine_id = NEW.medicine_id AND batch_number = NEW.batch_number;

  IF v_batch_id IS NOT NULL THEN
    UPDATE medicine_batches
    SET quantity = quantity + NEW.quantity, updated_at = NOW()
    WHERE id = v_batch_id;
  ELSE
    INSERT INTO medicine_batches (medicine_id, batch_number, purchase_price, selling_price, quantity, expiry_date, purchase_id)
    VALUES (NEW.medicine_id, NEW.batch_number, NEW.purchase_price, NEW.selling_price, NEW.quantity, NEW.expiry_date, NEW.purchase_id)
    RETURNING id INTO v_batch_id;
  END IF;

  INSERT INTO stock_history (medicine_id, medicine_name, batch_id, batch_number, movement_type, quantity, reference_id)
  VALUES (NEW.medicine_id, NEW.medicine_name, v_batch_id, NEW.batch_number, 'purchase', NEW.quantity, NEW.purchase_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_purchase_item_insert ON purchase_items;
CREATE TRIGGER after_purchase_item_insert
  AFTER INSERT ON purchase_items
  FOR EACH ROW EXECUTE FUNCTION handle_purchase_item();

-- =====================================================
-- HELPER VIEWS
-- =====================================================

CREATE OR REPLACE VIEW medicine_stock_view AS
SELECT
  m.id, m.name, m.generic_name, m.manufacturer,
  c.name AS category_name, u.name AS unit_name,
  m.rack_location,
  COALESCE(SUM(mb.quantity), 0) AS total_stock,
  COUNT(mb.id) AS batch_count,
  MIN(CASE WHEN mb.quantity > 0 THEN mb.expiry_date END) AS earliest_expiry
FROM medicines m
LEFT JOIN categories c ON m.category_id = c.id
LEFT JOIN units u ON m.unit_id = u.id
LEFT JOIN medicine_batches mb ON m.id = mb.medicine_id
GROUP BY m.id, c.name, u.name;

CREATE OR REPLACE VIEW fefo_batches_view AS
SELECT mb.*, m.name AS medicine_name, m.generic_name
FROM medicine_batches mb
JOIN medicines m ON mb.medicine_id = m.id
WHERE mb.quantity > 0
ORDER BY mb.medicine_id, mb.expiry_date ASC;

CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT
  DATE(created_at) AS sale_date,
  COUNT(*) AS total_orders,
  SUM(subtotal) AS total_subtotal,
  SUM(discount_amount) AS total_discount,
  SUM(tax_amount) AS total_tax,
  SUM(total) AS total_revenue
FROM sales
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
`;

// ======================================================================
// FIX PROFILE TRIGGER - Run this SEPARATELY if profile was not created
// ======================================================================
export const FIX_PROFILE_SQL = `
-- Run this if you already created a user but profile was NOT created.
-- This will create the profile row for your existing auth user.

INSERT INTO profiles (id, email, name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data ->> 'name', split_part(email, '@', 1)),
  'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
`;
