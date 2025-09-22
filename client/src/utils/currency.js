// Enhanced currency formatter with multiple currency support
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined) return formatCurrency(0, currency, locale);
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(Number(amount));
};

// Legacy support
export const formatINR = (n) => formatCurrency(n, 'INR', 'en-IN');

// Format for display with different styling for positive/negative
export const formatAmount = (amount, currency = 'INR', options = {}) => {
  const { 
    showSign = true, 
    showPlus = false,
    locale = 'en-IN'
  } = options;
  
  const absAmount = Math.abs(amount);
  const formatted = formatCurrency(absAmount, currency, locale);
  
  if (!showSign) return formatted;
  
  if (amount > 0) {
    return showPlus ? `+${formatted}` : formatted;
  } else if (amount < 0) {
    return `-${formatted}`;
  }
  
  return formatted;
};

// Parse currency string back to number
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and formatting
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// Get currency symbol
export const getCurrencySymbol = (currency = 'INR', locale = 'en-IN') => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });
  
  const parts = formatter.formatToParts(0);
  const symbol = parts.find(part => part.type === 'currency');
  return symbol ? symbol.value : currency;
};

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];
