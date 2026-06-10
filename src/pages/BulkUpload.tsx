import { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  HelpCircle
} from 'lucide-react';

interface UploadResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'inventory' | 'sales' | 'suppliers'>('inventory');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setUploadResult({
      total: 50,
      success: 47,
      failed: 3,
      errors: [
        'Row 12: Invalid expiry date format',
        'Row 28: Duplicate batch number',
        'Row 35: Missing required field "selling_price"'
      ]
    });
    setIsUploading(false);
  };

  const downloadTemplate = (type: string) => {
    alert(`Downloading ${type} template...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload</h1>
        <p className="text-gray-500">Import data in bulk using Excel or CSV files</p>
      </div>

      {/* Upload Type Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Select Upload Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'inventory', name: 'Inventory/Medicines', icon: FileSpreadsheet, description: 'Add or update medicine stock' },
            { id: 'sales', name: 'Sales History', icon: FileText, description: 'Import historical sales data' },
            { id: 'suppliers', name: 'Suppliers', icon: FileSpreadsheet, description: 'Add multiple suppliers at once' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setUploadType(type.id as 'inventory' | 'sales' | 'suppliers')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                uploadType === type.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <type.icon className={`w-8 h-8 mb-2 ${uploadType === type.id ? 'text-emerald-600' : 'text-gray-400'}`} />
              <h3 className="font-medium text-gray-900">{type.name}</h3>
              <p className="text-sm text-gray-500">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Download Template */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Download Template First</h3>
            <p className="text-blue-700 text-sm mb-4">
              Download the template file and fill in your data. Make sure to follow the format exactly for successful upload.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => downloadTemplate('excel')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Excel Template (.xlsx)
              </button>
              <button
                onClick={() => downloadTemplate('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                CSV Template (.csv)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Upload File</h2>
        
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            selectedFile ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className={`w-12 h-12 mx-auto mb-4 ${selectedFile ? 'text-emerald-500' : 'text-gray-400'}`} />
            {selectedFile ? (
              <div>
                <p className="font-medium text-emerald-700">{selectedFile.name}</p>
                <p className="text-sm text-emerald-600 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm text-gray-500 mt-2">Click to select a different file</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">Excel (.xlsx, .xls) or CSV files only</p>
              </div>
            )}
          </label>
        </div>

        {selectedFile && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Import Data
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Upload Results</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{uploadResult.total}</p>
              <p className="text-sm text-gray-500">Total Records</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-3xl font-bold text-green-700">{uploadResult.success}</p>
              </div>
              <p className="text-sm text-green-600">Successful</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-3xl font-bold text-red-700">{uploadResult.failed}</p>
              </div>
              <p className="text-sm text-red-600">Failed</p>
            </div>
          </div>

          {uploadResult.errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-800">Errors Found</h3>
              </div>
              <ul className="space-y-2">
                {uploadResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">File Requirements</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Use Excel (.xlsx, .xls) or CSV format</li>
              <li>• First row must contain column headers</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Maximum 1000 rows per upload</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Required Fields for Inventory</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Medicine Name</li>
              <li>• Batch Number</li>
              <li>• Purchase Price</li>
              <li>• Selling Price</li>
              <li>• Quantity</li>
              <li>• Expiry Date (DD/MM/YYYY)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
