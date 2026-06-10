import { useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useAnalytics, PeriodType } from '../../context/AnalyticsContext';

const quickRanges = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this-week' },
  { label: 'Last Week', value: 'last-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Quarter', value: 'this-quarter' },
  { label: 'Last Quarter', value: 'last-quarter' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last Year', value: 'last-year' },
];

const periodTypes: { label: string; value: PeriodType }[] = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
  { label: 'Quarterly', value: 'quarter' },
  { label: 'Yearly', value: 'year' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const quarters = [
  { label: 'Q1 (Jan-Mar)', value: 1 },
  { label: 'Q2 (Apr-Jun)', value: 2 },
  { label: 'Q3 (Jul-Sep)', value: 3 },
  { label: 'Q4 (Oct-Dec)', value: 4 },
];

interface DateSlicerProps {
  showPeriodSelector?: boolean;
  showQuickRanges?: boolean;
  showMonthPicker?: boolean;
  showQuarterPicker?: boolean;
  showYearPicker?: boolean;
  compact?: boolean;
}

export default function DateSlicer({
  showPeriodSelector = true,
  showQuickRanges = true,
  showMonthPicker = true,
  showQuarterPicker = true,
  showYearPicker = true,
  compact = false
}: DateSlicerProps) {
  const { filters, setFilters, setQuickRange, setPeriodType, setMonthYear, setQuarter, setYear } = useAnalytics();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom' | 'month' | 'quarter' | 'year'>('quick');
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  const [pickerYear, setPickerYear] = useState(filters.selectedYear);

  const handleQuickRange = (value: string) => {
    setQuickRange(value as any);
    setShowDropdown(false);
  };

  const handleMonthSelect = (month: number) => {
    setMonthYear(month, pickerYear);
    setShowDropdown(false);
  };

  const handleQuarterSelect = (quarter: number) => {
    setQuarter(quarter, pickerYear);
    setShowDropdown(false);
  };

  const handleYearSelect = (year: number) => {
    setYear(year);
    setShowDropdown(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date Range Display */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {format(filters.dateRange.from, 'dd MMM')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4">
              {/* Quick Ranges */}
              <div className="grid grid-cols-2 gap-2">
                {quickRanges.map(range => (
                  <button
                    key={range.value}
                    onClick={() => handleQuickRange(range.value)}
                    className="px-3 py-2 text-sm text-left rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Date Range */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Custom Range</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={format(filters.dateRange.from, 'yyyy-MM-dd')}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: new Date(e.target.value) }
                    }))}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg"
                  />
                  <input
                    type="date"
                    value={format(filters.dateRange.to, 'yyyy-MM-dd')}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: new Date(e.target.value) }
                    }))}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Period Type */}
        {showPeriodSelector && (
          <select
            value={filters.periodType}
            onChange={(e) => setPeriodType(e.target.value as PeriodType)}
            className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {periodTypes.map(pt => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Date & Period Selection</h3>
        <div className="text-sm text-gray-500">
          {format(filters.dateRange.from, 'dd MMM yyyy')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {showQuickRanges && (
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'quick' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quick Select
          </button>
        )}
        {showMonthPicker && (
          <button
            onClick={() => setActiveTab('month')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
        )}
        {showQuarterPicker && (
          <button
            onClick={() => setActiveTab('quarter')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'quarter' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quarter
          </button>
        )}
        {showYearPicker && (
          <button
            onClick={() => setActiveTab('year')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'year' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Year
          </button>
        )}
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-5 gap-2">
          {quickRanges.map(range => (
            <button
              key={range.value}
              onClick={() => handleQuickRange(range.value)}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'month' && (
        <div>
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setPickerYear(y => y - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-900">{pickerYear}</span>
            <button
              onClick={() => setPickerYear(y => y + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {/* Month Grid */}
          <div className="grid grid-cols-4 gap-2">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filters.selectedMonth === index && filters.selectedYear === pickerYear
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'quarter' && (
        <div>
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setPickerYear(y => y - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-900">{pickerYear}</span>
            <button
              onClick={() => setPickerYear(y => y + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {/* Quarter Grid */}
          <div className="grid grid-cols-2 gap-3">
            {quarters.map(q => (
              <button
                key={q.value}
                onClick={() => handleQuarterSelect(q.value)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  filters.selectedQuarter === q.value && filters.selectedYear === pickerYear
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'year' && (
        <div className="grid grid-cols-5 gap-2">
          {years.map(year => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.selectedYear === year
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={format(filters.dateRange.from, 'yyyy-MM-dd')}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, from: new Date(e.target.value) }
              }))}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={format(filters.dateRange.to, 'yyyy-MM-dd')}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, to: new Date(e.target.value) }
              }))}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Period Type Selector */}
      {showPeriodSelector && (
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Group By Period</label>
          <div className="flex gap-2">
            {periodTypes.map(pt => (
              <button
                key={pt.value}
                onClick={() => setPeriodType(pt.value)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filters.periodType === pt.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
