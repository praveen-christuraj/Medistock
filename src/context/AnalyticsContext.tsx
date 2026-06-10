import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { 
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subMonths,
  subQuarters, subYears, format, eachDayOfInterval, eachWeekOfInterval,
  eachMonthOfInterval, eachQuarterOfInterval, isWithinInterval
} from 'date-fns';
import { Sale } from '../types';
import { useData } from './DataContext';

// Period types for drill-through
export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type ComparisonType = 'previous-period' | 'previous-year' | 'none';

interface DateRange {
  from: Date;
  to: Date;
}

interface AnalyticsFilters {
  dateRange: DateRange;
  periodType: PeriodType;
  comparisonType: ComparisonType;
  categoryId: string;
  paymentMethod: string;
  selectedMonth: number; // 0-11
  selectedYear: number;
  selectedQuarter: number; // 1-4
}

interface SaleTransaction {
  id: string;
  date: Date;
  invoiceNumber: string;
  customerName: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  runningBalance?: number;
  type: 'sale';
}

interface PeriodSummary {
  period: string;
  periodStart: Date;
  periodEnd: Date;
  salesCount: number;
  itemsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  discount: number;
  tax: number;
  avgOrderValue: number;
  transactions: SaleTransaction[];
}

interface KPIData {
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

interface AnalyticsData {
  // KPIs
  totalRevenue: KPIData;
  totalOrders: KPIData;
  avgOrderValue: KPIData;
  totalProfit: KPIData;
  totalDiscount: KPIData;
  totalTax: KPIData;
  itemsSold: KPIData;
  
  // Period summaries for drill-through
  periodSummaries: PeriodSummary[];
  
  // Transactions list (statement view)
  transactions: SaleTransaction[];
  
  // Chart data
  revenueByPeriod: { period: string; revenue: number; orders: number; profit: number }[];
  salesByCategory: { name: string; value: number; count: number }[];
  salesByPayment: { name: string; value: number; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  
  // Summary
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalOrders: number;
    totalItems: number;
    totalDiscount: number;
    totalTax: number;
    profitMargin: number;
    openingBalance: number;
    closingBalance: number;
  };
}

interface AnalyticsContextType {
  filters: AnalyticsFilters;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilters>>;
  data: AnalyticsData;
  
  // Quick filter methods
  setDateRange: (from: Date, to: Date) => void;
  setPeriodType: (type: PeriodType) => void;
  setQuickRange: (range: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'last-year') => void;
  setMonthYear: (month: number, year: number) => void;
  setQuarter: (quarter: number, year: number) => void;
  setYear: (year: number) => void;
  
  // Drill-through
  drillDown: (periodSummary: PeriodSummary) => void;
  drillUp: () => void;
  drillPath: { type: PeriodType; label: string }[];
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const defaultFilters: AnalyticsFilters = {
  dateRange: {
    from: startOfMonth(new Date()),
    to: endOfDay(new Date())
  },
  periodType: 'day',
  comparisonType: 'previous-period',
  categoryId: '',
  paymentMethod: '',
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  selectedQuarter: Math.ceil((new Date().getMonth() + 1) / 3)
};

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);
  const [drillPath, setDrillPath] = useState<{ type: PeriodType; label: string }[]>([]);
  const { sales, medicineBatches, medicines } = useData();

  // Calculate analytics data based on filters
  const data = useMemo<AnalyticsData>(() => {
    const { dateRange, periodType, comparisonType, categoryId, paymentMethod } = filters;
    
    // Filter sales within date range
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      const inRange = isWithinInterval(saleDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      });
      
      const matchesCategory = !categoryId || sale.items.some(item => {
        const medicine = medicines.find(m => m.id === item.medicine_id);
        return medicine?.category_id === categoryId;
      });
      
      const matchesPayment = !paymentMethod || sale.payment_method === paymentMethod;
      
      return inRange && matchesCategory && matchesPayment;
    });

    // Calculate comparison period
    const periodDuration = dateRange.to.getTime() - dateRange.from.getTime();
    let comparisonRange: DateRange | null = null;
    
    if (comparisonType === 'previous-period') {
      comparisonRange = {
        from: new Date(dateRange.from.getTime() - periodDuration - 86400000),
        to: new Date(dateRange.from.getTime() - 86400000)
      };
    } else if (comparisonType === 'previous-year') {
      comparisonRange = {
        from: subYears(dateRange.from, 1),
        to: subYears(dateRange.to, 1)
      };
    }

    const comparisonSales = comparisonRange ? sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return isWithinInterval(saleDate, {
        start: startOfDay(comparisonRange!.from),
        end: endOfDay(comparisonRange!.to)
      });
    }) : [];

    // Calculate totals
    const calculateTotals = (sales: Sale[]) => {
      const revenue = sales.reduce((sum, s) => sum + s.total, 0);
      const cost = sales.reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, item) => {
          const batch = medicineBatches.find(b => b.id === item.batch_id);
          return itemSum + (batch?.purchase_price || 0) * item.quantity;
        }, 0);
      }, 0);
      const discount = sales.reduce((sum, s) => sum + s.discount_amount, 0);
      const tax = sales.reduce((sum, s) => sum + s.tax_amount, 0);
      const items = sales.reduce((sum, s) => sum + s.items.reduce((i, item) => i + item.quantity, 0), 0);
      
      return { revenue, cost, profit: revenue - cost, discount, tax, items, orders: sales.length };
    };

    const currentTotals = calculateTotals(filteredSales);
    const previousTotals = calculateTotals(comparisonSales);

    // Create KPI with comparison
    const createKPI = (current: number, previous: number): KPIData => {
      const change = current - previous;
      const changePercent = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      return {
        currentValue: current,
        previousValue: previous,
        change,
        changePercent,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
      };
    };

    // Generate transactions list (statement view)
    const transactions: SaleTransaction[] = filteredSales
      .map(sale => ({
        id: sale.id,
        date: new Date(sale.created_at),
        invoiceNumber: sale.invoice_number,
        customerName: sale.customer_name || 'Walk-in Customer',
        itemsCount: sale.items.length,
        subtotal: sale.subtotal,
        discount: sale.discount_amount,
        tax: sale.tax_amount,
        total: sale.total,
        paymentMethod: sale.payment_method,
        type: 'sale' as const
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Add running balance
    let runningBalance = 0;
    transactions.forEach(t => {
      runningBalance += t.total;
      t.runningBalance = runningBalance;
    });

    // Generate period summaries based on periodType
    const generatePeriodSummaries = (): PeriodSummary[] => {
      const summaries: PeriodSummary[] = [];
      let intervals: Date[] = [];
      
      switch (periodType) {
        case 'day':
          intervals = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
          break;
        case 'week':
          intervals = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to });
          break;
        case 'month':
          intervals = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
          break;
        case 'quarter':
          intervals = eachQuarterOfInterval({ start: dateRange.from, end: dateRange.to });
          break;
        case 'year':
          const years: Date[] = [];
          for (let y = dateRange.from.getFullYear(); y <= dateRange.to.getFullYear(); y++) {
            years.push(new Date(y, 0, 1));
          }
          intervals = years;
          break;
        default:
          intervals = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      }

      intervals.forEach(intervalStart => {
        let periodStart: Date, periodEnd: Date, periodLabel: string;
        
        switch (periodType) {
          case 'day':
            periodStart = startOfDay(intervalStart);
            periodEnd = endOfDay(intervalStart);
            periodLabel = format(intervalStart, 'dd MMM yyyy');
            break;
          case 'week':
            periodStart = startOfWeek(intervalStart, { weekStartsOn: 1 });
            periodEnd = endOfWeek(intervalStart, { weekStartsOn: 1 });
            periodLabel = `Week of ${format(periodStart, 'dd MMM')}`;
            break;
          case 'month':
            periodStart = startOfMonth(intervalStart);
            periodEnd = endOfMonth(intervalStart);
            periodLabel = format(intervalStart, 'MMMM yyyy');
            break;
          case 'quarter':
            periodStart = startOfQuarter(intervalStart);
            periodEnd = endOfQuarter(intervalStart);
            const q = Math.ceil((intervalStart.getMonth() + 1) / 3);
            periodLabel = `Q${q} ${format(intervalStart, 'yyyy')}`;
            break;
          case 'year':
            periodStart = startOfYear(intervalStart);
            periodEnd = endOfYear(intervalStart);
            periodLabel = format(intervalStart, 'yyyy');
            break;
          default:
            periodStart = startOfDay(intervalStart);
            periodEnd = endOfDay(intervalStart);
            periodLabel = format(intervalStart, 'dd MMM yyyy');
        }

        const periodSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return isWithinInterval(saleDate, { start: periodStart, end: periodEnd });
        });

        const periodTransactions: SaleTransaction[] = periodSales.map(sale => ({
          id: sale.id,
          date: new Date(sale.created_at),
          invoiceNumber: sale.invoice_number,
          customerName: sale.customer_name || 'Walk-in Customer',
          itemsCount: sale.items.length,
          subtotal: sale.subtotal,
          discount: sale.discount_amount,
          tax: sale.tax_amount,
          total: sale.total,
          paymentMethod: sale.payment_method,
          type: 'sale' as const
        }));

        const totals = calculateTotals(periodSales);

        summaries.push({
          period: periodLabel,
          periodStart,
          periodEnd,
          salesCount: periodSales.length,
          itemsSold: totals.items,
          revenue: totals.revenue,
          cost: totals.cost,
          profit: totals.profit,
          discount: totals.discount,
          tax: totals.tax,
          avgOrderValue: periodSales.length > 0 ? totals.revenue / periodSales.length : 0,
          transactions: periodTransactions
        });
      });

      return summaries;
    };

    const periodSummaries = generatePeriodSummaries();

    // Revenue by period for charts
    const revenueByPeriod = periodSummaries.map(ps => ({
      period: ps.period,
      revenue: ps.revenue,
      orders: ps.salesCount,
      profit: ps.profit
    }));

    // Sales by category
    const categoryMap = new Map<string, { value: number; count: number }>();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const medicine = medicines.find(m => m.id === item.medicine_id);
        const category = medicine?.category_name || 'Others';
        const existing = categoryMap.get(category) || { value: 0, count: 0 };
        categoryMap.set(category, {
          value: existing.value + item.total_price,
          count: existing.count + item.quantity
        });
      });
    });
    const salesByCategory = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);

    // Sales by payment
    const paymentMap = new Map<string, { value: number; count: number }>();
    filteredSales.forEach(sale => {
      const method = sale.payment_method.toUpperCase();
      const existing = paymentMap.get(method) || { value: 0, count: 0 };
      paymentMap.set(method, {
        value: existing.value + sale.total,
        count: existing.count + 1
      });
    });
    const salesByPayment = Array.from(paymentMap.entries())
      .map(([name, data]) => ({ name, ...data }));

    // Top products
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.medicine_name) || { quantity: 0, revenue: 0 };
        productMap.set(item.medicine_name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total_price
        });
      });
    });
    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue: createKPI(currentTotals.revenue, previousTotals.revenue),
      totalOrders: createKPI(currentTotals.orders, previousTotals.orders),
      avgOrderValue: createKPI(
        currentTotals.orders > 0 ? currentTotals.revenue / currentTotals.orders : 0,
        previousTotals.orders > 0 ? previousTotals.revenue / previousTotals.orders : 0
      ),
      totalProfit: createKPI(currentTotals.profit, previousTotals.profit),
      totalDiscount: createKPI(currentTotals.discount, previousTotals.discount),
      totalTax: createKPI(currentTotals.tax, previousTotals.tax),
      itemsSold: createKPI(currentTotals.items, previousTotals.items),
      periodSummaries,
      transactions,
      revenueByPeriod,
      salesByCategory,
      salesByPayment,
      topProducts,
      summary: {
        totalRevenue: currentTotals.revenue,
        totalCost: currentTotals.cost,
        totalProfit: currentTotals.profit,
        totalOrders: currentTotals.orders,
        totalItems: currentTotals.items,
        totalDiscount: currentTotals.discount,
        totalTax: currentTotals.tax,
        profitMargin: currentTotals.revenue > 0 ? (currentTotals.profit / currentTotals.revenue) * 100 : 0,
        openingBalance: 0,
        closingBalance: runningBalance
      }
    };
  }, [filters, medicineBatches, medicines, sales]);

  const setDateRange = (from: Date, to: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { from, to }
    }));
  };

  const setPeriodType = (type: PeriodType) => {
    setFilters(prev => ({ ...prev, periodType: type }));
  };

  const setQuickRange = (range: string) => {
    const today = new Date();
    let from: Date, to: Date;
    
    switch (range) {
      case 'today':
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case 'yesterday':
        from = startOfDay(subDays(today, 1));
        to = endOfDay(subDays(today, 1));
        break;
      case 'this-week':
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = endOfDay(today);
        break;
      case 'last-week':
        from = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        to = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        break;
      case 'this-month':
        from = startOfMonth(today);
        to = endOfDay(today);
        break;
      case 'last-month':
        from = startOfMonth(subMonths(today, 1));
        to = endOfMonth(subMonths(today, 1));
        break;
      case 'this-quarter':
        from = startOfQuarter(today);
        to = endOfDay(today);
        break;
      case 'last-quarter':
        from = startOfQuarter(subQuarters(today, 1));
        to = endOfQuarter(subQuarters(today, 1));
        break;
      case 'this-year':
        from = startOfYear(today);
        to = endOfDay(today);
        break;
      case 'last-year':
        from = startOfYear(subYears(today, 1));
        to = endOfYear(subYears(today, 1));
        break;
      default:
        from = startOfMonth(today);
        to = endOfDay(today);
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: { from, to }
    }));
  };

  const setMonthYear = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from: startOfMonth(date),
        to: endOfMonth(date)
      },
      selectedMonth: month,
      selectedYear: year,
      periodType: 'day'
    }));
  };

  const setQuarter = (quarter: number, year: number) => {
    const month = (quarter - 1) * 3;
    const date = new Date(year, month, 1);
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from: startOfQuarter(date),
        to: endOfQuarter(date)
      },
      selectedQuarter: quarter,
      selectedYear: year,
      periodType: 'month'
    }));
  };

  const setYear = (year: number) => {
    const date = new Date(year, 0, 1);
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from: startOfYear(date),
        to: endOfYear(date)
      },
      selectedYear: year,
      periodType: 'month'
    }));
  };

  const drillDown = (periodSummary: PeriodSummary) => {
    const { periodType } = filters;
    let newPeriodType: PeriodType;
    
    switch (periodType) {
      case 'year':
        newPeriodType = 'quarter';
        break;
      case 'quarter':
        newPeriodType = 'month';
        break;
      case 'month':
        newPeriodType = 'week';
        break;
      case 'week':
        newPeriodType = 'day';
        break;
      default:
        return; // Can't drill further
    }
    
    setDrillPath(prev => [...prev, { type: periodType, label: periodSummary.period }]);
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from: periodSummary.periodStart,
        to: periodSummary.periodEnd
      },
      periodType: newPeriodType
    }));
  };

  const drillUp = () => {
    if (drillPath.length === 0) return;
    
    const newPath = [...drillPath];
    const lastLevel = newPath.pop();
    
    if (lastLevel) {
      setDrillPath(newPath);
      
      // Reset to broader view
      let newPeriodType: PeriodType;
      switch (lastLevel.type) {
        case 'day':
          newPeriodType = 'week';
          break;
        case 'week':
          newPeriodType = 'month';
          break;
        case 'month':
          newPeriodType = 'quarter';
          break;
        case 'quarter':
          newPeriodType = 'year';
          break;
        default:
          newPeriodType = 'month';
      }
      
      setFilters(prev => ({
        ...prev,
        periodType: newPeriodType
      }));
    }
  };

  return (
    <AnalyticsContext.Provider value={{
      filters,
      setFilters,
      data,
      setDateRange,
      setPeriodType,
      setQuickRange,
      setMonthYear,
      setQuarter,
      setYear,
      drillDown,
      drillUp,
      drillPath
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
