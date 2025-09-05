import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Smartphone,
  Banknote,
  HandCoins
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormatters } from "../hooks/useFormatters";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dailySalesReport, setDailySalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { formatCurrency, formatDateTime } = useFormatters();

  useEffect(() => {
    fetchAnalytics();
    fetchDailySalesReport();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/dashboard`);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySalesReport = async () => {
    try {
      const response = await axios.get(`${API}/analytics/daily-sales-report`);
      setDailySalesReport(response.data);
    } catch (error) {
      console.error("Error fetching daily sales report:", error);
    }
  };

  // Payment method icons and colors
  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return { icon: Banknote, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'card':
        return { icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'upi':
        return { icon: Smartphone, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'credit':
        return { icon: HandCoins, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      default:
        return { icon: DollarSign, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {formatDateTime(new Date())}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dailySalesReport?.summary?.total_revenue || analytics?.today_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailySalesReport?.summary?.total_transactions || analytics?.today_transactions || 0} transactions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_patients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_medicines || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              In inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics?.low_stock_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need restock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Report with Payment Classification */}
      {dailySalesReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Today's Sales Report by Payment Method
            </CardTitle>
            <p className="text-sm text-gray-600">
              {dailySalesReport.date} • Average Transaction: {formatCurrency(dailySalesReport.summary.avg_transaction_value)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(dailySalesReport.payment_breakdown).map(([method, data]) => {
                const { icon: Icon, color, bgColor } = getPaymentMethodIcon(method);
                
                if (data.count === 0) return null; // Don't show payment methods with 0 transactions
                
                return (
                  <div key={method} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-full ${bgColor}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 uppercase">
                        {method}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(data.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.count} transaction{data.count !== 1 ? 's' : ''} 
                        <span className="text-gray-400 ml-1">
                          ({data.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {formatCurrency(data.avg_transaction)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Transactions Details */}
            {dailySalesReport.summary.total_transactions > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Recent Transactions</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(dailySalesReport.payment_breakdown)
                    .filter(([method, data]) => data.transactions.length > 0)
                    .map(([method, data]) => 
                      data.transactions.slice(0, 3).map((transaction, idx) => {
                        const { icon: Icon, color } = getPaymentMethodIcon(method);
                        return (
                          <div key={`${method}-${idx}`} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <Icon className={`h-4 w-4 ${color}`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {transaction.patient_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {transaction.items_count} item{transaction.items_count !== 1 ? 's' : ''} • {method.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                </div>
              </div>
            )}

            {dailySalesReport.summary.total_transactions === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No sales transactions today</p>
                <p className="text-sm">Start by creating a new sale!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Selling Medicines and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Selling Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.top_selling_medicines?.length ? (
                analytics.top_selling_medicines.map((medicine, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{medicine.medicine_name}</p>
                      <p className="text-sm text-gray-500">
                        {medicine.quantity} units sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(medicine.revenue)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No sales data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/pos')}
                className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <ShoppingCart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">New Sale</span>
              </button>
              <button 
                onClick={() => navigate('/medicines')}
                className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">Add Medicine</span>
              </button>
              <button 
                onClick={() => navigate('/patients')}
                className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">Add Patient</span>
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
              >
                <TrendingUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">View Analytics</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;