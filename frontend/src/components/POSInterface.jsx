import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useFormatters } from "../hooks/useFormatters";
import { 
  ShoppingCart, 
  Search, 
  User, 
  Percent, 
  CreditCard, 
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  History,
  Keyboard,
  X,
  DollarSign,
  ArrowLeft,
  Save,
  Receipt,
  AlertCircle,
  Zap,
  Edit3,
  RefreshCw
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const POSInterface = () => {
  // Get formatters from settings context
  const { 
    formatCurrency, 
    formatNumber, 
    formatDateTime, 
    calculateTax, 
    generateReceiptData,
    taxRate,
    currency,
    shopName,
    shopAddress,
    shopPhone
  } = useFormatters();
  // State management
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage"); // percentage or fixed
  const [tax, setTax] = useState(taxRate); // Use tax rate from settings
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showPreviousSales, setShowPreviousSales] = useState(false);
  const [previousSales, setPreviousSales] = useState([]);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [mode, setMode] = useState("sale"); // sale or return
  const [receivedAmount, setReceivedAmount] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  
  // New states for improved medicine search workflow
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(-1);
  const [isQuantityInput, setIsQuantityInput] = useState(false);
  const [tempQuantity, setTempQuantity] = useState("1");
  const [selectedMedicineForQuantity, setSelectedMedicineForQuantity] = useState(null);

  // New states for inline quantity editing
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [editQuantityValue, setEditQuantityValue] = useState("");

  // Refs for keyboard navigation
  const searchInputRef = useRef(null);
  const patientSearchRef = useRef(null);
  const discountInputRef = useRef(null);
  const receivedAmountRef = useRef(null);
  const quantityInputRef = useRef(null);
  const medicineDropdownRef = useRef(null);
  const editQuantityRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchMedicines();
    fetchPatients();
    
    // Check URL parameters for loading sale data
    const urlParams = new URLSearchParams(window.location.search);
    const loadSaleData = urlParams.get('loadSale');
    const patientData = urlParams.get('patient');
    
    if (loadSaleData && patientData) {
      try {
        const sale = JSON.parse(decodeURIComponent(loadSaleData));
        const patient = JSON.parse(decodeURIComponent(patientData));
        
        // Set patient
        setSelectedPatient(patient);
        
        // Load sale items after medicines are loaded
        setTimeout(() => {
          loadPreviousSaleFromURL(sale);
        }, 1000);
      } catch (error) {
        console.error("Error loading sale from URL:", error);
      }
    }
  }, []);

  // Function to refresh medicine quantities after a sale
  const refreshMedicineQuantities = async () => {
    try {
      const response = await axios.get(`${API}/medicines`);
      setMedicines(response.data);
    } catch (error) {
      console.error("Error refreshing medicine quantities:", error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Handle quantity input mode specially
      if (isQuantityInput) {
        handleQuantityInputKeyboard(e);
        return;
      }

      // Handle medicine dropdown navigation
      if (showMedicineDropdown) {
        handleMedicineDropdownKeyboard(e);
        return;
      }

      // Prevent if typing in input fields, except for F keys and special shortcuts
      if (e.target.tagName === 'INPUT' && !e.ctrlKey && !e.altKey && !e.key.startsWith('F')) return;

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
        case 'F2':
          e.preventDefault();
          handleF2Search();
          break;
        case 'F3':
          e.preventDefault();
          setShowPatientSearch(!showPatientSearch);
          break;
        case 'F4':
          e.preventDefault();
          if (selectedPatient) {
            setShowPreviousSales(!showPreviousSales);
          }
          break;
        case 'F5':
          e.preventDefault();
          discountInputRef.current?.focus();
          break;
        case 'F8':
          e.preventDefault();
          if (cartItems.length > 0) {
            setShowCheckout(true);
            setTimeout(() => receivedAmountRef.current?.focus(), 100);
          }
          break;
        case 'F9':
          e.preventDefault();
          setMode(mode === "sale" ? "return" : "sale");
          break;
        case 'F10':
          e.preventDefault();
          clearCart();
          break;
        case 'Escape':
          e.preventDefault();
          handleEscape();
          break;
        case 'Tab':
          // Only allow tab navigation within POS
          handleTabNavigation(e);
          break;
      }

      // Ctrl + shortcuts
      if (e.ctrlKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (cartItems.length > 0) {
              handleCompleteSale();
            }
            break;
          case 'p':
            e.preventDefault();
            setShowPatientSearch(!showPatientSearch);
            break;
          case 'h':
            e.preventDefault();
            if (selectedPatient) {
              setShowPreviousSales(!showPreviousSales);
            }
            break;
          case 'n':
            e.preventDefault();
            clearCart();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [showKeyboardHelp, showPatientSearch, showPreviousSales, selectedPatient, cartItems, mode, showCheckout, showMedicineDropdown, selectedMedicineIndex, isQuantityInput]);

  // Helper functions for new keyboard workflow
  const handleF2Search = () => {
    if (isQuantityInput) {
      return; // Don't interrupt quantity input
    }
    
    setSearchTerm("");
    setSelectedMedicineIndex(-1);
    setShowMedicineDropdown(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleMedicineDropdownKeyboard = (e) => {
    const filteredMeds = filteredMedicines.filter(med => med.stock_quantity > 0);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMedicineIndex(prev => 
          prev < filteredMeds.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMedicineIndex(prev => 
          prev > 0 ? prev - 1 : filteredMeds.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        // If no item is selected, select the first one
        const indexToSelect = selectedMedicineIndex >= 0 ? selectedMedicineIndex : 0;
        if (filteredMeds[indexToSelect]) {
          selectMedicineForQuantity(filteredMeds[indexToSelect]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMedicineDropdown(false);
        setSelectedMedicineIndex(-1);
        setSearchTerm("");
        break;
      case 'F2':
        e.preventDefault();
        handleF2Search();
        break;
    }
  };

  const handleQuantityInputKeyboard = (e) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        confirmQuantityAndAddToCart();
        break;
      case 'Escape':
        e.preventDefault();
        cancelQuantityInput();
        break;
      case 'F2':
        e.preventDefault();
        confirmQuantityAndAddToCart();
        handleF2Search();
        break;
    }
  };

  const selectMedicineForQuantity = (medicine) => {
    setSelectedMedicineForQuantity(medicine);
    setShowMedicineDropdown(false);
    setIsQuantityInput(true);
    setTempQuantity("1");
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 100);
  };

  const confirmQuantityAndAddToCart = () => {
    if (selectedMedicineForQuantity) {
      // Get quantity directly from the input field to avoid React state timing issues
      const inputQuantity = quantityInputRef.current?.value || tempQuantity;
      const quantity = parseInt(inputQuantity) || 1;
      addToCart(selectedMedicineForQuantity, quantity);
      resetMedicineSearch();
    }
  };

  const cancelQuantityInput = () => {
    resetMedicineSearch();
  };

  const resetMedicineSearch = () => {
    setIsQuantityInput(false);
    setSelectedMedicineForQuantity(null);
    setTempQuantity("1");
    setSearchTerm("");
    setSelectedMedicineIndex(-1);
    setShowMedicineDropdown(false);
  };

  const handleEscape = () => {
    if (isQuantityInput) {
      cancelQuantityInput();
    } else if (showMedicineDropdown) {
      setShowMedicineDropdown(false);
      setSelectedMedicineIndex(-1);
    } else {
      setShowPatientSearch(false);
      setShowPreviousSales(false);
      setShowKeyboardHelp(false);
      setShowCheckout(false);
      setEditingQuantity(null);
    }
  };

  const handleTabNavigation = (e) => {
    // Get all focusable elements within POS interface
    const posElements = [
      searchInputRef.current,
      discountInputRef.current,
      receivedAmountRef.current,
      // Add more POS-specific elements as needed
    ].filter(Boolean);

    if (posElements.length === 0) return;

    const currentIndex = posElements.findIndex(el => el === document.activeElement);
    
    if (e.shiftKey) {
      // Shift+Tab - go backwards
      e.preventDefault();
      const prevIndex = currentIndex <= 0 ? posElements.length - 1 : currentIndex - 1;
      posElements[prevIndex]?.focus();
    } else {
      // Tab - go forwards
      e.preventDefault();
      const nextIndex = currentIndex >= posElements.length - 1 ? 0 : currentIndex + 1;
      posElements[nextIndex]?.focus();
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${API}/medicines`);
      setMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API}/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchPreviousSales = async (patientId) => {
    try {
      const response = await axios.get(`${API}/sales/patient/${patientId}`);
      setPreviousSales(response.data.slice(0, 10)); // Last 10 sales
    } catch (error) {
      console.error("Error fetching previous sales:", error);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearchTerm("");
    setShowPatientSearch(false);
    fetchPreviousSales(patient.id);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setPreviousSales([]);
  };

  const addToCart = (medicine, quantity = 1) => {
    const existingItem = cartItems.find(item => item.medicine_id === medicine.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (mode === "sale" && newQuantity > medicine.stock_quantity) {
        alert("Not enough stock available");
        return;
      }
      updateQuantity(medicine.id, newQuantity);
    } else {
      if (mode === "sale" && quantity > medicine.stock_quantity) {
        alert("Not enough stock available");
        return;
      }
      
      const newItem = {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        quantity: quantity,
        unit_price: medicine.selling_price,
        total_price: medicine.selling_price * quantity,
        max_stock: medicine.stock_quantity
      };
      
      setCartItems([...cartItems, newItem]);
    }
  };

  // Enhanced quantity update with stock validation
  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines.find(m => m.id === medicineId);
    if (mode === "sale" && newQuantity > medicine.stock_quantity) {
      alert("Not enough stock available");
      return;
    }

    setCartItems(cartItems.map(item => 
      item.medicine_id === medicineId 
        ? { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price }
        : item
    ));
  };

  // Inline quantity editing functions
  const startEditingQuantity = (medicineId, currentQuantity) => {
    setEditingQuantity(medicineId);
    setEditQuantityValue(currentQuantity.toString());
    setTimeout(() => {
      editQuantityRef.current?.focus();
      editQuantityRef.current?.select();
    }, 100);
  };

  const confirmEditQuantity = (medicineId) => {
    const newQuantity = parseInt(editQuantityValue) || 1;
    updateQuantity(medicineId, newQuantity);
    setEditingQuantity(null);
    setEditQuantityValue("");
  };

  const cancelEditQuantity = () => {
    setEditingQuantity(null);
    setEditQuantityValue("");
  };

  const removeFromCart = (medicineId) => {
    setCartItems(cartItems.filter(item => item.medicine_id !== medicineId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
    setReceivedAmount("");
    setShowCheckout(false);
  };

  const loadPreviousSale = (sale) => {
    const items = sale.items.map(item => ({
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      max_stock: medicines.find(m => m.id === item.medicine_id)?.stock_quantity || 0
    }));
    
    setCartItems(items);
    setDiscount(sale.discount_amount);
    setTax(sale.tax_amount);
    setPaymentMethod(sale.payment_method);
    setShowPreviousSales(false);
    alert("Previous sale loaded into cart");
  };

  const loadPreviousSaleFromURL = (sale) => {
    const items = sale.items.map(item => ({
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      max_stock: medicines.find(m => m.id === item.medicine_id)?.stock_quantity || 0
    }));
    
    setCartItems(items);
    setDiscount(sale.discount_amount || 0);
    setTax(sale.tax_amount || 10);
    setPaymentMethod(sale.payment_method || "cash");
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    alert("Sale loaded from Patient Management - ready for new transaction!");
  };

  // Enhanced calculation with proper rounding using settings
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
    
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;
    const total = subtotal - discountAmount + taxAmount;

    const received = parseFloat(receivedAmount) || 0;
    const change = received - total;

    return {
      subtotal: parseFloat(formatNumber(subtotal)),
      discountAmount: parseFloat(formatNumber(discountAmount)),
      taxAmount: parseFloat(formatNumber(taxAmount)),
      total: parseFloat(formatNumber(total)),
      received: parseFloat(formatNumber(received)),
      change: parseFloat(formatNumber(change))
    };
  };

  const showPrintReceipt = (responseData, transactionData, totals, type, reason = null) => {
    const receiptData = generateReceiptData(cartItems, totals, {
      received: totals.received,
      change: totals.change
    });

    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${type === 'sale' ? 'Sale' : 'Return'} Receipt</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.4;
            font-size: 12px;
        }
        .receipt-header { 
            text-align: center; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px; 
            margin-bottom: 15px;
        }
        .receipt-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .receipt-details { 
            margin-bottom: 15px; 
        }
        .receipt-items { 
            border-bottom: 1px solid #000; 
            padding-bottom: 10px; 
            margin-bottom: 10px;
        }
        .item-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 3px;
        }
        .receipt-totals { 
            margin-bottom: 15px; 
        }
        .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 3px;
        }
        .grand-total { 
            font-weight: bold; 
            font-size: 14px; 
            border-top: 1px solid #000; 
            padding-top: 5px;
        }
        .receipt-footer { 
            text-align: center; 
            margin-top: 20px; 
            font-style: italic;
        }
        .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        @media print {
            .print-button { display: none; }
            body { margin: 0; padding: 10px; }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
    
    <div class="receipt-header">
        <div class="receipt-title">${receiptData.header.shopName}</div>
        <div>${receiptData.header.address}</div>
        <div>${receiptData.header.phone}</div>
        <div style="margin-top: 10px;">${type === 'sale' ? 'SALE RECEIPT' : 'RETURN RECEIPT'}</div>
    </div>
    
    <div class="receipt-details">
        <div><strong>Receipt ID:</strong> ${responseData.id.slice(-8)}</div>
        <div><strong>Date & Time:</strong> ${receiptData.footer.dateTime}</div>
        <div><strong>Customer:</strong> ${transactionData.patient_name}</div>
        <div><strong>${type === 'sale' ? 'Payment Method' : 'Refund Method'}:</strong> ${(transactionData.payment_method || transactionData.refund_method).toUpperCase()}</div>
        ${reason ? `<div><strong>Return Reason:</strong> ${reason}</div>` : ''}
        ${type === 'return' && transactionData.original_sale_id ? `<div><strong>Original Sale ID:</strong> ${transactionData.original_sale_id.slice(-8)}</div>` : ''}
    </div>
    
    <div class="receipt-items">
        <div style="font-weight: bold; margin-bottom: 5px;">Items:</div>
        ${receiptData.items.map(item => `
            <div class="item-row">
                <span>${item.medicine_name} x${item.formattedQuantity}</span>
                <span>${item.formattedTotalPrice}</span>
            </div>
        `).join('')}
    </div>
    
    <div class="receipt-totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${receiptData.totals.subtotal}</span>
        </div>
        <div class="total-row">
            <span>Discount:</span>
            <span>-${receiptData.totals.discount}</span>
        </div>
        <div class="total-row">
            <span>Tax:</span>
            <span>+${receiptData.totals.tax}</span>
        </div>
        <div class="total-row grand-total">
            <span>${type === 'sale' ? 'TOTAL' : 'REFUND TOTAL'}:</span>
            <span>${receiptData.totals.total}</span>
        </div>
        ${type === 'sale' && paymentMethod === 'cash' && receiptData.totals.received ? `
            <div class="total-row">
                <span>Received:</span>
                <span>${receiptData.totals.received}</span>
            </div>
            <div class="total-row">
                <span>Change:</span>
                <span>${receiptData.totals.change}</span>
            </div>
        ` : ''}
    </div>
    
    <div class="receipt-footer">
        <div>${receiptData.footer.message}</div>
        <div style="margin-top: 10px; font-size: 10px;">
            Generated by MediPOS System
        </div>
        ${type === 'return' ? '<div style="margin-top: 5px;">Items returned to inventory</div>' : ''}
    </div>
</body>
</html>
    `;

    // Open receipt in new window for printing
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    
    // Auto-focus for printing
    receiptWindow.focus();
    
    // Optional: Auto-print after a short delay
    setTimeout(() => {
      receiptWindow.print();
    }, 500);
  };

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      alert("Please add items to cart");
      return;
    }

    if (mode === "sale" && paymentMethod === "cash" && parseFloat(receivedAmount) < parseFloat(calculateTotals().total)) {
      alert("Received amount is less than total amount");
      return;
    }

    const totals = calculateTotals();
    
    if (mode === "sale") {
      // Regular sale
      const saleData = {
        patient_id: selectedPatient?.id || null,
        patient_name: selectedPatient ? selectedPatient.name : "Walk-in Customer",
        items: cartItems,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.total,
        payment_method: paymentMethod
      };

      try {
        const response = await axios.post(`${API}/sales`, saleData);
        
        // Show print receipt
        showPrintReceipt(response.data, saleData, totals, "sale");
        
        // Refresh medicine quantities in real-time
        await refreshMedicineQuantities();
        
        clearCart();
        setSelectedPatient(null);
        
      } catch (error) {
        console.error("Error completing sale:", error);
        alert("Error completing sale: " + (error.response?.data?.detail || "Unknown error"));
      }
    } else {
      // Return/Refund
      const returnReason = prompt("Please enter reason for return:");
      if (!returnReason) return;

      const returnData = {
        original_sale_id: prompt("Enter original sale ID for return:"),
        patient_id: selectedPatient?.id || null,
        patient_name: selectedPatient ? selectedPatient.name : "Walk-in Customer",
        items: cartItems,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.total,
        reason: returnReason,
        refund_method: paymentMethod
      };

      if (!returnData.original_sale_id) {
        alert("Original sale ID is required for returns");
        return;
      }

      try {
        const response = await axios.post(`${API}/returns`, returnData);
        
        // Show print receipt
        showPrintReceipt(response.data, returnData, totals, "return", returnReason);
        
        // Refresh medicine quantities in real-time
        await refreshMedicineQuantities();
        
        clearCart();
        setSelectedPatient(null);
        
      } catch (error) {
        console.error("Error processing return:", error);
        alert("Error processing return: " + (error.response?.data?.detail || "Unknown error"));
      }
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.generic_name && medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(patientSearchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Product Search & Cart */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                POS - {mode === "sale" ? "Sale" : "Return"}
              </h1>
              <Badge className={mode === "sale" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {mode.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshMedicineQuantities}
                title="Refresh Medicine Quantities"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Stock
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMode(mode === "sale" ? "return" : "sale")}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                {mode === "sale" ? "Switch to Return" : "Switch to Sale"} (F9)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowKeyboardHelp(true)}
              >
                <Keyboard className="h-4 w-4 mr-1" />
                Shortcuts (F1)
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="bg-white p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium">Customer:</Label>
              {selectedPatient ? (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    <User className="h-3 w-3 mr-1" />
                    {selectedPatient.name}
                  </Badge>
                  <span className="text-sm text-gray-600">{selectedPatient.phone}</span>
                  <Button variant="ghost" size="sm" onClick={clearPatient}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Badge className="bg-gray-100 text-gray-600">Walk-in Customer</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPatientSearch(true)}
              >
                <Search className="h-4 w-4 mr-1" />
                Select Customer (F3)
              </Button>
              {selectedPatient && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreviousSales(true)}
                >
                  <History className="h-4 w-4 mr-1" />
                  Previous Sales (F4)
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Product Search */}
          <div className="flex-1 p-4">
            <div className="mb-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search medicines... (F2)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.trim()) {
                      setShowMedicineDropdown(true);
                      // Auto-select first item when user types
                      setSelectedMedicineIndex(0);
                    } else {
                      setShowMedicineDropdown(false);
                      setSelectedMedicineIndex(-1);
                    }
                  }}
                  onFocus={() => {
                    if (searchTerm.trim()) {
                      setShowMedicineDropdown(true);
                      setSelectedMedicineIndex(0);
                    }
                  }}
                  className="pl-10 text-lg py-3"
                />
              </div>

              {/* Medicine Dropdown */}
              {showMedicineDropdown && (
                <div 
                  ref={medicineDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
                >
                  {filteredMedicines.filter(med => med.stock_quantity > 0).map((medicine, index) => (
                    <div
                      key={medicine.id}
                      className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 ${
                        index === selectedMedicineIndex ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => selectMedicineForQuantity(medicine)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm">{medicine.name}</div>
                          <div className="text-xs text-gray-600">{medicine.generic_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(medicine.selling_price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {medicine.stock_quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredMedicines.filter(med => med.stock_quantity > 0).length === 0 && (
                    <div className="p-3 text-gray-500 text-center">
                      No medicines found or out of stock
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Medicine Grid - Hidden when dropdown is active */}
            {!showMedicineDropdown && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredMedicines.map((medicine) => (
                  <Card 
                    key={medicine.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      medicine.stock_quantity === 0 ? 'opacity-50' : ''
                    }`}
                    onClick={() => medicine.stock_quantity > 0 && addToCart(medicine)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm">{medicine.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{medicine.generic_name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(medicine.selling_price)}
                        </span>
                        <Badge className={
                          medicine.stock_quantity > medicine.minimum_stock_level 
                            ? "bg-green-100 text-green-800"
                            : medicine.stock_quantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }>
                          Stock: {medicine.stock_quantity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="w-96 bg-white border-l">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear (F10)
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-2 max-h-64 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.medicine_id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.medicine_name}</h4>
                      <p className="text-xs text-gray-600">{formatCurrency(item.unit_price)} each</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.medicine_id)}
                      className="text-red-600 p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      {/* Editable Quantity Display */}
                      {editingQuantity === item.medicine_id ? (
                        <Input
                          ref={editQuantityRef}
                          type="number"
                          min="1"
                          value={editQuantityValue}
                          onChange={(e) => setEditQuantityValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              confirmEditQuantity(item.medicine_id);
                            } else if (e.key === 'Escape') {
                              cancelEditQuantity();
                            }
                          }}
                          onBlur={() => confirmEditQuantity(item.medicine_id)}
                          className="w-12 h-6 text-center text-sm p-1"
                        />
                      ) : (
                        <button
                          onClick={() => startEditingQuantity(item.medicine_id, item.quantity)}
                          className="text-sm font-medium w-8 text-center hover:bg-gray-200 px-1 py-1 rounded cursor-pointer border"
                          title="Click to edit quantity"
                        >
                          {item.quantity}
                        </button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t p-4 space-y-3">
                {/* Discount */}
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Discount:</Label>
                  <Input
                    ref={discountInputRef}
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                    min="0"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Payment:</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="flex-1 text-sm border rounded px-2 py-1"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                {/* Totals */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateTotals().subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{formatCurrency(calculateTotals().discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({tax}%):</span>
                    <span>+{formatCurrency(calculateTotals().taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotals().total)}</span>
                  </div>
                </div>

                {/* Cash Payment */}
                {paymentMethod === "cash" && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Received:</Label>
                      <Input
                        ref={receivedAmountRef}
                        type="number"
                        step="0.01"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    {receivedAmount && (
                      <div className="flex justify-between font-medium">
                        <span>Change:</span>
                        <span className={parseFloat(calculateTotals().change) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(calculateTotals().change)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Checkout Button */}
                <Button 
                  onClick={handleCompleteSale}
                  className="w-full"
                  size="lg"
                  disabled={
                    mode === "sale" && paymentMethod === "cash" && 
                    (!receivedAmount || parseFloat(receivedAmount) < parseFloat(calculateTotals().total))
                  }
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Complete {mode === "sale" ? "Sale" : "Return"} (Ctrl+Enter)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Search Modal */}
      {showPatientSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Customer</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPatientSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              ref={patientSearchRef}
              placeholder="Search patients..."
              value={patientSearchTerm}
              onChange={(e) => setPatientSearchTerm(e.target.value)}
              className="mb-4"
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => selectPatient(patient)}
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-600">{patient.phone}</div>
                  {patient.email && <div className="text-sm text-gray-600">{patient.email}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Previous Sales Modal */}
      {showPreviousSales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-2/3 max-h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Previous Sales - {selectedPatient?.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreviousSales(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {previousSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => loadPreviousSale(sale)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Sale #{sale.id.slice(-8)}</div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(new Date(sale.created_at))} - 
                        {sale.items.length} items - {formatCurrency(sale.total_amount)}
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Load to Cart
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quantity Input Modal */}
      {isQuantityInput && selectedMedicineForQuantity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Enter Quantity</h3>
              <div className="mt-2">
                <div className="font-medium">{selectedMedicineForQuantity.name}</div>
                <div className="text-sm text-gray-600">{selectedMedicineForQuantity.generic_name}</div>
                <div className="font-medium">{formatCurrency(selectedMedicineForQuantity.selling_price)} each</div>
                <div className="text-sm text-gray-500">
                  Available Stock: {selectedMedicineForQuantity.stock_quantity}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="text-sm font-medium">Quantity:</Label>
              <Input
                ref={quantityInputRef}
                type="number"
                min="1"
                max={selectedMedicineForQuantity.stock_quantity}
                value={tempQuantity}
                onChange={(e) => setTempQuantity(e.target.value)}
                className="mt-2 text-center text-lg"
                autoFocus
              />
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between text-sm">
                <span>Unit Price:</span>
                <span>{formatCurrency(selectedMedicineForQuantity.selling_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>{tempQuantity || 0}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(selectedMedicineForQuantity.selling_price * (parseInt(tempQuantity) || 0))}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={confirmQuantityAndAddToCart}
                className="flex-1"
                disabled={!tempQuantity || parseInt(tempQuantity) <= 0 || parseInt(tempQuantity) > selectedMedicineForQuantity.stock_quantity}
              >
                Add to Cart (Enter)
              </Button>
              <Button 
                variant="outline" 
                onClick={cancelQuantityInput}
              >
                Cancel (Esc)
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              Press F2 to add this item and search for another medicine
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowKeyboardHelp(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F1</span>
                <span>Show/Hide Help</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F2</span>
                <span>Search Medicine (Dropdown)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">↑/↓</span>
                <span>Navigate Medicine List</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">Enter</span>
                <span>Select Medicine/Confirm</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">Tab</span>
                <span>Navigate POS Options</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F3</span>
                <span>Select Customer</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F4</span>
                <span>Previous Sales</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F5</span>
                <span>Focus Discount</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F8</span>
                <span>Focus Payment</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F9</span>
                <span>Toggle Sale/Return</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">F10</span>
                <span>Clear Cart</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">Ctrl+Enter</span>
                <span>Complete Sale</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">Esc</span>
                <span>Close/Cancel</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <div className="font-semibold text-blue-800 mb-2">Enhanced Cart Features:</div>
              <div className="space-y-1 text-blue-700">
                <div>• Click quantity number to edit directly</div>
                <div>• Use +/- buttons for quick adjustments</div>
                <div>• Stock refreshes automatically after sales</div>
                <div>• All values are properly rounded</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSInterface;