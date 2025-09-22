import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Bitcoin, 
  ArrowRightLeft,
  TrendingUp,
  Globe,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { toast } from 'react-toastify';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', icon: DollarSign },
  { code: 'EUR', symbol: '€', name: 'Euro', icon: Euro },
  { code: 'GBP', symbol: '£', name: 'British Pound', icon: PoundSterling },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', icon: DollarSign },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', icon: DollarSign },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', icon: DollarSign },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', icon: DollarSign },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', icon: DollarSign },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', icon: DollarSign },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', icon: Bitcoin },
];

// Mock exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.12,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.50,
  BTC: 0.000023,
};

export default function CurrencySettings({ isOpen, onClose }) {
  const { 
    defaultCurrency, 
    setDefaultCurrency, 
    exchangeRates, 
    updateExchangeRates,
    multiCurrencyEnabled,
    setMultiCurrencyEnabled
  } = useSettingsStore();
  
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [customRates, setCustomRates] = useState(exchangeRates || EXCHANGE_RATES);
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  const handleSave = () => {
    setDefaultCurrency(selectedCurrency);
    updateExchangeRates(customRates);
    toast.success('Currency settings saved successfully!');
    onClose();
  };

  const handleRefreshRates = async () => {
    setIsUpdatingRates(true);
    try {
      // In a real app, you would fetch from a currency API
      // For demo purposes, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate updated rates with small variations
      const updatedRates = { ...EXCHANGE_RATES };
      Object.keys(updatedRates).forEach(currency => {
        if (currency !== 'USD') {
          const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
          updatedRates[currency] *= (1 + variation);
        }
      });
      
      setCustomRates(updatedRates);
      updateExchangeRates(updatedRates);
      toast.success('Exchange rates updated successfully!');
    } catch (error) {
      toast.error('Failed to update exchange rates');
    } finally {
      setIsUpdatingRates(false);
    }
  };

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    const fromRate = customRates[fromCurrency] || 1;
    const toRate = customRates[toCurrency] || 1;
    return (amount / fromRate) * toRate;
  };

  const getCurrencyIcon = (currencyCode) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    const IconComponent = currency?.icon || DollarSign;
    return <IconComponent className="w-5 h-5" />;
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Currency Settings</h2>
              <p className="text-green-100">Manage your currencies and exchange rates</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Multi-Currency Toggle */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Multi-Currency Support</h3>
                <p className="text-gray-600 mt-1">
                  Enable support for multiple currencies in your transactions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={multiCurrencyEnabled}
                  onChange={(e) => setMultiCurrencyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Default Currency Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Currency</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CURRENCIES.map(currency => (
                <motion.button
                  key={currency.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCurrency(currency.code)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedCurrency === currency.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedCurrency === currency.code ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getCurrencyIcon(currency.code)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{currency.code}</div>
                      <div className="text-sm text-gray-500">{currency.symbol}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Exchange Rates */}
          {multiCurrencyEnabled && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Exchange Rates</h3>
                <button
                  onClick={handleRefreshRates}
                  disabled={isUpdatingRates}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isUpdatingRates ? 'animate-spin' : ''}`} />
                  <span>{isUpdatingRates ? 'Updating...' : 'Refresh Rates'}</span>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-3">
                  Base currency: {selectedCurrency} = 1.00
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CURRENCIES.filter(c => c.code !== selectedCurrency).map(currency => (
                    <div key={currency.code} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getCurrencyIcon(currency.code)}
                        <span className="font-medium">{currency.code}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {convertAmount(1, selectedCurrency, currency.code).toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500">{currency.symbol}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Currency Converter */}
          {multiCurrencyEnabled && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Converter</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="converter-amount"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRightLeft className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Converted Amount</div>
                    <div className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium">
                      0.00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Currency Formatting */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Display</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">Format Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income:</span>
                    <span className="text-green-600 font-medium">+$1,234.56</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expense:</span>
                    <span className="text-red-600 font-medium">-$456.78</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className="text-gray-900 font-medium">$777.78</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Show currency symbol</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Use thousands separator</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Show currency code</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}