import { Medicine, MedicineBatch, Sale, Supplier, DashboardStats, Category, Unit, StockHistory, AppSettings } from '../types';

// Default Categories - User can customize these
export const defaultCategories: Category[] = [
  { id: '1', name: 'Analgesics', description: 'Pain relievers', created_at: '2024-01-01' },
  { id: '2', name: 'Antibiotics', description: 'Anti-bacterial medicines', created_at: '2024-01-01' },
  { id: '3', name: 'Antacids', description: 'Acidity & gastric medicines', created_at: '2024-01-01' },
  { id: '4', name: 'Antihistamines', description: 'Allergy medicines', created_at: '2024-01-01' },
  { id: '5', name: 'Antidiabetics', description: 'Diabetes medicines', created_at: '2024-01-01' },
  { id: '6', name: 'Cardiovascular', description: 'Heart & BP medicines', created_at: '2024-01-01' },
  { id: '7', name: 'Cough & Cold', description: 'Respiratory medicines', created_at: '2024-01-01' },
  { id: '8', name: 'Vitamins & Supplements', description: 'Nutritional supplements', created_at: '2024-01-01' },
  { id: '9', name: 'Skin Care', description: 'Dermatological products', created_at: '2024-01-01' },
  { id: '10', name: 'Eye Care', description: 'Ophthalmic products', created_at: '2024-01-01' },
  { id: '11', name: 'First Aid', description: 'Emergency supplies', created_at: '2024-01-01' },
  { id: '12', name: 'Others', description: 'Miscellaneous', created_at: '2024-01-01' }
];

// Default Units - User can customize these
export const defaultUnits: Unit[] = [
  { id: '1', name: 'Strip', short_name: 'strip', created_at: '2024-01-01' },
  { id: '2', name: 'Tablet', short_name: 'tab', created_at: '2024-01-01' },
  { id: '3', name: 'Capsule', short_name: 'cap', created_at: '2024-01-01' },
  { id: '4', name: 'Bottle', short_name: 'btl', created_at: '2024-01-01' },
  { id: '5', name: 'Tube', short_name: 'tube', created_at: '2024-01-01' },
  { id: '6', name: 'Box', short_name: 'box', created_at: '2024-01-01' },
  { id: '7', name: 'Piece', short_name: 'pcs', created_at: '2024-01-01' },
  { id: '8', name: 'Vial', short_name: 'vial', created_at: '2024-01-01' },
  { id: '9', name: 'Ampoule', short_name: 'amp', created_at: '2024-01-01' },
  { id: '10', name: 'Sachet', short_name: 'sac', created_at: '2024-01-01' },
  { id: '11', name: 'ML', short_name: 'ml', created_at: '2024-01-01' },
  { id: '12', name: 'Gram', short_name: 'gm', created_at: '2024-01-01' }
];

// Default App Settings
export const defaultAppSettings: AppSettings = {
  shop_name: 'MedStock Pharmacy',
  shop_address: '123 Health Street, Medical Complex, City - 400001',
  drug_license: 'DL-MH-12345',
  gst_number: '27AABCT1332L1ZV',
  tax_enabled: false,
  tax_percentage: 0,
  tax_name: 'GST',
  low_stock_threshold: 10,
  expiry_alert_days: 90
};

// Mock Medicines (Master Data - unique names)
export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    generic_name: 'Paracetamol',
    manufacturer: 'Cipla Ltd',
    category_id: '1',
    category_name: 'Analgesics',
    unit_id: '1',
    unit_name: 'Strip',
    rack_location: 'A1-01',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    synced: true
  },
  {
    id: '2',
    name: 'Amoxicillin 500mg',
    generic_name: 'Amoxicillin',
    manufacturer: 'Sun Pharma',
    category_id: '2',
    category_name: 'Antibiotics',
    unit_id: '1',
    unit_name: 'Strip',
    rack_location: 'A2-05',
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
    synced: true
  },
  {
    id: '3',
    name: 'Omeprazole 20mg',
    generic_name: 'Omeprazole',
    manufacturer: "Dr. Reddy's",
    category_id: '3',
    category_name: 'Antacids',
    unit_id: '1',
    unit_name: 'Strip',
    rack_location: 'B1-03',
    created_at: '2024-01-12',
    updated_at: '2024-01-12',
    synced: true
  },
  {
    id: '4',
    name: 'Cetirizine 10mg',
    generic_name: 'Cetirizine',
    manufacturer: 'Mankind Pharma',
    category_id: '4',
    category_name: 'Antihistamines',
    unit_id: '1',
    unit_name: 'Strip',
    rack_location: 'A1-08',
    created_at: '2024-01-08',
    updated_at: '2024-01-08',
    synced: true
  },
  {
    id: '5',
    name: 'Metformin 500mg',
    generic_name: 'Metformin',
    manufacturer: 'USV Ltd',
    category_id: '5',
    category_name: 'Antidiabetics',
    unit_id: '1',
    unit_name: 'Strip',
    rack_location: 'C2-02',
    created_at: '2024-01-05',
    updated_at: '2024-01-05',
    synced: true
  },
  {
    id: '6',
    name: 'Azithromycin 500mg',
    generic_name: 'Azithromycin',
    manufacturer: 'Zydus Cadila',
    category_id: '2',
    category_name: 'Antibiotics',
    unit_id: '1',
    unit_name: 'Strip',
    rack_location: 'A2-10',
    created_at: '2024-01-20',
    updated_at: '2024-01-20',
    synced: true
  },
  {
    id: '7',
    name: 'Cough Syrup 100ml',
    generic_name: 'Dextromethorphan',
    manufacturer: 'Dabur India',
    category_id: '7',
    category_name: 'Cough & Cold',
    unit_id: '4',
    unit_name: 'Bottle',
    rack_location: 'D1-01',
    created_at: '2024-01-22',
    updated_at: '2024-01-22',
    synced: true
  }
];

// Mock Medicine Batches (Each medicine can have multiple batches with different expiry)
export const mockMedicineBatches: MedicineBatch[] = [
  // Paracetamol - 2 batches with different expiry
  {
    id: 'b1',
    medicine_id: '1',
    medicine_name: 'Paracetamol 500mg',
    batch_number: 'PCM2024001',
    purchase_price: 15.00,
    selling_price: 25.00,
    quantity: 50,
    expiry_date: '2025-03-15', // Expiring sooner - FEFO will pick this first
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    synced: true
  },
  {
    id: 'b2',
    medicine_id: '1',
    medicine_name: 'Paracetamol 500mg',
    batch_number: 'PCM2024002',
    purchase_price: 16.00,
    selling_price: 25.00,
    quantity: 100,
    expiry_date: '2026-06-15', // Expiring later
    created_at: '2024-02-01',
    updated_at: '2024-02-01',
    synced: true
  },
  // Amoxicillin - 1 batch
  {
    id: 'b3',
    medicine_id: '2',
    medicine_name: 'Amoxicillin 500mg',
    batch_number: 'AMX2024002',
    purchase_price: 45.00,
    selling_price: 75.00,
    quantity: 25,
    expiry_date: '2025-03-20',
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
    synced: true
  },
  // Omeprazole
  {
    id: 'b4',
    medicine_id: '3',
    medicine_name: 'Omeprazole 20mg',
    batch_number: 'OMP2024003',
    purchase_price: 35.00,
    selling_price: 55.00,
    quantity: 80,
    expiry_date: '2025-08-10',
    created_at: '2024-01-12',
    updated_at: '2024-01-12',
    synced: true
  },
  // Cetirizine - 2 batches
  {
    id: 'b5',
    medicine_id: '4',
    medicine_name: 'Cetirizine 10mg',
    batch_number: 'CTZ2024004',
    purchase_price: 12.00,
    selling_price: 20.00,
    quantity: 100,
    expiry_date: '2025-06-01', // Earlier expiry
    created_at: '2024-01-08',
    updated_at: '2024-01-08',
    synced: true
  },
  {
    id: 'b6',
    medicine_id: '4',
    medicine_name: 'Cetirizine 10mg',
    batch_number: 'CTZ2024005',
    purchase_price: 12.50,
    selling_price: 20.00,
    quantity: 100,
    expiry_date: '2026-12-01', // Later expiry
    created_at: '2024-02-05',
    updated_at: '2024-02-05',
    synced: true
  },
  // Metformin - Low stock
  {
    id: 'b7',
    medicine_id: '5',
    medicine_name: 'Metformin 500mg',
    batch_number: 'MTF2024005',
    purchase_price: 25.00,
    selling_price: 40.00,
    quantity: 8,
    expiry_date: '2025-02-28',
    created_at: '2024-01-05',
    updated_at: '2024-01-05',
    synced: true
  },
  // Azithromycin
  {
    id: 'b8',
    medicine_id: '6',
    medicine_name: 'Azithromycin 500mg',
    batch_number: 'AZT2024006',
    purchase_price: 85.00,
    selling_price: 120.00,
    quantity: 45,
    expiry_date: '2025-09-15',
    created_at: '2024-01-20',
    updated_at: '2024-01-20',
    synced: true
  },
  // Cough Syrup
  {
    id: 'b9',
    medicine_id: '7',
    medicine_name: 'Cough Syrup 100ml',
    batch_number: 'CGH2024008',
    purchase_price: 45.00,
    selling_price: 75.00,
    quantity: 35,
    expiry_date: '2025-05-10',
    created_at: '2024-01-22',
    updated_at: '2024-01-22',
    synced: true
  }
];

// Mock Stock History
export const mockStockHistory: StockHistory[] = [
  {
    id: 'sh1',
    medicine_id: '1',
    medicine_name: 'Paracetamol 500mg',
    batch_id: 'b1',
    batch_number: 'PCM2024001',
    movement_type: 'purchase',
    quantity: 100,
    reference_id: 'p1',
    reference_number: 'PO2024001',
    notes: 'Initial stock',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00'
  },
  {
    id: 'sh2',
    medicine_id: '1',
    medicine_name: 'Paracetamol 500mg',
    batch_id: 'b1',
    batch_number: 'PCM2024001',
    movement_type: 'sale',
    quantity: -50,
    reference_id: 's1',
    reference_number: 'INV2024001',
    created_by: 'staff1',
    created_at: '2024-01-20T14:30:00'
  },
  {
    id: 'sh3',
    medicine_id: '1',
    medicine_name: 'Paracetamol 500mg',
    batch_id: 'b2',
    batch_number: 'PCM2024002',
    movement_type: 'purchase',
    quantity: 100,
    reference_id: 'p2',
    reference_number: 'PO2024002',
    notes: 'Restock - new batch',
    created_by: 'admin',
    created_at: '2024-02-01T09:00:00'
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    invoice_number: 'INV2024001',
    customer_name: 'Rajesh Kumar',
    customer_phone: '9876543210',
    items: [
      { 
        id: '1', 
        sale_id: '1', 
        medicine_id: '1', 
        medicine_name: 'Paracetamol 500mg', 
        batch_id: 'b1',
        batch_number: 'PCM2024001', 
        expiry_date: '2025-03-15',
        quantity: 2, 
        unit_price: 25, 
        total_price: 50 
      },
      { 
        id: '2', 
        sale_id: '1', 
        medicine_id: '3', 
        medicine_name: 'Omeprazole 20mg', 
        batch_id: 'b4',
        batch_number: 'OMP2024003', 
        expiry_date: '2025-08-10',
        quantity: 1, 
        unit_price: 55, 
        total_price: 55 
      }
    ],
    subtotal: 105,
    discount_type: 'amount',
    discount_value: 5,
    discount_amount: 5,
    tax_enabled: false,
    tax_percentage: 0,
    tax_amount: 0,
    total: 100,
    payment_method: 'cash',
    created_at: '2024-01-25T10:30:00',
    created_by: 'admin',
    synced: true
  },
  {
    id: '2',
    invoice_number: 'INV2024002',
    customer_name: 'Priya Sharma',
    customer_phone: '9876543211',
    items: [
      { 
        id: '3', 
        sale_id: '2', 
        medicine_id: '2', 
        medicine_name: 'Amoxicillin 500mg', 
        batch_id: 'b3',
        batch_number: 'AMX2024002', 
        expiry_date: '2025-03-20',
        quantity: 3, 
        unit_price: 75, 
        total_price: 225 
      }
    ],
    subtotal: 225,
    discount_type: 'percentage',
    discount_value: 0,
    discount_amount: 0,
    tax_enabled: false,
    tax_percentage: 0,
    tax_amount: 0,
    total: 225,
    payment_method: 'upi',
    created_at: '2024-01-25T11:45:00',
    created_by: 'staff1',
    synced: true
  },
  {
    id: '3',
    invoice_number: 'INV2024003',
    customer_name: 'Amit Patel',
    customer_phone: '9876543212',
    items: [
      { 
        id: '4', 
        sale_id: '3', 
        medicine_id: '4', 
        medicine_name: 'Cetirizine 10mg', 
        batch_id: 'b5',
        batch_number: 'CTZ2024004', 
        expiry_date: '2025-06-01',
        quantity: 2, 
        unit_price: 20, 
        total_price: 40 
      },
      { 
        id: '5', 
        sale_id: '3', 
        medicine_id: '7', 
        medicine_name: 'Cough Syrup 100ml', 
        batch_id: 'b9',
        batch_number: 'CGH2024008', 
        expiry_date: '2025-05-10',
        quantity: 1, 
        unit_price: 75, 
        total_price: 75 
      }
    ],
    subtotal: 115,
    discount_type: 'percentage',
    discount_value: 10,
    discount_amount: 11.5,
    tax_enabled: true,
    tax_percentage: 5,
    tax_amount: 5.18,
    total: 108.68,
    payment_method: 'card',
    created_at: '2024-01-25T14:20:00',
    created_by: 'admin',
    synced: true
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Cipla Distributors',
    contact_person: 'Ramesh Gupta',
    phone: '9898989898',
    email: 'ramesh@cipladistr.com',
    address: '123 Pharma Street, Mumbai 400001',
    gst_number: '27AABCT1332L1ZV',
    created_at: '2024-01-01',
    synced: true
  },
  {
    id: '2',
    name: 'Sun Pharma Wholesale',
    contact_person: 'Sunil Mehta',
    phone: '9797979797',
    email: 'sunil@sunwholesale.com',
    address: '456 Medicine Lane, Delhi 110001',
    gst_number: '07AAECS4567M1Z5',
    created_at: '2024-01-02',
    synced: true
  },
  {
    id: '3',
    name: 'Zydus Medical Supplies',
    contact_person: 'Kavita Shah',
    phone: '9696969696',
    email: 'kavita@zydusmed.com',
    address: '789 Health Ave, Ahmedabad 380001',
    gst_number: '24AABCZ7890P1Z3',
    created_at: '2024-01-03',
    synced: true
  }
];

