import { useState } from 'react';
import {
  FileText,
  Calendar,
  TrendingUp,
  Package,
  ShoppingCart,
  IndianRupee,
  BarChart3,
  FileSpreadsheet,
  Printer,
  Clock,
  AlertTriangle,
  X,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { useAnalytics } from '../context/AnalyticsContext';
import { useData } from '../context/DataContext';
import DateSlicer from '../components/analytics/DateSlicer';
import StatementTable from '../components/analytics/StatementTable';
import KPICard from '../components/analytics/KPICard';
import { differenceInDays } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

type ReportType = 'sales-statement' | 'daily-summary' | 'monthly-summary' | 'inventory' | 'profit-loss' | 'expiry' | 'low-stock' | 'category-wise' | 'payment-wise';

interface ReportConfig {
  id: ReportType;
  name: string;
  description: string;
  icon: typeof FileText;
  color: string;
}

const reportTypes: ReportConfig[] = [
  { id: 'sales-statement', name: 'Sales Statement', description: 'Chronological list like bank statement', icon: FileText, color: 'bg-emerald-500' },
  { id: 'daily-summary', name: 'Daily Summary', description: 'Day-wise breakdown with drill-through', icon: Calendar, color: 'bg-blue-500' },
  { id: 'monthly-summary', name: 'Monthly Summary', description: 'Month-wise with quarter & year drill', icon: Calendar, color: 'bg-indigo-500' },
  { id: 'profit-loss', name: 'Profit & Loss', description: 'Revenue, cost, and profit analysis', icon: TrendingUp, color: 'bg-orange-500' },
  { id: 'inventory', name: 'Inventory Report', description: 'Current stock levels and valuation', icon: Package, color: 'bg-purple-500' },
  { id: 'expiry', name: 'Expiry Report', description: 'Items expiring within selected period', icon: Clock, color: 'bg-red-500' },
  { id: 'low-stock', name: 'Low Stock Report', description: 'Items below reorder level', icon: AlertTriangle, color: 'bg-yellow-500' },
  { id: 'category-wise', name: 'Category Analysis', description: 'Sales breakdown by category', icon: BarChart3, color: 'bg-pink-500' },
  { id: 'payment-wise', name: 'Payment Analysis', description: 'Sales by payment method', icon: IndianRupee, color: 'bg-teal-500' }
];

export default function Reports() {
  const { filters, data, drillDown, drillUp, drillPath, setPeriodType } = useAnalytics();
  const { medicineBatches, medicines } = useData();
  const [selectedReport, setSelectedReport] = useState<ReportType | ''>('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [expiryDays, setExpiryDays] = useState(90);

  // Inventory calculations
  const inventoryData = medicines.map(med => {
    const batches = medicineBatches.filter(b => b.medicine_id === med.id);
    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
    const stockValue = batches.reduce((sum, b) => sum + (b.quantity * b.purchase_price), 0);
    const retailValue = batches.reduce((sum, b) => sum + (b.quantity * b.selling_price), 0);
    return {
      name: med.name,
      category: med.category_name,
      stock: totalStock,
      stockValue: Math.round(stockValue),
      retailValue: Math.round(retailValue),
      potentialProfit: Math.round(retailValue - stockValue)
    };
  });

  const lowStockItems = inventoryData.filter(item => item.stock > 0 && item.stock <= 10);
  const outOfStockItems = inventoryData.filter(item => item.stock === 0);

  const expiringBatches = medicineBatches.filter(batch => {
    const days = differenceInDays(new Date(batch.expiry_date), new Date());
    return days >= 0 && days <= expiryDays;
  }).map(batch => ({
    ...batch,
    daysToExpiry: differenceInDays(new Date(batch.expiry_date), new Date())
  })).sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.stockValue, 0);
  const totalRetailValue = inventoryData.reduce((sum, item) => sum + item.retailValue, 0);

  const handleGenerateReport = (reportId: ReportType) => {
    setSelectedReport(reportId);
    
    // Set appropriate period type for the report
    if (reportId === 'daily-summary' || reportId === 'sales-statement') {
      setPeriodType('day');
    } else if (reportId === 'monthly-summary') {
      setPeriodType('month');
    }
    
    setShowReportModal(true);
  };

  const generateCSV = (dataArray: Record<string, unknown>[], filename: string) => {
    if (dataArray.length === 0) return;
    
    const headers = Object.keys(dataArray[0]);
    const csvContent = [
      headers.join(','),
      ...dataArray.map(row => headers.map(h => {
        const value = row[h];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    let exportData: Record<string, unknown>[] = [];
    let filename = 'report';

    switch (selectedReport) {
      case 'sales-statement':
      case 'daily-summary':
        exportData = data.transactions.map(t => ({
          Date: format(t.date, 'dd/MM/yyyy HH:mm'),
          Invoice: t.invoiceNumber,
          Customer: t.customerName,
          Items: t.itemsCount,
          Subtotal: t.subtotal.toFixed(2),
          Discount: t.discount.toFixed(2),
          Tax: t.tax.toFixed(2),
          Total: t.total.toFixed(2),
          Payment: t.paymentMethod.toUpperCase(),
          Balance: t.runningBalance?.toFixed(2) || ''
        }));
        filename = 'sales_statement';
        break;
      case 'monthly-summary':
        exportData = data.periodSummaries.map(ps => ({
          Period: ps.period,
          Orders: ps.salesCount,
          'Items Sold': ps.itemsSold,
          Revenue: ps.revenue.toFixed(2),
          Profit: ps.profit.toFixed(2),
          Discount: ps.discount.toFixed(2),
          Tax: ps.tax.toFixed(2),
          'Avg Order': ps.avgOrderValue.toFixed(2)
        }));
        filename = 'monthly_summary';
        break;
      case 'inventory':
        exportData = inventoryData.map(d => ({
          Medicine: d.name,
          Category: d.category || '',
          Stock: d.stock,
          'Stock Value': d.stockValue,
          'Retail Value': d.retailValue,
          'Potential Profit': d.potentialProfit
        }));
        filename = 'inventory_report';
        break;
      case 'expiry':
        exportData = expiringBatches.map(d => ({
          Medicine: d.medicine_name || '',
          Batch: d.batch_number,
          Quantity: d.quantity,
          'Expiry Date': format(new Date(d.expiry_date), 'dd/MM/yyyy'),
          'Days Left': d.daysToExpiry
        }));
        filename = 'expiry_report';
        break;
      case 'low-stock':
        exportData = [...outOfStockItems, ...lowStockItems].map(d => ({
          Medicine: d.name,
          Category: d.category || '',
          Stock: d.stock,
          Status: d.stock === 0 ? 'Out of Stock' : 'Low Stock'
        }));
        filename = 'low_stock_report';
        break;
    }

    generateCSV(exportData, filename);
  };

  const getReportContent = () => {
    switch (selectedReport) {
      case 'sales-statement':
        return (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="Total Revenue" value={data.summary.totalRevenue} prefix="₹" />
              <KPICard title="Total Orders" value={data.summary.totalOrders} />
              <KPICard title="Total Discount" value={data.summary.totalDiscount} prefix="₹" />
              <KPICard title="Total Tax" value={data.summary.totalTax} prefix="₹" />
            </div>
            
            {/* Statement Table */}
            <StatementTable
              transactions={data.transactions}
              showRunningBalance={true}
              title="Sales Statement"
              openingBalance={data.summary.openingBalance}
              closingBalance={data.summary.closingBalance}
            />
          </div>
        );

      case 'daily-summary':
        return (
          <div className="space-y-6">
            {/* Drill Path Breadcrumb */}
            {drillPath.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <button onClick={drillUp} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-gray-400">/</span>
                {drillPath.map((p, i) => (
                  <span key={i} className="text-gray-600">{p.label} <ChevronRight className="w-3 h-3 inline" /></span>
                ))}
              </div>
            )}
            
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="Total Revenue" value={data.summary.totalRevenue} prefix="₹" />
              <KPICard title="Total Orders" value={data.summary.totalOrders} />
              <KPICard title="Gross Profit" value={data.summary.totalProfit} prefix="₹" />
              <KPICard title="Profit Margin" value={`${data.summary.profitMargin.toFixed(1)}%`} />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="font-medium text-gray-900 mb-4">Revenue by {filters.periodType === 'day' ? 'Day' : filters.periodType === 'week' ? 'Week' : 'Period'}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Period Summaries with Drill-through */}
            <StatementTable
              periodSummaries={data.periodSummaries}
              showPeriodSummary={true}
              showRunningBalance={false}
              onDrillDown={(summary) => drillDown(summary as any)}
              title={`${filters.periodType === 'day' ? 'Daily' : filters.periodType === 'week' ? 'Weekly' : filters.periodType === 'month' ? 'Monthly' : 'Period'} Summary`}
            />
          </div>
        );

      case 'monthly-summary':
        return (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex gap-2">
              {['day', 'week', 'month', 'quarter', 'year'].map(pt => (
                <button
                  key={pt}
                  onClick={() => setPeriodType(pt as typeof filters.periodType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.periodType === pt
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pt.charAt(0).toUpperCase() + pt.slice(1)}ly
                </button>
              ))}
            </div>

            {/* Drill Path */}
            {drillPath.length > 0 && (
              <div className="flex items-center gap-2 text-sm bg-gray-50 px-4 py-2 rounded-lg">
                <button onClick={drillUp} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                {drillPath.map((p, i) => (
                  <span key={i} className="flex items-center text-gray-600">
                    <ChevronRight className="w-3 h-3 mx-1" />
                    {p.label}
                  </span>
                ))}
              </div>
            )}
            
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KPICard title="Total Revenue" value={data.summary.totalRevenue} prefix="₹" size="sm" />
              <KPICard title="Total Cost" value={data.summary.totalCost} prefix="₹" size="sm" />
              <KPICard title="Gross Profit" value={data.summary.totalProfit} prefix="₹" size="sm" />
              <KPICard title="Total Orders" value={data.summary.totalOrders} size="sm" />
              <KPICard title="Profit Margin" value={`${data.summary.profitMargin.toFixed(1)}%`} size="sm" />
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="font-medium text-gray-900 mb-4">Revenue & Profit Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenueByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Table with Drill */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Period-wise Breakdown (Click to drill down)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Period</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Orders</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Items</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Revenue</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Profit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Discount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Tax</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Avg Order</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.periodSummaries.map((ps) => (
                      <tr key={ps.period} className="hover:bg-gray-50 cursor-pointer" onClick={() => drillDown(ps)}>
                        <td className="px-4 py-3 font-medium text-gray-900">{ps.period}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{ps.salesCount}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{ps.itemsSold}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">₹{ps.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-blue-600">₹{ps.profit.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-orange-600">₹{ps.discount.toFixed(0)}</td>
                        <td className="px-4 py-3 text-right text-purple-600">₹{ps.tax.toFixed(0)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">₹{ps.avgOrderValue.toFixed(0)}</td>
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </td>
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-emerald-50 font-semibold">
                      <td className="px-4 py-3 text-gray-900">TOTAL</td>
                      <td className="px-4 py-3 text-right text-gray-900">{data.summary.totalOrders}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{data.summary.totalItems}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">₹{data.summary.totalRevenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-blue-700">₹{data.summary.totalProfit.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-orange-700">₹{data.summary.totalDiscount.toFixed(0)}</td>
                      <td className="px-4 py-3 text-right text-purple-700">₹{data.summary.totalTax.toFixed(0)}</td>
                      <td className="px-4 py-3 text-right text-gray-900">-</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'profit-loss':
        return (
          <div className="space-y-6">
            {/* P&L Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <p className="text-sm text-emerald-600">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-900">₹{data.summary.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <p className="text-sm text-red-600">Total Cost</p>
                <p className="text-3xl font-bold text-red-900">₹{data.summary.totalCost.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <p className="text-sm text-blue-600">Gross Profit</p>
                <p className="text-3xl font-bold text-blue-900">₹{data.summary.totalProfit.toLocaleString()}</p>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
              <p className="text-emerald-100">Profit Margin</p>
              <p className="text-4xl font-bold">{data.summary.profitMargin.toFixed(1)}%</p>
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="font-medium text-gray-900 mb-4">Profit Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="Total Products" value={medicines.length} icon={Package} />
              <KPICard title="Total Batches" value={medicineBatches.length} />
              <KPICard title="Stock Value" value={totalInventoryValue} prefix="₹" />
              <KPICard title="Retail Value" value={totalRetailValue} prefix="₹" />
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Stock Value</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Retail Value</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Potential Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventoryData.map((item) => (
                      <tr key={item.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 text-right">{item.stock}</td>
                        <td className="px-4 py-3 text-right">₹{item.stockValue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">₹{item.retailValue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹{item.potentialProfit.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'expiry':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Show items expiring within:</label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <KPICard title="Expiring Soon" value={`${expiringBatches.length} batches`} colorClass="bg-orange-50" />
              <KPICard title="Already Expired" value={`${medicineBatches.filter(b => differenceInDays(new Date(b.expiry_date), new Date()) < 0).length} batches`} colorClass="bg-red-50" />
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Batch</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expiringBatches.map((batch) => (
                      <tr key={batch.id} className={batch.daysToExpiry <= 30 ? 'bg-red-50' : batch.daysToExpiry <= 60 ? 'bg-orange-50' : ''}>
                        <td className="px-4 py-3 font-medium text-gray-900">{batch.medicine_name}</td>
                        <td className="px-4 py-3 text-gray-600">{batch.batch_number}</td>
                        <td className="px-4 py-3 text-right">{batch.quantity}</td>
                        <td className="px-4 py-3">{format(new Date(batch.expiry_date), 'dd MMM yyyy')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            batch.daysToExpiry <= 30 ? 'bg-red-100 text-red-700' :
                            batch.daysToExpiry <= 60 ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {batch.daysToExpiry} days left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'low-stock':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <KPICard title="Low Stock Items" value={lowStockItems.length} colorClass="bg-yellow-50" />
              <KPICard title="Out of Stock" value={outOfStockItems.length} colorClass="bg-red-50" />
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Current Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[...outOfStockItems, ...lowStockItems].map((item) => (
                      <tr key={item.name} className={item.stock === 0 ? 'bg-red-50' : 'bg-yellow-50'}>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 text-right">{item.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'category-wise':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="font-medium text-gray-900 mb-4">Category Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={data.salesByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      >
                        {data.salesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Sales</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.salesByCategory.map((item, i) => (
                        <tr key={item.name}>
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">₹{item.value.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment-wise':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="font-medium text-gray-900 mb-4">Payment Method Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={data.salesByPayment}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      >
                        {data.salesByPayment.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                {data.salesByPayment.map((item, i) => (
                  <div key={item.name} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{item.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{item.count} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500 text-center py-8">Select a report type to view</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Generate detailed reports with drill-through capabilities</p>
        </div>
      </div>

      {/* Date Slicer */}
      <DateSlicer />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">₹{data.summary.totalRevenue.toLocaleString()}</p>
          <p className="text-emerald-100 text-sm">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">₹{data.summary.totalProfit.toLocaleString()}</p>
          <p className="text-blue-100 text-sm">Gross Profit</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">₹{(totalInventoryValue / 1000).toFixed(0)}K</p>
          <p className="text-purple-100 text-sm">Inventory Value</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <ShoppingCart className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{data.summary.totalOrders}</p>
          <p className="text-orange-100 text-sm">Total Orders</p>
        </div>
      </div>

      {/* Report Types Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => handleGenerateReport(report.id)}
              className="p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all text-left"
            >
              <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center mb-3`}>
                <report.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
              <p className="text-sm text-gray-500">{report.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {reportTypes.find(r => r.id === selectedReport)?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {format(filters.dateRange.from, 'dd MMM yyyy')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {getReportContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
