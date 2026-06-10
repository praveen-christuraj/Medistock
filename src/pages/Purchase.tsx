import { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Eye,
  TrendingUp,
  Package,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '../context/DataContext';

interface PurchaseItem {
  id: string;
  medicine_id: string;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  total_price: number;
  expiry_date: string;
}

export default function Purchase() {
  const { suppliers, medicines, purchases, createPurchase } = useData();
  const [showNewPurchase, setShowNewPurchase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  const addPurchaseItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      medicine_id: '',
      medicine_name: '',
      batch_number: '',
      quantity: 1,
      purchase_price: 0,
      selling_price: 0,
      total_price: 0,
      expiry_date: ''
    };
    setPurchaseItems([...purchaseItems, newItem]);
  };

  const updatePurchaseItem = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setPurchaseItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'purchase_price') {
            updated.total_price = Number(updated.quantity) * Number(updated.purchase_price);
          }
          if (field === 'medicine_name') {
            const matchedMedicine = medicines.find((medicine) => medicine.name === value);
            updated.medicine_id = matchedMedicine?.id || '';
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removePurchaseItem = (id: string) => {
    setPurchaseItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = purchaseItems.reduce((sum, item) => sum + item.total_price, 0);

  const filteredPurchases = purchases.filter((order) =>
    order.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePurchase = async () => {
    await createPurchase({
      supplier_id: selectedSupplier,
      invoice_number: invoiceNumber,
      subtotal,
      tax: 0,
      total: subtotal,
      payment_status: 'pending',
      items: purchaseItems.map((item) => ({
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        batch_number: item.batch_number,
        quantity: item.quantity,
        purchase_price: item.purchase_price,
        selling_price: item.selling_price,
        total_price: item.total_price,
        expiry_date: item.expiry_date,
      })),
    });

    setShowNewPurchase(false);
    setPurchaseItems([]);
    setSelectedSupplier('');
    setInvoiceNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500">Manage inventory restocking and supplier orders</p>
        </div>
        <button
          onClick={() => setShowNewPurchase(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Purchase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₹50,150</p>
              <p className="text-sm text-gray-500">This Month's Purchases</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">Pending Payments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">16</p>
              <p className="text-sm text-gray-500">Orders This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPurchases.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-emerald-600">{order.invoice_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.supplier_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {order.items.length} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'pending' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(order.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showNewPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Purchase Order</h2>
                  <p className="text-sm text-gray-500">Add items from supplier</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewPurchase(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Supplier & Invoice Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter supplier invoice number"
                  />
                </div>
              </div>

              {/* Purchase Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Purchase Items</h3>
                  <button
                    onClick={addPurchaseItem}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {purchaseItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No items added yet</p>
                    <button
                      onClick={addPurchaseItem}
                      className="mt-2 text-emerald-600 font-medium hover:text-emerald-700"
                    >
                      Click to add items
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchaseItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="col-span-12 sm:col-span-3">
                          <label className="block text-xs text-gray-500 mb-1">Medicine Name</label>
                          <input
                            type="text"
                            value={item.medicine_name}
                            onChange={(e) => updatePurchaseItem(item.id, 'medicine_name', e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                            placeholder="Medicine name"
                            list={`medicines-${index}`}
                          />
                          <datalist id={`medicines-${index}`}>
                            {medicines.map(med => (
                              <option key={med.id} value={med.name} />
                            ))}
                          </datalist>
                        </div>
                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Batch No.</label>
                          <input
                            type="text"
                            value={item.batch_number}
                            onChange={(e) => updatePurchaseItem(item.id, 'batch_number', e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                            placeholder="Batch"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-1">
                          <label className="block text-xs text-gray-500 mb-1">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updatePurchaseItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                            min="1"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Purchase Price</label>
                          <input
                            type="number"
                            value={item.purchase_price}
                            onChange={(e) => updatePurchaseItem(item.id, 'purchase_price', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                            placeholder="₹0.00"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Selling Price</label>
                          <input
                            type="number"
                            value={item.selling_price}
                            onChange={(e) => updatePurchaseItem(item.id, 'selling_price', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                            placeholder="₹0.00"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={item.expiry_date}
                            onChange={(e) => updatePurchaseItem(item.id, 'expiry_date', e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                          />
                        </div>
                        <div className="col-span-10 sm:col-span-1 flex items-end">
                          <p className="font-semibold text-gray-900">₹{item.total_price}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex items-end justify-end">
                          <button
                            onClick={() => removePurchaseItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64 bg-emerald-50 rounded-xl p-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total:</span>
                    <span className="text-emerald-700">₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowNewPurchase(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleCreatePurchase()}
                  disabled={!selectedSupplier || purchaseItems.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  Create Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
