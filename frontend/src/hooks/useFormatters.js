import { useSettings } from '../contexts/SettingsContext';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatTime,
  formatDateTime,
  calculateTax,
  calculateDiscount,
  formatPhoneNumber,
  parseCurrency,
  formatStockQuantity,
  formatExpiryDate,
  generateReceiptData
} from '../utils/formatters';

/**
 * Custom hook that provides formatting functions with settings automatically applied
 */
export const useFormatters = () => {
  const { settings } = useSettings();

  return {
    // Currency formatting
    formatCurrency: (amount) => formatCurrency(amount, settings),
    parseCurrency: (currencyString) => parseCurrency(currencyString, settings),
    
    // Number formatting
    formatNumber: (number) => formatNumber(number, settings),
    formatPercentage: (percentage) => formatPercentage(percentage, settings),
    
    // Date and time formatting
    formatDate: (date) => formatDate(date, settings),
    formatTime: (date) => formatTime(date, settings),
    formatDateTime: (date) => formatDateTime(date, settings),
    
    // Calculations
    calculateTax: (amount) => calculateTax(amount, settings),
    calculateDiscount: (amount, discount, discountType) => calculateDiscount(amount, discount, discountType),
    
    // Specialized formatting
    formatPhoneNumber,
    formatStockQuantity: (quantity, minLevel) => formatStockQuantity(quantity, minLevel, settings),
    formatExpiryDate: (expiryDate) => formatExpiryDate(expiryDate, settings),
    
    // Receipt formatting
    generateReceiptData: (cartItems, totals, paymentInfo) => generateReceiptData(cartItems, totals, paymentInfo, settings),
    
    // Quick access to settings values
    currency: settings.general.currency_symbol,
    taxRate: settings.general.default_tax_rate,
    decimalPlaces: settings.general.decimal_places,
    dateFormat: settings.general.date_format,
    timeFormat: settings.general.time_format,
    shopName: settings.general.shop_name,
    shopAddress: settings.general.shop_address,
    shopPhone: settings.general.shop_phone,
  };
};

export default useFormatters;