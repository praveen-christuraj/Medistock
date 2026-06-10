import { useState } from 'react';
import {
  User,
  Store,
  Bell,
  Shield,
  Database,
  Cloud,
  Smartphone,
  Save,
  Key,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  X,
  Tag,
  Box,
  Percent
} from 'lucide-react';
import { DATABASE_SCHEMA } from '../lib/supabase';
import { defaultCategories, defaultUnits, defaultAppSettings } from '../data/mockData';
import { Category, Unit, AppSettings } from '../types';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('shop');
  const [showSchema, setShowSchema] = useState(false);
  
  // Categories & Units state
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [units, setUnits] = useState<Unit[]>(defaultUnits);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [unitForm, setUnitForm] = useState({ name: '', short_name: '' });
  
  // App Settings state
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);

  const tabs = [
    { id: 'shop', name: 'Shop Details', icon: Store },
    { id: 'categories', name: 'Categories', icon: Tag },
    { id: 'units', name: 'Units', icon: Box },
    { id: 'tax', name: 'Tax Settings', icon: Percent },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'database', name: 'Database Setup', icon: Database },
    { id: 'sync', name: 'Sync Settings', icon: Cloud }
  ];

  // Category handlers
  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(cats => cats.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: categoryForm.name, description: categoryForm.description }
          : c
      ));
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryForm.name,
        description: categoryForm.description,
        created_at: new Date().toISOString()
      };
      setCategories([...categories, newCategory]);
    }
    setShowCategoryModal(false);
    setCategoryForm({ name: '', description: '' });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(cats => cats.filter(c => c.id !== id));
    }
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || '' });
    setShowCategoryModal(true);
  };

  // Unit handlers
  const handleSaveUnit = () => {
    if (editingUnit) {
      setUnits(u => u.map(unit => 
        unit.id === editingUnit.id 
          ? { ...unit, name: unitForm.name, short_name: unitForm.short_name }
          : unit
      ));
    } else {
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: unitForm.name,
        short_name: unitForm.short_name,
        created_at: new Date().toISOString()
      };
      setUnits([...units, newUnit]);
    }
    setShowUnitModal(false);
    setUnitForm({ name: '', short_name: '' });
    setEditingUnit(null);
  };

  const handleDeleteUnit = (id: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      setUnits(u => u.filter(unit => unit.id !== id));
    }
  };

  const openEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitForm({ name: unit.name, short_name: unit.short_name });
    setShowUnitModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and application settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Shop Details */}
          {activeTab === 'shop' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shop Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={appSettings.shop_name}
                    onChange={(e) => setAppSettings({ ...appSettings, shop_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={appSettings.shop_address}
                    onChange={(e) => setAppSettings({ ...appSettings, shop_address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drug License No.</label>
                    <input
                      type="text"
                      value={appSettings.drug_license}
                      onChange={(e) => setAppSettings({ ...appSettings, drug_license: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={appSettings.gst_number}
                      onChange={(e) => setAppSettings({ ...appSettings, gst_number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={appSettings.low_stock_threshold}
                      onChange={(e) => setAppSettings({ ...appSettings, low_stock_threshold: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Alert Days</label>
                    <input
                      type="number"
                      value={appSettings.expiry_alert_days}
                      onChange={(e) => setAppSettings({ ...appSettings, expiry_alert_days: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert for items expiring within these days</p>
                  </div>
                </div>
                <div className="pt-4">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories Management */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Medicine Categories</h2>
                  <p className="text-sm text-gray-500">Customize categories for your inventory</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '' });
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCategory(category)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Management */}
          {activeTab === 'units' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Units of Measurement</h2>
                  <p className="text-sm text-gray-500">Customize units for your medicines</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUnit(null);
                    setUnitForm({ name: '', short_name: '' });
                    setShowUnitModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Unit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{unit.name}</h3>
                        <p className="text-sm text-gray-500">Short: {unit.short_name}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditUnit(unit)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Settings */}
          {activeTab === 'tax' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Tax Settings</h2>
              
              <div className="space-y-6">
                {/* Tax Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Enable Tax</p>
                    <p className="text-sm text-gray-500">Apply tax to all sales transactions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={appSettings.tax_enabled}
                      onChange={(e) => setAppSettings({ ...appSettings, tax_enabled: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {appSettings.tax_enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                      <input
                        type="text"
                        value={appSettings.tax_name}
                        onChange={(e) => setAppSettings({ ...appSettings, tax_name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g., GST, VAT"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percentage (%)</label>
                      <input
                        type="number"
                        value={appSettings.tax_percentage}
                        onChange={(e) => setAppSettings({ ...appSettings, tax_percentage: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g., 5, 12, 18"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}

                {/* Tax Preview */}
                {appSettings.tax_enabled && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Tax Calculation Preview</h3>
                    <p className="text-sm text-blue-700">
                      For a medicine with MRP ₹100:
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-blue-700">Subtotal: ₹100.00</p>
                      <p className="text-blue-700">{appSettings.tax_name} ({appSettings.tax_percentage}%): ₹{(100 * appSettings.tax_percentage / 100).toFixed(2)}</p>
                      <p className="font-semibold text-blue-900">Total: ₹{(100 + (100 * appSettings.tax_percentage / 100)).toFixed(2)}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">
                    <Save className="w-5 h-5" />
                    Save Tax Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">AD</span>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                      Change Photo
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="admin@medstock.com"
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+91 9876543210"
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      defaultValue="Administrator"
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-gray-500"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Supabase Configuration</h2>
                <p className="text-gray-600 mb-6">
                  Connect your application to Supabase for cloud database storage and real-time sync.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Project URL</label>
                    <input
                      type="url"
                      placeholder="https://your-project.supabase.co"
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anon/Public Key</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                      />
                      <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">
                      <Save className="w-5 h-5" />
                      Save & Test Connection
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Database Schema</h2>
                  <button
                    onClick={() => setShowSchema(!showSchema)}
                    className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    {showSchema ? 'Hide Schema' : 'View Schema'}
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Copy and run this SQL in your Supabase SQL Editor to create all required tables.
                </p>
                {showSchema && (
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm max-h-96">
                      {DATABASE_SCHEMA}
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(DATABASE_SCHEMA)}
                      className="absolute top-2 right-2 px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Configuration</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="font-medium text-gray-900">Auto Sync</p>
                        <p className="text-sm text-gray-500">Automatically sync when online</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Mobile Offline Mode</p>
                        <p className="text-sm text-gray-500">Store data locally on Android</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sync Interval</label>
                    <select className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                      <option value="60">Every hour</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last Sync</span>
                    <span className="font-medium text-gray-900">Today, 2:45 PM</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Pending Records</span>
                    <span className="font-medium text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Connection Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Connected</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">
                    <RefreshCw className="w-5 h-5" />
                    Force Sync Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { title: 'Low Stock Alerts', description: 'Get notified when items fall below reorder level' },
                  { title: 'Expiry Alerts', description: 'Notifications for items expiring soon' },
                  { title: 'Daily Sales Summary', description: 'Receive daily sales report' },
                  { title: 'New Order Notifications', description: 'Alert for new purchase orders' }
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Antibiotics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingUnit ? 'Edit Unit' : 'Add Unit'}
              </h2>
              <button
                onClick={() => {
                  setShowUnitModal(false);
                  setEditingUnit(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name *</label>
                <input
                  type="text"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Tablet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Name *</label>
                <input
                  type="text"
                  value={unitForm.short_name}
                  onChange={(e) => setUnitForm({ ...unitForm, short_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., tab"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUnitModal(false);
                    setEditingUnit(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUnit}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                >
                  {editingUnit ? 'Update' : 'Add'} Unit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
