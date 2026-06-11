import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Clock,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  History,
  Layers,
  AlertCircle,
  Filter,
  CheckCircle
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Medicine } from '../types';
import { useData } from '../context/DataContext';

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
type ExpiryFilter = 'all' | 'expiring-30' | 'expiring-90' | 'expired';

export default function Inventory() {
  const {
    categories,
    units,
    medicines,
    medicineBatches,
    stockHistory,
    createMedicineWithBatch,
    restockMedicine,
  } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateMedicine, setDuplicateMedicine] = useState<Medicine | null>(null);
  const [expandedMedicine, setExpandedMedicine] = useState<string | null>(null);
  const [selectedMedicineForRestock, setSelectedMedicineForRestock] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form states
  const [medicineForm, setMedicineForm] = useState<Partial<Medicine>>({
    name: '',
    generic_name: '',
    manufacturer: '',
    category_id: '',
    unit_id: '',
    rack_location: ''
  });

  const [batchForm, setBatchForm] = useState({
    batch_number: '',
    purchase_price: 0,
    selling_price: 0,
    quantity: 0,
    expiry_date: ''
  });

  // Get medicines with their total stock and batch info
  const medicinesWithStock = useMemo(() => {
    return medicines.map(med => {
      const batches = medicineBatches.filter(b => b.medicine_id === med.id)
        .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
      
      const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
      
      // Find earliest expiry among batches with stock
      const earliestExpiry = batches.find(b => b.quantity > 0)?.expiry_date || null;
      const daysToExpiry = earliestExpiry ? differenceInDays(new Date(earliestExpiry), new Date()) : null;
      
      return {
        ...med,
        totalStock,
        batches,
        earliestExpiry,
        daysToExpiry
      };
    });
  }, [medicineBatches, medicines]);

  // Apply all filters
  const filteredMedicines = useMemo(() => {
    return medicinesWithStock.filter(med => {
      // Search filter
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.generic_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = !filterCategory || med.category_id === filterCategory;
      
      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'in-stock') {
        matchesStock = med.totalStock > 10;
      } else if (stockFilter === 'low-stock') {
        matchesStock = med.totalStock > 0 && med.totalStock <= 10;
      } else if (stockFilter === 'out-of-stock') {
        matchesStock = med.totalStock === 0;
      }
      
      // Expiry filter
      let matchesExpiry = true;
      if (expiryFilter === 'expired') {
        matchesExpiry = med.daysToExpiry !== null && med.daysToExpiry < 0;
      } else if (expiryFilter === 'expiring-30') {
        matchesExpiry = med.daysToExpiry !== null && med.daysToExpiry >= 0 && med.daysToExpiry <= 30;
      } else if (expiryFilter === 'expiring-90') {
        matchesExpiry = med.daysToExpiry !== null && med.daysToExpiry >= 0 && med.daysToExpiry <= 90;
      }
      
      return matchesSearch && matchesCategory && matchesStock && matchesExpiry;
    });
  }, [medicinesWithStock, searchQuery, filterCategory, stockFilter, expiryFilter]);

  // Stats
  const totalProducts = medicines.length;
  const totalBatches = medicineBatches.length;
  const lowStockCount = medicinesWithStock.filter(m => m.totalStock <= 10 && m.totalStock > 0).length;
  const outOfStockCount = medicinesWithStock.filter(m => m.totalStock === 0).length;
  const expiringCount = medicinesWithStock.filter(m => m.daysToExpiry !== null && m.daysToExpiry >= 0 && m.daysToExpiry <= 90).length;
  

  const getExpiryStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { status: 'Expired', color: 'text-red-600 bg-red-50', days };
    if (days <= 30) return { status: `${days}d left`, color: 'text-red-600 bg-red-50', days };
    if (days <= 90) return { status: `${days}d left`, color: 'text-orange-600 bg-orange-50', days };
    return { status: format(new Date(expiryDate), 'MMM yyyy'), color: 'text-gray-600 bg-gray-50', days };
  };

  // Check for duplicate medicine name
  const checkDuplicate = (name: string): Medicine | undefined => {
    return medicines.find(m => 
      m.name.toLowerCase().trim() === name.toLowerCase().trim() && 
      m.id !== editingMedicine?.id
    );
  };

  const handleMedicineNameChange = (name: string) => {
    setMedicineForm({ ...medicineForm, name });
    const duplicate = checkDuplicate(name);
    if (duplicate) {
      setDuplicateMedicine(duplicate);
      setShowDuplicateWarning(true);
    } else {
      setDuplicateMedicine(null);
      setShowDuplicateWarning(false);
    }
  };

  const handleAddMedicine = async () => {
    if (showDuplicateWarning) {
      alert('Please resolve the duplicate medicine name first!');
      return;
    }

    if (!confirm(`Add "${medicineForm.name || 'this medicine'}" with initial stock?`)) {
      return;
    }

    await createMedicineWithBatch({
      medicine: {
        name: medicineForm.name || '',
        generic_name: medicineForm.generic_name || '',
        manufacturer: medicineForm.manufacturer || '',
        category_id: medicineForm.category_id || '',
        unit_id: medicineForm.unit_id || '',
        rack_location: medicineForm.rack_location || '',
      },
      batch: {
        batch_number: batchForm.batch_number,
        purchase_price: batchForm.purchase_price,
        selling_price: batchForm.selling_price,
        quantity: batchForm.quantity,
        expiry_date: batchForm.expiry_date,
      }
    });

    setShowAddMedicineModal(false);
    resetForms();
  };

  const handleMergeWithExisting = () => {
    if (duplicateMedicine) {
      setSelectedMedicineForRestock(duplicateMedicine);
      setShowAddMedicineModal(false);
      setShowRestockModal(true);
      setShowDuplicateWarning(false);
      setDuplicateMedicine(null);
    }
  };

  const handleRestock = async () => {
    if (!selectedMedicineForRestock) return;

    if (!confirm(`Restock "${selectedMedicineForRestock.name}" with ${batchForm.quantity} units?`)) {
      return;
    }

    await restockMedicine({
      medicineId: selectedMedicineForRestock.id,
      medicineName: selectedMedicineForRestock.name,
      batch_number: batchForm.batch_number,
      purchase_price: batchForm.purchase_price,
      selling_price: batchForm.selling_price,
      quantity: batchForm.quantity,
      expiry_date: batchForm.expiry_date,
    });

    setShowRestockModal(false);
    resetForms();
  };

  const resetForms = () => {
    setMedicineForm({
      name: '',
      generic_name: '',
      manufacturer: '',
      category_id: '',
      unit_id: '',
      rack_location: ''
    });
    setBatchForm({
      batch_number: '',
      purchase_price: 0,
      selling_price: 0,
      quantity: 0,
      expiry_date: ''
    });
    setEditingMedicine(null);
    setSelectedMedicineForRestock(null);
  };

  const openRestockModal = (medicine: Medicine) => {
    setSelectedMedicineForRestock(medicine);
    setBatchForm({
      batch_number: '',
      purchase_price: 0,
      selling_price: 0,
      quantity: 0,
      expiry_date: ''
    });
    setShowRestockModal(true);
  };

  const clearFilters = () => {
    setFilterCategory('');
    setStockFilter('all');
    setExpiryFilter('all');
    setSearchQuery('');
  };

  const activeFiltersCount = [
    filterCategory,
    stockFilter !== 'all' ? stockFilter : '',
    expiryFilter !== 'all' ? expiryFilter : ''
  ].filter(Boolean).length;

  const handleExport = () => {
    // Create CSV content
    const headers = ['Medicine Name', 'Generic Name', 'Category', 'Manufacturer', 'Total Stock', 'Unit', 'Earliest Expiry'];
    const rows = filteredMedicines.map(med => [
      med.name,
      med.generic_name,
      med.category_name || '',
      med.manufacturer,
      med.totalStock.toString(),
      med.unit_name || '',
      med.earliestExpiry ? format(new Date(med.earliestExpiry), 'dd/MM/yyyy') : '-'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage medicines and stock with batch tracking</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <History className="w-5 h-5" />
            Stock History
          </button>
          <button
            onClick={() => {
              resetForms();
              setShowAddMedicineModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Stats Cards - Clickable Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => { setStockFilter('all'); setExpiryFilter('all'); }}
          className={`bg-white rounded-xl p-4 border text-left transition-all ${
            stockFilter === 'all' && expiryFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-gray-500">All Medicines</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setStockFilter('all'); setExpiryFilter('all'); }}
          className="bg-white rounded-xl p-4 border border-gray-100 text-left hover:border-gray-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalBatches}</p>
              <p className="text-xs text-gray-500">Total Batches</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setStockFilter('in-stock'); setExpiryFilter('all'); }}
          className={`bg-white rounded-xl p-4 border text-left transition-all ${
            stockFilter === 'in-stock' ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{medicinesWithStock.filter(m => m.totalStock > 10).length}</p>
              <p className="text-xs text-gray-500">In Stock</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setStockFilter('low-stock'); setExpiryFilter('all'); }}
          className={`bg-white rounded-xl p-4 border text-left transition-all ${
            stockFilter === 'low-stock' ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-gray-100 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
              <p className="text-xs text-gray-500">Low Stock</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setStockFilter('out-of-stock'); setExpiryFilter('all'); }}
          className={`bg-white rounded-xl p-4 border text-left transition-all ${
            stockFilter === 'out-of-stock' ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-100 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
              <p className="text-xs text-gray-500">Out of Stock</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setStockFilter('all'); setExpiryFilter('expiring-90'); }}
          className={`bg-white rounded-xl p-4 border text-left transition-all ${
            expiryFilter === 'expiring-90' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-100 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{expiringCount}</p>
              <p className="text-xs text-gray-500">Expiring Soon</p>
            </div>
          </div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or generic name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              activeFiltersCount > 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock (Above 10)</option>
                  <option value="low-stock">Low Stock (1-10)</option>
                  <option value="out-of-stock">Out of Stock (0)</option>
                </select>
              </div>
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Status</label>
                <select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value as ExpiryFilter)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All</option>
                  <option value="expiring-30">Expiring in 30 days</option>
                  <option value="expiring-90">Expiring in 90 days</option>
                  <option value="expired">Already Expired</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {filteredMedicines.length} of {totalProducts} medicines</span>
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="text-emerald-600 hover:text-emerald-700 font-medium">
            Clear filters
          </button>
        )}
      </div>

      {/* Inventory List with Expandable Batches */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-8"></th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batches</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Earliest Expiry</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No medicines found matching your filters
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => (
                  <>
                    <tr 
                      key={med.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedMedicine(expandedMedicine === med.id ? null : med.id)}
                    >
                      <td className="px-6 py-4">
                        {med.batches.length > 0 && (
                          expandedMedicine === med.id 
                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{med.name}</p>
                          <p className="text-sm text-gray-500">{med.generic_name} • {med.manufacturer}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {med.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{med.totalStock}</span>
                          <span className="text-sm text-gray-500">{med.unit_name}</span>
                          {med.totalStock <= 10 && med.totalStock > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Low
                            </span>
                          )}
                          {med.totalStock === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Out
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{med.batches.length} batch(es)</span>
                      </td>
                      <td className="px-6 py-4">
                        {med.earliestExpiry ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getExpiryStatus(med.earliestExpiry).color}`}>
                            {format(new Date(med.earliestExpiry), 'dd MMM yyyy')}
                            {med.daysToExpiry !== null && med.daysToExpiry <= 90 && (
                              <span className="ml-1">({getExpiryStatus(med.earliestExpiry).status})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openRestockModal(med)}
                            className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                          >
                            + Restock
                          </button>
                          <button className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Batches */}
                    {expandedMedicine === med.id && med.batches.length > 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="ml-8">
                            <p className="text-sm font-medium text-gray-700 mb-3">Batch Details (FEFO Order - First Expiry First Out)</p>
                            <div className="grid gap-2">
                              {med.batches.map((batch, index) => {
                                const expiryStatus = getExpiryStatus(batch.expiry_date);
                                return (
                                  <div 
                                    key={batch.id} 
                                    className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
                                      index === 0 ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-6">
                                      {index === 0 && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                                          FEFO Priority
                                        </span>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Batch: {batch.batch_number}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Stock: <span className="font-medium">{batch.quantity}</span></p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          Price: ₹{batch.purchase_price} → ₹{batch.selling_price}
                                        </p>
                                      </div>
                                      <div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${expiryStatus.color}`}>
                                          Exp: {format(new Date(batch.expiry_date), 'dd MMM yyyy')} ({expiryStatus.status})
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Medicine</h2>
                  <p className="text-sm text-gray-500">Medicine name must be unique</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddMedicineModal(false);
                  resetForms();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Duplicate Warning */}
              {showDuplicateWarning && duplicateMedicine && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">Duplicate Medicine Detected!</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        "{duplicateMedicine.name}" already exists in your inventory. 
                        Do you want to add stock to the existing medicine instead?
                      </p>
                      <button
                        onClick={handleMergeWithExisting}
                        className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
                      >
                        Add Stock to Existing Medicine
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Medicine Details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Medicine Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      value={medicineForm.name || ''}
                      onChange={(e) => handleMedicineNameChange(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                        showDuplicateWarning ? 'border-yellow-400' : 'border-gray-200'
                      }`}
                      placeholder="e.g., Paracetamol 500mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                    <input
                      type="text"
                      value={medicineForm.generic_name || ''}
                      onChange={(e) => setMedicineForm({ ...medicineForm, generic_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={medicineForm.manufacturer || ''}
                      onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Cipla Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={medicineForm.category_id || ''}
                      onChange={(e) => setMedicineForm({ ...medicineForm, category_id: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                    <select
                      value={medicineForm.unit_id || ''}
                      onChange={(e) => setMedicineForm({ ...medicineForm, unit_id: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name} ({unit.short_name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rack Location</label>
                    <input
                      type="text"
                      value={medicineForm.rack_location || ''}
                      onChange={(e) => setMedicineForm({ ...medicineForm, rack_location: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., A1-01"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Batch Details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Initial Stock (Batch Details)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                    <input
                      type="text"
                      value={batchForm.batch_number}
                      onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., PCM2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={batchForm.quantity || ''}
                      onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹) *</label>
                    <input
                      type="number"
                      value={batchForm.purchase_price || ''}
                      onChange={(e) => setBatchForm({ ...batchForm, purchase_price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price / MRP (₹) *</label>
                    <input
                      type="number"
                      value={batchForm.selling_price || ''}
                      onChange={(e) => setBatchForm({ ...batchForm, selling_price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      value={batchForm.expiry_date}
                      onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddMedicineModal(false);
                    resetForms();
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMedicine}
                  disabled={showDuplicateWarning}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  Add Medicine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedMedicineForRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Plus className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Restock Medicine</h2>
                  <p className="text-sm text-gray-500">{selectedMedicineForRestock.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRestockModal(false);
                  resetForms();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  Adding a new batch will add stock to the existing medicine. 
                  If the batch number already exists, quantities will be combined.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                <input
                  type="text"
                  value={batchForm.batch_number}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., PCM2024002"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={batchForm.quantity || ''}
                    onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={batchForm.expiry_date}
                    onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={batchForm.purchase_price || ''}
                    onChange={(e) => setBatchForm({ ...batchForm, purchase_price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={batchForm.selling_price || ''}
                    onChange={(e) => setBatchForm({ ...batchForm, selling_price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRestockModal(false);
                    resetForms();
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                >
                  <Save className="w-5 h-5" />
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Stock Movement History</h2>
                  <p className="text-sm text-gray-500">Track all stock in/out movements</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockHistory.map((history) => (
                      <tr key={history.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {format(new Date(history.created_at), 'dd MMM yyyy, hh:mm a')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {history.medicine_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {history.batch_number}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            history.movement_type === 'purchase' ? 'bg-green-100 text-green-700' :
                            history.movement_type === 'sale' ? 'bg-blue-100 text-blue-700' :
                            history.movement_type === 'return' ? 'bg-yellow-100 text-yellow-700' :
                            history.movement_type === 'expired' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {history.movement_type.charAt(0).toUpperCase() + history.movement_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${
                            history.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {history.quantity > 0 ? '+' : ''}{history.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {history.reference_number || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
