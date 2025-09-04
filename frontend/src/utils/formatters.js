// Formatting utilities that use settings context

/**
 * Format currency based on settings
 */
export const formatCurrency = (amount, settings) => {
  if (!amount && amount !== 0) return '';
  
  const currencySymbol = settings?.general?.currency_symbol || '$';
  const decimalPlaces = settings?.general?.decimal_places ?? 2;
  
  const formattedAmount = Number(amount).toFixed(decimalPlaces);
  return `${currencySymbol}${formattedAmount}`;
};

/**
 * Format number with proper decimal places
 */
export const formatNumber = (number, settings) => {
  if (!number && number !== 0) return '';
  
  const decimalPlaces = settings?.general?.decimal_places ?? 2;
  return Number(number).toFixed(decimalPlaces);
};

/**
 * Format percentage
 */
export const formatPercentage = (percentage, settings) => {
  if (!percentage && percentage !== 0) return '';
  
  const decimalPlaces = Math.max(0, (settings?.general?.decimal_places ?? 2) - 1);
  return `${Number(percentage).toFixed(decimalPlaces)}%`;
};

/**
 * Format date based on settings
 */
export const formatDate = (date, settings) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  const dateFormat = settings?.general?.date_format || 'YYYY-MM-DD';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Format time based on settings
 */
export const formatTime = (date, settings) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  const timeFormat = settings?.general?.time_format || '24';
  
  if (timeFormat === '12') {
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

/**
 * Format date and time together
 */
export const formatDateTime = (date, settings) => {
  if (!date) return '';
  
  const formattedDate = formatDate(date, settings);
  const formattedTime = formatTime(date, settings);
  
  return `${formattedDate} ${formattedTime}`;
};

/**
 * Calculate tax amount based on settings
 */
export const calculateTax = (amount, settings) => {
  const taxRate = settings?.general?.default_tax_rate || 0;
  return (amount * taxRate) / 100;
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (amount, discount, discountType = 'percentage') => {
  if (discountType === 'percentage') {
    return (amount * discount) / 100;
  } else {
    return discount;
  }
};

/**
 * Format phone number (basic formatting)
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Basic formatting for common patterns
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if no pattern matches
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString, settings) => {
  if (!currencyString) return 0;
  
  const currencySymbol = settings?.general?.currency_symbol || '$';
  
  // Remove currency symbol and any other non-numeric characters except decimal point
  const cleanedString = currencyString
    .replace(currencySymbol, '')
    .replace(/[^0-9.-]/g, '');
  
  return parseFloat(cleanedString) || 0;
};

/**
 * Format stock quantity with appropriate warnings
 */
export const formatStockQuantity = (quantity, minLevel, settings) => {
  const formattedQty = formatNumber(quantity, settings);
  
  if (quantity <= 0) {
    return { text: formattedQty, status: 'out-of-stock', color: 'text-red-600' };
  } else if (quantity <= minLevel) {
    return { text: formattedQty, status: 'low-stock', color: 'text-yellow-600' };
  } else {
    return { text: formattedQty, status: 'in-stock', color: 'text-green-600' };
  }
};

/**
 * Format medicine expiry date with warnings
 */
export const formatExpiryDate = (expiryDate, settings) => {
  if (!expiryDate) return { text: 'N/A', status: 'unknown', color: 'text-gray-500' };
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const alertDays = settings?.alerts?.expiry_alert_days || 30;
  const alertDate = new Date();
  alertDate.setDate(today.getDate() + alertDays);
  
  const formattedDate = formatDate(expiry, settings);
  
  if (expiry < today) {
    return { text: formattedDate, status: 'expired', color: 'text-red-600' };
  } else if (expiry <= alertDate) {
    return { text: formattedDate, status: 'expiring-soon', color: 'text-yellow-600' };
  } else {
    return { text: formattedDate, status: 'valid', color: 'text-green-600' };
  }
};

/**
 * Generate receipt data with proper formatting
 */
export const generateReceiptData = (cartItems, totals, paymentInfo, settings) => {
  return {
    header: {
      shopName: settings.general.shop_name,
      address: settings.general.shop_address,
      phone: settings.general.shop_phone,
      email: settings.general.shop_email,
      license: settings.general.shop_license,
    },
    items: cartItems.map(item => ({
      ...item,
      formattedUnitPrice: formatCurrency(item.unit_price, settings),
      formattedTotalPrice: formatCurrency(item.total_price, settings),
      formattedQuantity: formatNumber(item.quantity, settings)
    })),
    totals: {
      subtotal: formatCurrency(totals.subtotal, settings),
      discount: formatCurrency(totals.discountAmount, settings),
      tax: formatCurrency(totals.taxAmount, settings),
      total: formatCurrency(totals.total, settings),
      received: paymentInfo?.received ? formatCurrency(paymentInfo.received, settings) : null,
      change: paymentInfo?.change ? formatCurrency(paymentInfo.change, settings) : null,
    },
    footer: {
      message: settings.printer.receipt_footer,
      dateTime: formatDateTime(new Date(), settings),
    }
  };
};

/**
 * Currency symbol mappings
 */
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  MXN: '$',
  BRL: 'R$',
  RUB: '₽',
  ZAR: 'R',
};

/**
 * Get currency symbol by currency code
 */
export const getCurrencySymbol = (currencyCode) => {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};