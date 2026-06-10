import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { defaultAppSettings } from '../data/mockData';
import { supabase } from '../lib/supabase';
import type {
  AppSettings,
  Category,
  Medicine,
  MedicineBatch,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  StockHistory,
  Supplier,
  Unit,
} from '../types';
import { useAuth } from './AuthContext';

interface AppSettingsRecord extends AppSettings {
  id: string;
}

interface InventoryCreateInput {
  medicine: {
    name: string;
    generic_name: string;
    manufacturer: string;
    category_id: string;
    unit_id: string;
    rack_location?: string;
  };
  batch: {
    batch_number: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    expiry_date: string;
  };
}

interface RestockInput {
  medicineId: string;
  medicineName: string;
  batch_number: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  expiry_date: string;
}

interface SupplierInput {
  id?: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  gst_number?: string;
}

interface SaleCreateInput {
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_type: 'amount' | 'percentage';
  discount_value: number;
  discount_amount: number;
  tax_enabled: boolean;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'upi' | 'credit';
  items: Array<{
    medicine_id: string;
    medicine_name: string;
    batch_id: string;
    batch_number: string;
    expiry_date: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface PurchaseCreateInput {
  supplier_id: string;
  invoice_number: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_status: 'paid' | 'pending' | 'partial';
  items: Array<{
    medicine_id: string;
    medicine_name: string;
    batch_number: string;
    quantity: number;
    purchase_price: number;
    selling_price: number;
    total_price: number;
    expiry_date: string;
  }>;
}

interface DataContextType {
  loading: boolean;
  reloading: boolean;
  lastSyncAt: string | null;
  categories: Category[];
  units: Unit[];
  appSettings: AppSettings;
  medicines: Medicine[];
  medicineBatches: MedicineBatch[];
  stockHistory: StockHistory[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  refreshData: () => Promise<void>;
  saveAppSettings: (settings: AppSettings) => Promise<void>;
  saveCategory: (category: { id?: string; name: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveUnit: (unit: { id?: string; name: string; short_name: string }) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  saveSupplier: (supplier: SupplierInput) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  createMedicineWithBatch: (input: InventoryCreateInput) => Promise<void>;
  restockMedicine: (input: RestockInput) => Promise<void>;
  createSale: (input: SaleCreateInput) => Promise<void>;
  createPurchase: (input: PurchaseCreateInput) => Promise<void>;
  updateProfile: (profile: { name: string; phone?: string }) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function generateReference(prefix: string) {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  return `${prefix}${stamp}`;
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function buildSales(
  salesRows: any[] | null,
  saleItemsRows: any[] | null
): Sale[] {
  const itemsBySaleId = new Map<string, SaleItem[]>();

  (saleItemsRows ?? []).forEach((item) => {
    const mappedItem: SaleItem = {
      id: item.id,
      sale_id: item.sale_id,
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name,
      batch_id: item.batch_id,
      batch_number: item.batch_number,
      expiry_date: item.expiry_date,
      quantity: toNumber(item.quantity),
      unit_price: toNumber(item.unit_price),
      total_price: toNumber(item.total_price),
    };

    const group = itemsBySaleId.get(item.sale_id) ?? [];
    group.push(mappedItem);
    itemsBySaleId.set(item.sale_id, group);
  });

  return (salesRows ?? []).map((sale) => ({
    id: sale.id,
    invoice_number: sale.invoice_number,
    customer_name: sale.customer_name ?? undefined,
    customer_phone: sale.customer_phone ?? undefined,
    items: itemsBySaleId.get(sale.id) ?? [],
    subtotal: toNumber(sale.subtotal),
    discount_type: sale.discount_type,
    discount_value: toNumber(sale.discount_value),
    discount_amount: toNumber(sale.discount_amount),
    tax_enabled: Boolean(sale.tax_enabled),
    tax_percentage: toNumber(sale.tax_percentage),
    tax_amount: toNumber(sale.tax_amount),
    total: toNumber(sale.total),
    payment_method: sale.payment_method,
    created_at: sale.created_at,
    created_by: sale.created_by ?? '',
    synced: true,
  }));
}

function buildPurchases(
  purchaseRows: any[] | null,
  purchaseItemsRows: any[] | null,
  suppliers: Supplier[]
): Purchase[] {
  const itemsByPurchaseId = new Map<string, PurchaseItem[]>();
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  (purchaseItemsRows ?? []).forEach((item) => {
    const mappedItem: PurchaseItem = {
      id: item.id,
      purchase_id: item.purchase_id,
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name,
      batch_number: item.batch_number,
      quantity: toNumber(item.quantity),
      unit_price: toNumber(item.purchase_price),
      selling_price: toNumber(item.selling_price),
      total_price: toNumber(item.total_price),
      expiry_date: item.expiry_date,
    };

    const group = itemsByPurchaseId.get(item.purchase_id) ?? [];
    group.push(mappedItem);
    itemsByPurchaseId.set(item.purchase_id, group);
  });

  return (purchaseRows ?? []).map((purchase) => ({
    id: purchase.id,
    supplier_id: purchase.supplier_id,
    supplier_name: supplierById.get(purchase.supplier_id)?.name ?? 'Unknown Supplier',
    invoice_number: purchase.invoice_number,
    items: itemsByPurchaseId.get(purchase.id) ?? [],
    subtotal: toNumber(purchase.subtotal),
    tax: toNumber(purchase.tax),
    total: toNumber(purchase.total),
    payment_status: purchase.payment_status,
    created_at: purchase.created_at,
    synced: true,
  }));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [appSettingsRecord, setAppSettingsRecord] = useState<AppSettingsRecord | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineBatches, setMedicineBatches] = useState<MedicineBatch[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) {
      setCategories([]);
      setUnits([]);
      setMedicines([]);
      setMedicineBatches([]);
      setStockHistory([]);
      setSuppliers([]);
      setSales([]);
      setPurchases([]);
      setAppSettingsRecord(null);
      setLastSyncAt(null);
      setLoading(false);
      return;
    }

    setReloading(true);

    try {
      const [
        categoriesResult,
        unitsResult,
        appSettingsResult,
        medicinesResult,
        batchesResult,
        stockHistoryResult,
        suppliersResult,
        salesResult,
        saleItemsResult,
        purchasesResult,
        purchaseItemsResult,
      ] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('units').select('*').order('name'),
        supabase.from('app_settings').select('*').limit(1).maybeSingle(),
        supabase.from('medicines').select('*').order('name'),
        supabase.from('medicine_batches').select('*').order('expiry_date'),
        supabase.from('stock_history').select('*').order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('sale_items').select('*'),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('purchase_items').select('*'),
      ]);

      assertNoError(categoriesResult.error);
      assertNoError(unitsResult.error);
      assertNoError(appSettingsResult.error);
      assertNoError(medicinesResult.error);
      assertNoError(batchesResult.error);
      assertNoError(stockHistoryResult.error);
      assertNoError(suppliersResult.error);
      assertNoError(salesResult.error);
      assertNoError(saleItemsResult.error);
      assertNoError(purchasesResult.error);
      assertNoError(purchaseItemsResult.error);

      const loadedCategories: Category[] = (categoriesResult.data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description ?? undefined,
        created_at: category.created_at,
      }));

      const loadedUnits: Unit[] = (unitsResult.data ?? []).map((unit) => ({
        id: unit.id,
        name: unit.name,
        short_name: unit.short_name,
        created_at: unit.created_at,
      }));

      const categoryById = new Map(loadedCategories.map((category) => [category.id, category]));
      const unitById = new Map(loadedUnits.map((unit) => [unit.id, unit]));

      const loadedMedicines: Medicine[] = (medicinesResult.data ?? []).map((medicine) => ({
        id: medicine.id,
        name: medicine.name,
        generic_name: medicine.generic_name ?? '',
        manufacturer: medicine.manufacturer ?? '',
        category_id: medicine.category_id ?? '',
        category_name: categoryById.get(medicine.category_id)?.name,
        unit_id: medicine.unit_id ?? '',
        unit_name: unitById.get(medicine.unit_id)?.name,
        rack_location: medicine.rack_location ?? undefined,
        hsn_code: medicine.hsn_code ?? undefined,
        created_at: medicine.created_at,
        updated_at: medicine.updated_at,
        synced: true,
      }));

      const medicineById = new Map(loadedMedicines.map((medicine) => [medicine.id, medicine]));

      const loadedBatches: MedicineBatch[] = (batchesResult.data ?? []).map((batch) => ({
        id: batch.id,
        medicine_id: batch.medicine_id,
        medicine_name: medicineById.get(batch.medicine_id)?.name,
        batch_number: batch.batch_number,
        purchase_price: toNumber(batch.purchase_price),
        selling_price: toNumber(batch.selling_price),
        quantity: toNumber(batch.quantity),
        expiry_date: batch.expiry_date,
        purchase_id: batch.purchase_id ?? undefined,
        created_at: batch.created_at,
        updated_at: batch.updated_at,
        synced: true,
      }));

      const loadedSuppliers: Supplier[] = (suppliersResult.data ?? []).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        contact_person: supplier.contact_person ?? '',
        phone: supplier.phone,
        email: supplier.email ?? undefined,
        address: supplier.address ?? '',
        gst_number: supplier.gst_number ?? undefined,
        created_at: supplier.created_at,
        synced: true,
      }));

      const loadedStockHistory: StockHistory[] = (stockHistoryResult.data ?? []).map((entry) => ({
        id: entry.id,
        medicine_id: entry.medicine_id,
        medicine_name: entry.medicine_name,
        batch_id: entry.batch_id,
        batch_number: entry.batch_number,
        movement_type: entry.movement_type,
        quantity: toNumber(entry.quantity),
        reference_id: entry.reference_id ?? undefined,
        reference_number: entry.reference_number ?? undefined,
        notes: entry.notes ?? undefined,
        created_by: entry.created_by ?? '',
        created_at: entry.created_at,
      }));

      setCategories(loadedCategories);
      setUnits(loadedUnits);
      setMedicines(loadedMedicines);
      setMedicineBatches(loadedBatches);
      setStockHistory(loadedStockHistory);
      setSuppliers(loadedSuppliers);
      setSales(buildSales(salesResult.data, saleItemsResult.data));
      setPurchases(buildPurchases(purchasesResult.data, purchaseItemsResult.data, loadedSuppliers));
      setLastSyncAt(new Date().toISOString());

      if (appSettingsResult.data) {
        setAppSettingsRecord({
          id: appSettingsResult.data.id,
          shop_name: appSettingsResult.data.shop_name,
          shop_address: appSettingsResult.data.shop_address ?? '',
          drug_license: appSettingsResult.data.drug_license ?? '',
          gst_number: appSettingsResult.data.gst_number ?? '',
          tax_enabled: Boolean(appSettingsResult.data.tax_enabled),
          tax_percentage: toNumber(appSettingsResult.data.tax_percentage),
          tax_name: appSettingsResult.data.tax_name ?? 'GST',
          low_stock_threshold: toNumber(appSettingsResult.data.low_stock_threshold),
          expiry_alert_days: toNumber(appSettingsResult.data.expiry_alert_days),
        });
      } else {
        setAppSettingsRecord({
          id: '',
          ...defaultAppSettings,
        });
      }
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const saveAppSettings = useCallback(
    async (settings: AppSettings) => {
      if (!appSettingsRecord?.id) {
        const { data, error } = await supabase
          .from('app_settings')
          .insert(settings)
          .select('*')
          .single();

        assertNoError(error);
        setAppSettingsRecord({
          id: data.id,
          ...settings,
        });
        return;
      }

      const { error } = await supabase
        .from('app_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', appSettingsRecord.id);

      assertNoError(error);
      setAppSettingsRecord({
        id: appSettingsRecord.id,
        ...settings,
      });
    },
    [appSettingsRecord]
  );

  const saveCategory = useCallback(async (category: { id?: string; name: string; description?: string }) => {
    if (category.id) {
      const { error } = await supabase
        .from('categories')
        .update({ name: category.name, description: category.description ?? null })
        .eq('id', category.id);
      assertNoError(error);
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ name: category.name, description: category.description ?? null });
      assertNoError(error);
    }

    await loadAllData();
  }, [loadAllData]);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    assertNoError(error);
    await loadAllData();
  }, [loadAllData]);

  const saveUnit = useCallback(async (unit: { id?: string; name: string; short_name: string }) => {
    if (unit.id) {
      const { error } = await supabase
        .from('units')
        .update({ name: unit.name, short_name: unit.short_name })
        .eq('id', unit.id);
      assertNoError(error);
    } else {
      const { error } = await supabase
        .from('units')
        .insert({ name: unit.name, short_name: unit.short_name });
      assertNoError(error);
    }

    await loadAllData();
  }, [loadAllData]);

  const deleteUnit = useCallback(async (id: string) => {
    const { error } = await supabase.from('units').delete().eq('id', id);
    assertNoError(error);
    await loadAllData();
  }, [loadAllData]);

  const saveSupplier = useCallback(async (supplier: SupplierInput) => {
    const payload = {
      name: supplier.name,
      contact_person: supplier.contact_person || null,
      phone: supplier.phone,
      email: supplier.email || null,
      address: supplier.address || null,
      gst_number: supplier.gst_number || null,
      updated_at: new Date().toISOString(),
    };

    if (supplier.id) {
      const { error } = await supabase.from('suppliers').update(payload).eq('id', supplier.id);
      assertNoError(error);
    } else {
      const { error } = await supabase.from('suppliers').insert(payload);
      assertNoError(error);
    }

    await loadAllData();
  }, [loadAllData]);

  const deleteSupplier = useCallback(async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    assertNoError(error);
    await loadAllData();
  }, [loadAllData]);

  const createMedicineWithBatch = useCallback(async (input: InventoryCreateInput) => {
    const { data: medicineRow, error: medicineError } = await supabase
      .from('medicines')
      .insert({
        name: input.medicine.name,
        generic_name: input.medicine.generic_name || null,
        manufacturer: input.medicine.manufacturer || null,
        category_id: input.medicine.category_id || null,
        unit_id: input.medicine.unit_id || null,
        rack_location: input.medicine.rack_location || null,
      })
      .select('*')
      .single();

    assertNoError(medicineError);

    const { data: batchRow, error: batchError } = await supabase
      .from('medicine_batches')
      .insert({
        medicine_id: medicineRow.id,
        batch_number: input.batch.batch_number,
        purchase_price: input.batch.purchase_price,
        selling_price: input.batch.selling_price,
        quantity: input.batch.quantity,
        expiry_date: input.batch.expiry_date,
      })
      .select('*')
      .single();

    assertNoError(batchError);

    if (input.batch.quantity > 0) {
      const { error: historyError } = await supabase.from('stock_history').insert({
        medicine_id: medicineRow.id,
        medicine_name: medicineRow.name,
        batch_id: batchRow.id,
        batch_number: batchRow.batch_number,
        movement_type: 'purchase',
        quantity: input.batch.quantity,
        reference_number: 'INITIAL-STOCK',
        notes: 'Initial stock entry from inventory module',
        created_by: user?.id ?? 'system',
      });

      assertNoError(historyError);
    }

    await loadAllData();
  }, [loadAllData, user?.id]);

  const restockMedicine = useCallback(async (input: RestockInput) => {
    const { data: existingBatch, error: batchLookupError } = await supabase
      .from('medicine_batches')
      .select('*')
      .eq('medicine_id', input.medicineId)
      .eq('batch_number', input.batch_number)
      .maybeSingle();

    assertNoError(batchLookupError);

    let batchId = existingBatch?.id;

    if (existingBatch) {
      const { error: updateError } = await supabase
        .from('medicine_batches')
        .update({
          quantity: toNumber(existingBatch.quantity) + input.quantity,
          purchase_price: input.purchase_price,
          selling_price: input.selling_price,
          expiry_date: input.expiry_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingBatch.id);

      assertNoError(updateError);
    } else {
      const { data: insertedBatch, error: insertError } = await supabase
        .from('medicine_batches')
        .insert({
          medicine_id: input.medicineId,
          batch_number: input.batch_number,
          purchase_price: input.purchase_price,
          selling_price: input.selling_price,
          quantity: input.quantity,
          expiry_date: input.expiry_date,
        })
        .select('*')
        .single();

      assertNoError(insertError);
      batchId = insertedBatch.id;
    }

    const { error: historyError } = await supabase.from('stock_history').insert({
      medicine_id: input.medicineId,
      medicine_name: input.medicineName,
      batch_id: batchId,
      batch_number: input.batch_number,
      movement_type: 'purchase',
      quantity: input.quantity,
      reference_number: 'RESTOCK',
      notes: 'Restocked from inventory module',
      created_by: user?.id ?? 'system',
    });

    assertNoError(historyError);
    await loadAllData();
  }, [loadAllData, user?.id]);

  const createSale = useCallback(async (input: SaleCreateInput) => {
    const invoiceNumber = generateReference('INV');

    const { data: saleRow, error: saleError } = await supabase
      .from('sales')
      .insert({
        invoice_number: invoiceNumber,
        customer_name: input.customer_name || null,
        customer_phone: input.customer_phone || null,
        subtotal: input.subtotal,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        discount_amount: input.discount_amount,
        tax_enabled: input.tax_enabled,
        tax_percentage: input.tax_percentage,
        tax_amount: input.tax_amount,
        total: input.total,
        payment_method: input.payment_method,
        created_by: user?.id ?? null,
        synced_from: 'web',
      })
      .select('*')
      .single();

    assertNoError(saleError);

    const { error: itemError } = await supabase.from('sale_items').insert(
      input.items.map((item) => ({
        sale_id: saleRow.id,
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        batch_id: item.batch_id,
        batch_number: item.batch_number,
        expiry_date: item.expiry_date,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))
    );

    assertNoError(itemError);
    await loadAllData();
  }, [loadAllData, user?.id]);

  const createPurchase = useCallback(async (input: PurchaseCreateInput) => {
    const { data: purchaseRow, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        supplier_id: input.supplier_id,
        invoice_number: input.invoice_number || generateReference('PO'),
        subtotal: input.subtotal,
        tax: input.tax,
        total: input.total,
        payment_status: input.payment_status,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    assertNoError(purchaseError);

    const { error: itemsError } = await supabase.from('purchase_items').insert(
      input.items.map((item) => ({
        purchase_id: purchaseRow.id,
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        batch_number: item.batch_number,
        quantity: item.quantity,
        purchase_price: item.purchase_price,
        selling_price: item.selling_price,
        total_price: item.total_price,
        expiry_date: item.expiry_date,
      }))
    );

    assertNoError(itemsError);
    await loadAllData();
  }, [loadAllData, user?.id]);

  const updateProfile = useCallback(async (profile: { name: string; phone?: string }) => {
    if (!user?.id) {
      throw new Error('No authenticated user found.');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        phone: profile.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    assertNoError(error);
  }, [user?.id]);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    assertNoError(error);
  }, []);

  const value = useMemo<DataContextType>(() => ({
    loading,
    reloading,
    lastSyncAt,
    categories,
    units,
    appSettings: appSettingsRecord
      ? {
          shop_name: appSettingsRecord.shop_name,
          shop_address: appSettingsRecord.shop_address,
          drug_license: appSettingsRecord.drug_license,
          gst_number: appSettingsRecord.gst_number,
          tax_enabled: appSettingsRecord.tax_enabled,
          tax_percentage: appSettingsRecord.tax_percentage,
          tax_name: appSettingsRecord.tax_name,
          low_stock_threshold: appSettingsRecord.low_stock_threshold,
          expiry_alert_days: appSettingsRecord.expiry_alert_days,
        }
      : defaultAppSettings,
    medicines,
    medicineBatches,
    stockHistory,
    suppliers,
    sales,
    purchases,
    refreshData,
    saveAppSettings,
    saveCategory,
    deleteCategory,
    saveUnit,
    deleteUnit,
    saveSupplier,
    deleteSupplier,
    createMedicineWithBatch,
    restockMedicine,
    createSale,
    createPurchase,
    updateProfile,
    updatePassword,
  }), [
    appSettingsRecord,
    categories,
    createMedicineWithBatch,
    createPurchase,
    createSale,
    deleteCategory,
    deleteSupplier,
    deleteUnit,
    loading,
    lastSyncAt,
    medicineBatches,
    medicines,
    purchases,
    refreshData,
    reloading,
    sales,
    saveAppSettings,
    saveCategory,
    saveSupplier,
    saveUnit,
    stockHistory,
    suppliers,
    units,
    updatePassword,
    updateProfile,
    restockMedicine,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
