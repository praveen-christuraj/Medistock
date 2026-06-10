import {
  ShoppingCart,
  IndianRupee,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Percent
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { useAnalytics } from '../context/AnalyticsContext';
import { useData } from '../context/DataContext';
import DateSlicer from '../components/analytics/DateSlicer';
import KPICard from '../components/analytics/KPICard';
import { differenceInDays } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { filters, setFilters, data } = useAnalytics();
  const { medicineBatches, categories, appSettings } = useData();
  
  // Calculate inventory alerts
  const lowStockThreshold = appSettings.low_stock_threshold;
  const lowStockBatches = medicineBatches.filter(b => b.quantity <= lowStockThreshold && b.quantity > 0);
  const expiringBatches = medicineBatches.filter(b => {
    const days = differenceInDays(new Date(b.expiry_date), new Date());
    return days >= 0 && days <= appSettings.expiry_alert_days;
  });

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Analytics for {format(filters.dateRange.from, 'dd MMM')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
          </p>
        </div>
        <DateSlicer compact />
      </div>

      {/* Full Date Slicer */}
      <DateSlicer showPeriodSelector={false} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={data.totalRevenue.currentValue}
          previousValue={data.totalRevenue.previousValue}
          changePercent={data.totalRevenue.changePercent}
          trend={data.totalRevenue.trend}
          prefix="₹"
          icon={IndianRupee}
        />
        <KPICard
          title="Total Orders"
          value={data.totalOrders.currentValue}
          previousValue={data.totalOrders.previousValue}
          changePercent={data.totalOrders.changePercent}
          trend={data.totalOrders.trend}
          icon={ShoppingCart}
        />
        <KPICard
          title="Avg Order Value"
          value={data.avgOrderValue.currentValue}
          previousValue={data.avgOrderValue.previousValue}
          changePercent={data.avgOrderValue.changePercent}
          trend={data.avgOrderValue.trend}
          prefix="₹"
          icon={BarChart3}
        />
        <KPICard
          title="Gross Profit"
          value={data.totalProfit.currentValue}
          previousValue={data.totalProfit.previousValue}
          changePercent={data.totalProfit.changePercent}
          trend={data.totalProfit.trend}
          prefix="₹"
          icon={TrendingUp}
        />
      </div>

      {/* Additional KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <Percent className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{data.summary.profitMargin.toFixed(1)}%</p>
          <p className="text-emerald-100 text-sm">Profit Margin</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{data.itemsSold.currentValue}</p>
          <p className="text-blue-100 text-sm">Items Sold</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <IndianRupee className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">₹{data.totalDiscount.currentValue.toFixed(0)}</p>
          <p className="text-orange-100 text-sm">Total Discounts</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <IndianRupee className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">₹{data.totalTax.currentValue.toFixed(0)}</p>
          <p className="text-purple-100 text-sm">Total Tax Collected</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Revenue & orders over the selected period</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueByPeriod}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sales by Category</h2>
          <p className="text-sm text-gray-500 mb-4">Distribution for selected period</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.salesByCategory.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.salesByCategory.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.salesByCategory.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Payment Methods & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {data.salesByPayment.map((item, index) => {
              const total = data.salesByPayment.reduce((sum, p) => sum + p.value, 0);
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">₹{item.value.toLocaleString()} ({item.count} orders)</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {data.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.name} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-semibold text-gray-600 text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">₹{product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            {lowStockBatches.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 text-sm">Low Stock Alert</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    {lowStockBatches.length} batch(es) below threshold
                  </p>
                </div>
              </div>
            )}
            {expiringBatches.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 text-sm">Expiring Soon</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    {expiringBatches.length} batch(es) expiring within 90 days
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 text-sm">Inventory Status</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {medicineBatches.reduce((sum, b) => sum + b.quantity, 0)} total units in stock
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, categoryId: '' }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !filters.categoryId
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilters(prev => ({ ...prev, categoryId: cat.id }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.categoryId === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Filter by Payment Method</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, paymentMethod: '' }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !filters.paymentMethod
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Methods
          </button>
          {['cash', 'card', 'upi', 'credit'].map(method => (
            <button
              key={method}
              onClick={() => setFilters(prev => ({ ...prev, paymentMethod: method }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.paymentMethod === method
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {method.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