export const mockDashboardStats: DashboardStats = {
  todaySales: 12,
  todayRevenue: 4850,
  totalInventory: 608,
  lowStockItems: 2,
  expiringItems: 3,
  monthlyRevenue: 156750
};

export const salesChartData = [
  { name: 'Mon', sales: 4200 },
  { name: 'Tue', sales: 3800 },
  { name: 'Wed', sales: 5100 },
  { name: 'Thu', sales: 4600 },
  { name: 'Fri', sales: 6200 },
  { name: 'Sat', sales: 7500 },
  { name: 'Sun', sales: 3200 }
];

export const categoryChartData = [
  { name: 'Antibiotics', value: 35 },
  { name: 'Analgesics', value: 25 },
  { name: 'Antacids', value: 15 },
  { name: 'Vitamins', value: 12 },
  { name: 'Others', value: 13 }
];

// Helper function to get total stock for a medicine across all batches
export const getTotalStock = (medicineId: string, batches: MedicineBatch[]): number => {
  return batches
    .filter(b => b.medicine_id === medicineId)
    .reduce((sum, b) => sum + b.quantity, 0);
};

// Helper function to get batches sorted by FEFO (First Expiry First Out)
export const getBatchesByFEFO = (medicineId: string, batches: MedicineBatch[]): MedicineBatch[] => {
  return batches
    .filter(b => b.medicine_id === medicineId && b.quantity > 0)
    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
};
