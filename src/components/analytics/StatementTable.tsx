import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, FileText, Download, Printer, Eye } from 'lucide-react';

interface Transaction {
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
  type: string;
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
  transactions: Transaction[];
}

interface StatementTableProps {
  transactions?: Transaction[];
  periodSummaries?: PeriodSummary[];
  showRunningBalance?: boolean;
  showPeriodSummary?: boolean;
  onDrillDown?: (summary: PeriodSummary) => void;
  onViewTransaction?: (transaction: Transaction) => void;
  onPrintTransaction?: (transaction: Transaction) => void;
  title?: string;
  openingBalance?: number;
  closingBalance?: number;
}

export default function StatementTable({
  transactions = [],
  periodSummaries = [],
  showRunningBalance = true,
  showPeriodSummary = false,
  onDrillDown,
  onViewTransaction,
  onPrintTransaction,
  title = 'Statement',
  openingBalance = 0,
  closingBalance = 0
}: StatementTableProps) {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());

  const togglePeriod = (period: string) => {
    const newExpanded = new Set(expandedPeriods);
    if (newExpanded.has(period)) {
      newExpanded.delete(period);
    } else {
      newExpanded.add(period);
    }
    setExpandedPeriods(newExpanded);
  };

  const handleExport = () => {
    const data = showPeriodSummary 
      ? periodSummaries.flatMap(ps => ps.transactions)
      : transactions;
    
    const headers = ['Date', 'Invoice', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment', 'Balance'];
    const rows = data.map(t => [
      format(t.date, 'dd/MM/yyyy HH:mm'),
      t.invoiceNumber,
      t.customerName,
      t.itemsCount.toString(),
      t.subtotal.toFixed(2),
      t.discount.toFixed(2),
      t.tax.toFixed(2),
      t.total.toFixed(2),
      t.paymentMethod.toUpperCase(),
      t.runningBalance?.toFixed(2) || ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTransactionRow = (transaction: Transaction) => (
    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-600">
        {format(transaction.date, 'dd MMM yyyy')}
        <br />
        <span className="text-xs text-gray-400">{format(transaction.date, 'hh:mm a')}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-emerald-600">{transaction.invoiceNumber}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{transaction.customerName}</td>
      <td className="px-4 py-3 text-sm text-center text-gray-600">{transaction.itemsCount}</td>
      <td className="px-4 py-3 text-sm text-right text-gray-600">₹{transaction.subtotal.toFixed(2)}</td>
      <td className="px-4 py-3 text-sm text-right text-orange-600">
        {transaction.discount > 0 ? `-₹${transaction.discount.toFixed(2)}` : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-right text-blue-600">
        {transaction.tax > 0 ? `+₹${transaction.tax.toFixed(2)}` : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">₹{transaction.total.toFixed(2)}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          transaction.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
          transaction.paymentMethod === 'upi' ? 'bg-blue-100 text-blue-700' :
          transaction.paymentMethod === 'card' ? 'bg-purple-100 text-purple-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {transaction.paymentMethod.toUpperCase()}
        </span>
      </td>
      {showRunningBalance && (
        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
          ₹{transaction.runningBalance?.toFixed(2) || '-'}
        </td>
      )}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {onViewTransaction && (
            <button
              onClick={() => onViewTransaction(transaction)}
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onPrintTransaction && (
            <button
              onClick={() => onPrintTransaction(transaction)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  const renderPeriodSummaryRow = (summary: PeriodSummary) => {
    const isExpanded = expandedPeriods.has(summary.period);
    
    return (
      <>
        <tr 
          key={summary.period}
          className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => togglePeriod(summary.period)}
        >
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-medium text-gray-900">{summary.period}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {summary.salesCount} orders
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {summary.itemsSold} items
          </td>
          <td className="px-4 py-3"></td>
          <td className="px-4 py-3 text-sm text-right text-gray-600">-</td>
          <td className="px-4 py-3 text-sm text-right text-orange-600">
            -₹{summary.discount.toFixed(2)}
          </td>
          <td className="px-4 py-3 text-sm text-right text-blue-600">
            +₹{summary.tax.toFixed(2)}
          </td>
          <td className="px-4 py-3 text-sm text-right font-bold text-emerald-700">
            ₹{summary.revenue.toFixed(2)}
          </td>
          <td className="px-4 py-3 text-sm text-center text-gray-500">-</td>
          {showRunningBalance && <td className="px-4 py-3"></td>}
          <td className="px-4 py-3">
            {onDrillDown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown(summary);
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Drill Down →
              </button>
            )}
          </td>
        </tr>
        {isExpanded && summary.transactions.map((t) => renderTransactionRow(t))}
      </>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {showPeriodSummary 
                ? `${periodSummaries.length} periods, ${periodSummaries.reduce((sum, ps) => sum + ps.salesCount, 0)} transactions`
                : `${transactions.length} transactions`
              }
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Opening Balance */}
      {showRunningBalance && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex justify-between">
          <span className="text-sm font-medium text-blue-700">Opening Balance</span>
          <span className="text-sm font-bold text-blue-700">₹{openingBalance.toFixed(2)}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Items</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Discount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Payment</th>
              {showRunningBalance && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Balance</th>
              )}
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {showPeriodSummary
              ? periodSummaries.map(renderPeriodSummaryRow)
              : transactions.map((t) => renderTransactionRow(t))
            }
            {(showPeriodSummary ? periodSummaries.length === 0 : transactions.length === 0) && (
              <tr>
                <td colSpan={showRunningBalance ? 11 : 10} className="px-4 py-12 text-center text-gray-500">
                  No transactions found for the selected period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Closing Balance */}
      {showRunningBalance && (
        <div className="px-6 py-3 bg-emerald-50 border-t border-emerald-100 flex justify-between">
          <span className="text-sm font-medium text-emerald-700">Closing Balance</span>
          <span className="text-sm font-bold text-emerald-700">₹{closingBalance.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
