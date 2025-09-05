import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useFormatters } from "../hooks/useFormatters";
import DateRangeFilter from "./DateRangeFilter";
import { 
  Plus, 
  Search, 
  ShoppingCart,
  Trash2,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Minus,
  Eye
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SalesManagement = () => {
  // Get formatters from settings context
  const { 
    formatCurrency, 
    formatNumber, 
    formatDateTime, 
    calculateTax, 
    taxRate
  } = useFormatters();
  
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewSaleForm, setShowNewSaleForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(taxRate || 0); // Use tax rate from settings
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);

  useEffect(() => {
    fetchSales();
    fetchMedicines();
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, searchTerm, dateFilter]);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/sales`);
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${API}/medicines`);
      setMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
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

  const applyFilters = () => {
    let filtered = [...sales];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        (sale.patient_name && sale.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate + "T23:59:59");
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= startDate && saleDate <= endDate;
      });
    }

    setFilteredSales(filtered);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setShowDateFilter(false);
  };

  const addToCart = (medicine) => {
    const existingItem = cartItems.find(item => item.medicine_id === medicine.id);
    if (existingItem) {
      if (existingItem.quantity < medicine.stock_quantity) {
        setCartItems(cartItems.map(item => 
          item.medicine_id === medicine.id 
            ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
            : item
        ));
      } else {
        alert("Not enough stock available");
      }
    } else {
      if (medicine.stock_quantity > 0) {
        setCartItems([...cartItems, {
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          quantity: 1,
          unit_price: medicine.selling_price,
          total_price: medicine.selling_price
        }]);
      } else {
        alert("Medicine is out of stock");
      }
    }
  };

  const removeFromCart = (medicineId) => {
    setCartItems(cartItems.filter(item => item.medicine_id !== medicineId));
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines.find(m => m.id === medicineId);
    if (newQuantity > medicine.stock_quantity) {
      alert("Not enough stock available");
      return;
    }

    setCartItems(cartItems.map(item => 
      item.medicine_id === medicineId 
        ? { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price }
        : item
    ));
  };

  // Enhanced calculation with proper rounding using settings
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    const total = subtotal - discountAmount + taxAmount;

    return {
      subtotal: parseFloat(formatNumber(subtotal)),
      discountAmount: parseFloat(formatNumber(discountAmount)),
      taxAmount: parseFloat(formatNumber(taxAmount)),
      total: parseFloat(formatNumber(total))
    };
  };

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      alert("Please add items to cart");
      return;
    }

    const totals = calculateTotals();
    const selectedPatientData = patients.find(p => p.id === selectedPatient);

    const saleData = {
      patient_id: selectedPatient || null,
      patient_name: selectedPatientData ? selectedPatientData.name : "Walk-in Customer",
      items: cartItems,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      discount_amount: totals.discountAmount,
      total_amount: totals.total,
      payment_method: paymentMethod
    };

    try {
      await axios.post(`${API}/sales`, saleData);
      alert("Sale completed successfully!");
      fetchSales();
      resetSaleForm();
    } catch (error) {
      console.error("Error completing sale:", error);
      alert("Error completing sale: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const resetSaleForm = () => {
    setCartItems([]);
    setSelectedPatient("");
    setPaymentMethod("cash");
    setDiscount(0);
    setTax(0);
    setShowNewSaleForm(false);
  };

  const getPaymentMethodBadge = (method) => {
    const colors = {
      cash: "bg-green-100 text-green-800",
      card: "bg-blue-100 text-blue-800",
      upi: "bg-purple-100 text-purple-800",
      credit: "bg-orange-100 text-orange-800"
    };
    return colors[method] || colors.cash;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
        <Button onClick={() => setShowNewSaleForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(filteredSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-green-600">{filteredSales.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Avg. Transaction</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(filteredSales.length > 0 
                    ? filteredSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) / filteredSales.length 
                    : 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Items Sold</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredSales.reduce((sum, sale) => 
                    sum + (sale.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Plus className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
            Payment Method Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['cash', 'card', 'upi', 'credit'].map(method => {
              const methodSales = filteredSales.filter(sale => sale.payment_method === method);
              const methodTotal = methodSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
              const methodCount = methodSales.length;
              const percentage = filteredSales.length > 0 ? (methodCount / filteredSales.length * 100).toFixed(1) : 0;
              
              return (
                <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getPaymentMethodBadge(method)}`}>
                    {method.toUpperCase()}
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(methodTotal)}</p>
                  <p className="text-sm text-gray-600">{methodCount} transactions ({percentage}%)</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DateRangeFilter 
          onFilterChange={handleDateFilterChange}
          showFilter={showDateFilter}
          setShowFilter={setShowDateFilter}
          currentFilter={dateFilter}
        />
      </div>

      {/* Results Summary */}
      {(searchTerm || dateFilter) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Showing {filteredSales.length} of {sales.length} sales
                {dateFilter && (
                  <span className="ml-2 font-medium">
                    ({dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate 
                      ? `${dateFilter.startDate} to ${dateFilter.endDate}`
                      : dateFilter.type.replace('_', ' ')})
                  </span>
                )}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm("");
                setDateFilter(null);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* New Sale Form */}
      {showNewSaleForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medicine Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Medicines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {medicines.filter(m => m.stock_quantity > 0).map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{medicine.name}</h4>
                      <p className="text-sm text-gray-600">
                        Stock: {medicine.stock_quantity} | Price: {formatCurrency(medicine.selling_price)}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => addToCart(medicine)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cart & Checkout */}
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Patient Selection */}
                <div>
                  <Label htmlFor="patient">Patient (Optional)</Label>
                  <select
                    id="patient"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Walk-in Customer</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cart Items */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.medicine_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.medicine_name}</p>
                        <p className="text-xs text-gray-600">{formatCurrency(item.unit_price)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.medicine_id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium ml-2">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Details */}
                <div className="space-y-3 border-t pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax">Tax (%)</Label>
                      <Input
                        id="tax"
                        type="number"
                        min="0"
                        max="100"
                        value={tax}
                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <select
                      id="payment_method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>

                  {/* Totals */}
                  {cartItems.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateTotals().subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Discount:</span>
                        <span>-{formatCurrency(calculateTotals().discountAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>+{formatCurrency(calculateTotals().taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotals().total)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={resetSaleForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleCompleteSale} disabled={cartItems.length === 0}>
                      Complete Sale
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales List */}
      <div className="grid gap-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold">
                          Sale #{sale.id.slice(-8)}
                        </h3>
                        <Badge className={getPaymentMethodBadge(sale.payment_method)}>
                          {sale.payment_method.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-2 h-4 w-4" />
                          {sale.patient_name || "Walk-in Customer"}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDateTime(new Date(sale.created_at))}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Items: {sale.items.length} | Total: {formatCurrency(sale.total_amount)}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="ml-1 font-medium">{formatCurrency(sale.subtotal)}</span>
                        </div>
                        {sale.discount_amount > 0 && (
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <span className="ml-1 font-medium text-green-600">-{formatCurrency(sale.discount_amount)}</span>
                          </div>
                        )}
                        {sale.tax_amount > 0 && (
                          <div>
                            <span className="text-gray-500">Tax:</span>
                            <span className="ml-1 font-medium">{formatCurrency(sale.tax_amount)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Final Total:</span>
                          <span className="ml-1 font-bold text-blue-600">{formatCurrency(sale.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const items = sale.items.map(item => 
                        `${item.medicine_name} (${item.quantity}x) - ${formatCurrency(item.total_price)}`
                      ).join('\n');
                      alert(`Sale Details:\n\n${items}\n\nTotal: ${formatCurrency(sale.total_amount)}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No sales found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || dateFilter ? "Try adjusting your search terms or filters." : "Get started by creating a new sale."}
          </p>
          {!searchTerm && !dateFilter && (
            <div className="mt-6">
              <Button onClick={() => setShowNewSaleForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesManagement;