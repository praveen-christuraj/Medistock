import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  ShoppingCart,
  X,
  Trash2,
  Check,
  Percent,
  IndianRupee,
  FileText
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { Medicine, MedicineBatch, SaleItem, Sale } from '../types';
import { useData } from '../context/DataContext';

interface CartItem extends SaleItem {
  availableQty: number;
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';
type PaymentFilter = 'all' | 'cash' | 'card' | 'upi' | 'credit';

export default function Sales() {
  const { sales, medicines, medicineBatches, appSettings, createSale } = useData();
  const [showNewSale, setShowNewSale] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'credit'>('cash');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  
  // Discount state
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState(0);
  
  // Get medicines with their available batches (FEFO sorted)
  const medicinesWithBatches = useMemo(() => {
    return medicines.map(med => ({
      ...med,
      batches: medicineBatches
        .filter(batch => batch.medicine_id === med.id && batch.quantity > 0)
        .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()),
      totalStock: medicineBatches
        .filter(b => b.medicine_id === med.id)
        .reduce((sum, b) => sum + b.quantity, 0)
    }));
  }, [medicineBatches, medicines]);

  // Apply filters to sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Search filter
      const matchesSearch = 
        sale.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      // Payment method filter
      const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter;
      
      // Date filter
      let matchesDate = true;
      const saleDate = new Date(sale.created_at);
      const today = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = isWithinInterval(saleDate, {
          start: startOfDay(today),
          end: endOfDay(today)
        });
      } else if (dateFilter === 'yesterday') {
        const yesterday = subDays(today, 1);
        matchesDate = isWithinInterval(saleDate, {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        });
      } else if (dateFilter === 'week') {
        matchesDate = isWithinInterval(saleDate, {
          start: startOfDay(subDays(today, 7)),
          end: endOfDay(today)
        });
      } else if (dateFilter === 'month') {
        matchesDate = isWithinInterval(saleDate, {
          start: startOfDay(subDays(today, 30)),
          end: endOfDay(today)
        });
      } else if (dateFilter === 'custom' && customDateFrom && customDateTo) {
        matchesDate = isWithinInterval(saleDate, {
          start: startOfDay(new Date(customDateFrom)),
          end: endOfDay(new Date(customDateTo))
        });
      }
      
      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [customDateFrom, customDateTo, dateFilter, paymentFilter, sales, searchQuery]);

  // Calculate summary stats
  const filteredStats = useMemo(() => {
    return {
      count: filteredSales.length,
      total: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      avgSale: filteredSales.length > 0 
        ? filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length 
        : 0
    };
  }, [filteredSales]);

  const filteredMedicines = medicinesWithBatches.filter(med =>
    (med.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    med.generic_name.toLowerCase().includes(medicineSearch.toLowerCase())) &&
    med.totalStock > 0
  );

  // FEFO: Add to cart from the batch with earliest expiry
  const addToCart = (medicine: Medicine & { batches: MedicineBatch[], totalStock: number }) => {
    if (medicine.batches.length === 0) {
      alert('No stock available for this medicine!');
      return;
    }

    const fefoBatch = medicine.batches[0];
    const existingItem = selectedItems.find(
      item => item.medicine_id === medicine.id && item.batch_id === fefoBatch.id
    );

    if (existingItem) {
      if (existingItem.quantity >= fefoBatch.quantity) {
        const nextBatchIndex = medicine.batches.findIndex(b => b.id === fefoBatch.id) + 1;
        if (nextBatchIndex < medicine.batches.length) {
          const nextBatch = medicine.batches[nextBatchIndex];
          const newItem: CartItem = {
            id: Date.now().toString(),
            sale_id: '',
            medicine_id: medicine.id,
            medicine_name: medicine.name,
            batch_id: nextBatch.id,
            batch_number: nextBatch.batch_number,
            expiry_date: nextBatch.expiry_date,
            quantity: 1,
            unit_price: nextBatch.selling_price,
            total_price: nextBatch.selling_price,
            availableQty: nextBatch.quantity
          };
          setSelectedItems([...selectedItems, newItem]);
        } else {
          alert('No more stock available!');
        }
        return;
      }
      
      setSelectedItems(items =>
        items.map(item =>
          item.id === existingItem.id
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                total_price: (item.quantity + 1) * item.unit_price 
              }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        sale_id: '',
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        batch_id: fefoBatch.id,
        batch_number: fefoBatch.batch_number,
        expiry_date: fefoBatch.expiry_date,
        quantity: 1,
        unit_price: fefoBatch.selling_price,
        total_price: fefoBatch.selling_price,
        availableQty: fefoBatch.quantity
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    setMedicineSearch('');
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = selectedItems.find(i => i.id === id);
    if (!item) return;
    
    if (quantity < 1) return;
    if (quantity > item.availableQty) {
      alert(`Only ${item.availableQty} units available in this batch!`);
      return;
    }
    
    setSelectedItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity, total_price: quantity * item.unit_price }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setSelectedItems(items => items.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = selectedItems.reduce((sum, item) => sum + item.total_price, 0);
  
  const discountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }, [discountType, discountValue, subtotal]);

  const afterDiscount = subtotal - discountAmount;
  
  const taxAmount = useMemo(() => {
    if (appSettings.tax_enabled) {
      return (afterDiscount * appSettings.tax_percentage) / 100;
    }
    return 0;
  }, [afterDiscount, appSettings.tax_enabled, appSettings.tax_percentage]);

  const total = afterDiscount + taxAmount;

  const handleCreateSale = async () => {
    if (!confirm(`Create this sale for ₹${total.toFixed(2)}?`)) {
      return;
    }

    await createSale({
      customer_name: customerName,
      customer_phone: customerPhone,
      items: selectedItems,
      subtotal,
      discount_type: discountType,
      discount_value: discountValue,
      discount_amount: discountAmount,
      tax_enabled: appSettings.tax_enabled,
      tax_percentage: appSettings.tax_percentage,
      tax_amount: taxAmount,
      total,
      payment_method: paymentMethod
    });
    
    setShowNewSale(false);
    setSelectedItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountValue(0);
    setDiscountType('amount');
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  const handlePrintInvoice = (sale: Sale) => {
    // Create print content
    const printContent = `
      <html>
        <head>
          <title>Invoice ${sale.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .shop-name { font-size: 20px; font-weight: bold; }
            .invoice-no { font-size: 14px; margin-top: 10px; }
            .customer { margin: 10px 0; padding: 10px 0; border-bottom: 1px dashed #ccc; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { text-align: left; padding: 5px; font-size: 12px; }
            th { border-bottom: 1px solid #000; }
            .totals { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
            .total-row { display: flex; justify-content: space-between; padding: 3px 0; }
            .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">MedStock Pharmacy</div>
            <div style="font-size: 12px;">123 Health Street, Medical Complex</div>
            <div class="invoice-no">Invoice: ${sale.invoice_number}</div>
            <div style="font-size: 12px;">${format(new Date(sale.created_at), 'dd MMM yyyy, hh:mm a')}</div>
          </div>
          <div class="customer">
            <strong>Customer:</strong> ${sale.customer_name || 'Walk-in Customer'}<br>
            ${sale.customer_phone ? `<strong>Phone:</strong> ${sale.customer_phone}` : ''}
          </div>
          <table>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            ${sale.items.map(item => `
              <tr>
                <td>${item.medicine_name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unit_price.toFixed(2)}</td>
                <td>₹${item.total_price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <div class="totals">
            <div class="total-row"><span>Subtotal:</span><span>₹${sale.subtotal.toFixed(2)}</span></div>
            ${sale.discount_amount > 0 ? `<div class="total-row"><span>Discount:</span><span>-₹${sale.discount_amount.toFixed(2)}</span></div>` : ''}
            ${sale.tax_enabled ? `<div class="total-row"><span>${sale.tax_percentage}% Tax:</span><span>+₹${sale.tax_amount.toFixed(2)}</span></div>` : ''}
            <div class="total-row grand-total"><span>Total:</span><span>₹${sale.total.toFixed(2)}</span></div>
            <div class="total-row"><span>Payment:</span><span>${sale.payment_method.toUpperCase()}</span></div>
          </div>
          <div class="footer">
            Thank you for your purchase!<br>
            Get well soon!
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExportSales = () => {
    const headers = ['Invoice', 'Date', 'Customer', 'Phone', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment'];
    const rows = filteredSales.map(sale => [
      sale.invoice_number,
      format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
      sale.customer_name || 'Walk-in',
      sale.customer_phone || '-',
      sale.items.length.toString(),
      sale.subtotal.toFixed(2),
      sale.discount_amount.toFixed(2),
      sale.tax_amount.toFixed(2),
      sale.total.toFixed(2),
      sale.payment_method.toUpperCase()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setDateFilter('all');
    setPaymentFilter('all');
    setSearchQuery('');
    setCustomDateFrom('');
    setCustomDateTo('');
  };

  const activeFiltersCount = [
    dateFilter !== 'all' ? dateFilter : '',
    paymentFilter !== 'all' ? paymentFilter : ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-500">Manage your daily sales and invoices</p>
        </div>
        <button
          onClick={() => setShowNewSale(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Sale
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Filtered Sales</p>
          <p className="text-2xl font-bold text-gray-900">{filteredStats.count}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">₹{filteredStats.total.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Average Sale</p>
          <p className="text-2xl font-bold text-gray-900">₹{filteredStats.avgSale.toFixed(2)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice or customer..."
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
            onClick={handleExportSales}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              {dateFilter === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
              
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="credit">Credit</option>
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

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subtotal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tax</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No sales found matching your filters
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-emerald-600">{sale.invoice_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{sale.customer_name || 'Walk-in'}</p>
                        {sale.customer_phone && (
                          <p className="text-sm text-gray-500">{sale.customer_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {sale.items.length} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ₹{sale.subtotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sale.discount_amount > 0 ? (
                        <span className="text-orange-600">
                          -₹{sale.discount_amount.toFixed(2)}
                          {sale.discount_type === 'percentage' && ` (${sale.discount_value}%)`}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sale.tax_enabled && sale.tax_amount > 0 ? (
                        <span className="text-blue-600">
                          +₹{sale.tax_amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">₹{sale.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                        sale.payment_method === 'upi' ? 'bg-blue-100 text-blue-800' :
                        sale.payment_method === 'card' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(sale.created_at), 'dd MMM, hh:mm a')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewSale(sale)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePrintInvoice(sale)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Sale Modal */}
      {showViewModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Invoice {selectedSale.invoice_number}</h2>
                  <p className="text-sm text-gray-500">{format(new Date(selectedSale.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintInvoice(selectedSale)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2">Customer Details</h3>
                <p className="text-gray-600">Name: {selectedSale.customer_name || 'Walk-in Customer'}</p>
                {selectedSale.customer_phone && (
                  <p className="text-gray-600">Phone: {selectedSale.customer_phone}</p>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Batch</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedSale.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.medicine_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.batch_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">₹{item.unit_price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{item.total_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedSale.discount_amount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Discount {selectedSale.discount_type === 'percentage' && `(${selectedSale.discount_value}%)`}</span>
                      <span>-₹{selectedSale.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedSale.tax_enabled && selectedSale.tax_amount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Tax ({selectedSale.tax_percentage}%)</span>
                      <span>+₹{selectedSale.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-emerald-200 font-semibold text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-emerald-700">₹{selectedSale.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pt-2">
                    <span>Payment Method</span>
                    <span className="font-medium">{selectedSale.payment_method.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showNewSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Sale</h2>
                  <p className="text-sm text-gray-500">FEFO: First Expiry First Out - Auto selecting earliest expiry batch</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewSale(false);
                  setSelectedItems([]);
                  setDiscountValue(0);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Left - Product Search */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medicine by name or generic..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {medicineSearch && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                    {filteredMedicines.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No medicines found</div>
                    ) : (
                      filteredMedicines.map((med) => (
                        <button
                          key={med.id}
                          onClick={() => addToCart(med)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-500">
                              Stock: {med.totalStock} | 
                              Next Expiry: {med.batches[0] ? format(new Date(med.batches[0].expiry_date), 'MMM yyyy') : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-emerald-600">
                              ₹{med.batches[0]?.selling_price || 0}
                            </span>
                            <p className="text-xs text-gray-500">
                              Batch: {med.batches[0]?.batch_number}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Selected Items */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Cart Items ({selectedItems.length})</h3>
                  {selectedItems.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No items added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.medicine_name}</p>
                            <p className="text-xs text-gray-500">
                              Batch: {item.batch_number} | Exp: {format(new Date(item.expiry_date), 'MMM yyyy')}
                            </p>
                            <p className="text-sm text-gray-600">₹{item.unit_price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold text-gray-900 w-20 text-right">
                            ₹{item.total_price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Customer & Payment */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Customer Details</h3>
                  <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['cash', 'upi', 'card', 'credit'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                          paymentMethod === method
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {method.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount Section */}
                <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Discount</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDiscountType('amount')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        discountType === 'amount'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      <IndianRupee className="w-4 h-4" />
                      Amount
                    </button>
                    <button
                      onClick={() => setDiscountType('percentage')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        discountType === 'percentage'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      Percentage
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={discountType === 'amount' ? '₹0.00' : '0%'}
                      min="0"
                      max={discountType === 'percentage' ? 100 : undefined}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {discountType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-emerald-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>
                        Discount {discountType === 'percentage' && `(${discountValue}%)`}
                      </span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {appSettings.tax_enabled && (
                    <div className="flex justify-between text-blue-600">
                      <span>{appSettings.tax_name} ({appSettings.tax_percentage}%)</span>
                      <span>+₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {!appSettings.tax_enabled && (
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Tax</span>
                      <span>Disabled</span>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-emerald-200 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-700">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => void handleCreateSale()}
                  disabled={selectedItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
