// Database Types for Medical Shop Management

// Customizable lookup tables
export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Unit {
  id: string;
  name: string;
  short_name: string; // e.g., "pcs" for pieces
  created_at: string;
}

// Medicine is the master product (unique by name)
export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  category_id: string;
  category_name?: string; // For display
  unit_id: string;
  unit_name?: string; // For display
  rack_location?: string;
  hsn_code?: string; // For GST
  created_at: string;
  updated_at: string;
  synced: boolean;
}

// Each medicine can have multiple batches with different expiry dates
export interface MedicineBatch {
  id: string;
  medicine_id: string;
  medicine_name?: string; // For display
  batch_number: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  expiry_date: string;
  purchase_id?: string; // Link to purchase order
  created_at: string;
  updated_at: string;
  synced: boolean;
}

// Stock movement history
export interface StockHistory {
  id: string;
  medicine_id: string;
  medicine_name: string;
  batch_id: string;
  batch_number: string;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'expired';
  quantity: number; // Positive for in, negative for out
  reference_id?: string; // Sale ID or Purchase ID
  reference_number?: string; // Invoice number
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_name?: string;
  customer_phone?: string;
  items: SaleItem[];
  subtotal: number;
  discount_type: 'amount' | 'percentage';
  discount_value: number;
  discount_amount: number; // Calculated discount amount
  tax_enabled: boolean;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'upi' | 'credit';
  created_at: string;
  created_by: string;
  synced: boolean;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  medicine_id: string;
  medicine_name: string;
  batch_id: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier_name: string;
  invoice_number: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_status: 'paid' | 'pending' | 'partial';
  created_at: string;
  synced: boolean;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  medicine_id: string;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total_price: number;
  expiry_date: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  gst_number?: string;
  created_at: string;
  synced: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  phone?: string;
  created_at: string;
}

// App Settings
export interface AppSettings {
  shop_name: string;
  shop_address: string;
  drug_license: string;
  gst_number: string;
  tax_enabled: boolean;
  tax_percentage: number;
  tax_name: string; // e.g., "GST", "VAT"
  low_stock_threshold: number;
  expiry_alert_days: number;
}

export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  totalInventory: number;
  lowStockItems: number;
  expiringItems: number;
  monthlyRevenue: number;
}
