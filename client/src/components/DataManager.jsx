import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAccountStore } from '../store/useAccountStore';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function DataManager({ isOpen, onClose }) {
  const { transactions, addTransaction, clearAllTransactions } = useTransactionStore();
  const { budgets } = useBudgetStore();
  const { accounts } = useAccountStore();
  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState('json');
  const [exportDateRange, setExportDateRange] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [importProgress, setImportProgress] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      let dataToExport = {
        transactions,
        budgets,
        accounts,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      // Filter by date range if specified
      if (exportDateRange !== 'all') {
        const now = new Date();
        let startDate;

        switch (exportDateRange) {
          case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'lastMonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            break;
          case 'thisYear':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case 'custom':
            startDate = customDateStart ? new Date(customDateStart) : null;
            const endDate = customDateEnd ? new Date(customDateEnd) : now;
            
            dataToExport.transactions = transactions.filter(transaction => {
              const transactionDate = new Date(transaction.date);
              return (!startDate || transactionDate >= startDate) && transactionDate <= endDate;
            });
            break;
          default:
            break;
        }

        if (exportDateRange !== 'custom') {
          dataToExport.transactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDate;
          });
        }
      }

      let content, filename, mimeType;

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify(dataToExport, null, 2);
          filename = `expense-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
          mimeType = 'application/json';
          break;
        
        case 'csv':
          // Export transactions as CSV
          const csvHeaders = ['Date', 'Description', 'Amount', 'Category', 'Type', 'Account'];
          const csvRows = dataToExport.transactions.map(transaction => [
            transaction.date,
            transaction.description,
            transaction.amount,
            transaction.category,
            transaction.type,
            transaction.accountId || 'Default'
          ]);
          
          content = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
          filename = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'excel':
          // For Excel, we'll use CSV format with .xlsx extension
          // In a real app, you'd use a library like SheetJS
          const excelHeaders = ['Date', 'Description', 'Amount', 'Category', 'Type', 'Account'];
          const excelRows = dataToExport.transactions.map(transaction => [
            transaction.date,
            transaction.description,
            transaction.amount,
            transaction.category,
            transaction.type,
            transaction.accountId || 'Default'
          ]);
          
          content = [excelHeaders, ...excelRows]
            .map(row => row.join('\t'))
            .join('\n');
          filename = `expense-tracker-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
          mimeType = 'application/vnd.ms-excel';
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Data exported successfully as ${filename}`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportProgress({ stage: 'reading', progress: 0 });

    try {
      const text = await file.text();
      setImportProgress({ stage: 'parsing', progress: 30 });

      let importedData;
      
      if (file.name.endsWith('.json')) {
        importedData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV format
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        const rows = lines.slice(1).filter(line => line.trim());
        
        importedData = {
          transactions: rows.map(row => {
            const values = row.split(',').map(v => v.replace(/"/g, ''));
            return {
              id: Date.now() + Math.random(),
              date: values[0],
              description: values[1],
              amount: parseFloat(values[2]),
              category: values[3],
              type: values[4],
              accountId: values[5] !== 'Default' ? values[5] : null,
              createdAt: new Date().toISOString()
            };
          }),
          budgets: [],
          accounts: []
        };
      } else {
        throw new Error('Unsupported file format');
      }

      setImportProgress({ stage: 'validating', progress: 60 });

      // Validate imported data
      if (!importedData.transactions || !Array.isArray(importedData.transactions)) {
        throw new Error('Invalid data format: transactions not found');
      }

      setImportProgress({ stage: 'importing', progress: 80 });

      // Import transactions
      let importedCount = 0;
      for (const transaction of importedData.transactions) {
        if (transaction.description && transaction.amount && transaction.date) {
          addTransaction({
            ...transaction,
            id: Date.now() + Math.random(), // Generate new ID
            createdAt: new Date().toISOString()
          });
          importedCount++;
        }
      }

      setImportProgress({ stage: 'complete', progress: 100 });
      
      setTimeout(() => {
        setImportProgress(null);
        toast.success(`Successfully imported ${importedCount} transactions`);
      }, 1000);

    } catch (error) {
      setImportProgress(null);
      toast.error(`Import failed: ${error.message}`);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleClearAllData = () => {
    if (window.confirm(
      'Are you sure you want to clear all data? This action cannot be undone.\n\n' +
      'This will delete:\n' +
      '• All transactions\n' +
      '• All budgets\n' +
      '• All accounts\n' +
      'Type "DELETE" to confirm:'
    )) {
      const confirmation = prompt('Type "DELETE" to confirm:');
      if (confirmation === 'DELETE') {
        clearAllTransactions();
        toast.success('All data has been cleared');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Data Management</h2>
                <p className="text-purple-100">Export and import your financial data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'export', label: 'Export Data', icon: Download },
              { id: 'import', label: 'Import Data', icon: Upload }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Data Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Data Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
                    <div className="text-sm text-gray-600">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{budgets.length}</div>
                    <div className="text-sm text-gray-600">Budgets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{accounts.length}</div>
                    <div className="text-sm text-gray-600">Accounts</div>
                  </div>
                </div>
              </div>

              {/* Export Format */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'json', label: 'JSON', description: 'Complete data with all features', icon: FileText },
                    { id: 'csv', label: 'CSV', description: 'Transactions only, spreadsheet compatible', icon: FileText },
                    { id: 'excel', label: 'Excel', description: 'Formatted for Microsoft Excel', icon: FileText }
                  ].map(format => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setExportFormat(format.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          exportFormat === format.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${
                          exportFormat === format.id ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <div className="font-medium text-gray-900">{format.label}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'all', label: 'All Time' },
                      { id: 'thisMonth', label: 'This Month' },
                      { id: 'lastMonth', label: 'Last Month' },
                      { id: 'thisYear', label: 'This Year' }
                    ].map(range => (
                      <button
                        key={range.id}
                        onClick={() => setExportDateRange(range.id)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          exportDateRange === range.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setExportDateRange('custom')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      exportDateRange === 'custom'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline-block mr-2" />
                    Custom Date Range
                  </button>

                  {exportDateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={customDateStart}
                          onChange={(e) => setCustomDateStart(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={customDateEnd}
                          onChange={(e) => setCustomDateEnd(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleExport}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Import Instructions */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Instructions</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>JSON files:</strong> Complete import including transactions, budgets, and accounts</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>CSV files:</strong> Transaction data only (Date, Description, Amount, Category, Type, Account)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Importing will add to your existing data (duplicates may occur)</span>
                  </div>
                </div>
              </div>

              {/* Import Progress */}
              {importProgress && (
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="font-medium text-gray-900">
                      {importProgress.stage === 'reading' && 'Reading file...'}
                      {importProgress.stage === 'parsing' && 'Parsing data...'}
                      {importProgress.stage === 'validating' && 'Validating data...'}
                      {importProgress.stage === 'importing' && 'Importing transactions...'}
                      {importProgress.stage === 'complete' && 'Import completed!'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImport}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Import Data File</h3>
                <p className="text-gray-600 mb-4">
                  Select a JSON or CSV file to import your financial data
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!importProgress}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Choose File
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JSON, CSV (max 10MB)
                </p>
              </div>

              {/* Data Management */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <p className="text-red-700 text-sm mb-4">
                  Permanently delete all your data. This action cannot be undone.
                </p>
                <button
                  onClick={handleClearAllData}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}