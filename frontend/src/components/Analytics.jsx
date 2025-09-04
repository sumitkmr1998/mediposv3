import React, { useState, useEffect } from 'react';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    LineElement,
    PointElement,
    Title, 
    Tooltip, 
    Legend,
    ArcElement 
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { format, startOfToday, startOfYesterday, endOfYesterday, startOfWeek, startOfMonth, endOfToday } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Analytics = () => {
    const [dateRange, setDateRange] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Data states
    const [comprehensiveData, setComprehensiveData] = useState(null);
    const [monthlyComparison, setMonthlyComparison] = useState(null);
    const [yearlyComparison, setYearlyComparison] = useState(null);
    const [kpis, setKpis] = useState(null);

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

    // Date range presets
    const getDateRangeParams = () => {
        const today = startOfToday();
        const yesterday = startOfYesterday();
        
        switch (dateRange) {
            case 'today':
                return { date_range: 'today' };
            case 'yesterday':
                return { date_range: 'yesterday' };
            case 'this_week':
                return { date_range: 'this_week' };
            case 'this_month':
                return { date_range: 'this_month' };
            case 'custom':
                return { 
                    date_range: 'custom',
                    start_date: customStartDate,
                    end_date: customEndDate
                };
            default:
                return { date_range: 'this_month' };
        }
    };

    // Fetch comprehensive analytics
    const fetchComprehensiveAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(getDateRangeParams());
            const response = await fetch(`${backendUrl}/api/analytics/comprehensive?${params}`);
            const data = await response.json();
            setComprehensiveData(data);
        } catch (error) {
            console.error('Error fetching comprehensive analytics:', error);
        }
        setLoading(false);
    };

    // Fetch monthly comparison
    const fetchMonthlyComparison = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/analytics/monthly-comparison?months=12`);
            const data = await response.json();
            setMonthlyComparison(data);
        } catch (error) {
            console.error('Error fetching monthly comparison:', error);
        }
    };

    // Fetch yearly comparison
    const fetchYearlyComparison = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/analytics/yearly-comparison?years=3`);
            const data = await response.json();
            setYearlyComparison(data);
        } catch (error) {
            console.error('Error fetching yearly comparison:', error);
        }
    };

    // Fetch KPIs
    const fetchKPIs = async () => {
        try {
            const params = new URLSearchParams(getDateRangeParams());
            const response = await fetch(`${backendUrl}/api/analytics/kpis?${params}`);
            const data = await response.json();
            setKpis(data);
        } catch (error) {
            console.error('Error fetching KPIs:', error);
        }
    };

    // Export functionality
    const handleExport = async (exportType) => {
        try {
            const params = new URLSearchParams({
                ...getDateRangeParams(),
                export_type: exportType
            });
            const response = await fetch(`${backendUrl}/api/analytics/export-data?${params}`);
            const data = await response.json();
            
            // Create and download JSON file (can be enhanced to Excel/PDF later)
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_${exportType}_${format(new Date(), 'yyyy-MM-dd')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    useEffect(() => {
        fetchComprehensiveAnalytics();
        fetchKPIs();
    }, [dateRange, customStartDate, customEndDate]);

    useEffect(() => {
        fetchMonthlyComparison();
        fetchYearlyComparison();
    }, []);

    // KPI Card Component
    const KPICard = ({ title, value, change, icon: Icon, color = "blue" }) => (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">${value?.toLocaleString() || '0'}</p>
                    {change !== undefined && (
                        <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 bg-${color}-100 rounded-full`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );

    // Chart configurations
    const getMonthlyComparisonChart = () => {
        if (!monthlyComparison?.monthly_data) return null;

        const data = monthlyComparison.monthly_data.slice(0, 6).reverse(); // Last 6 months
        
        return {
            labels: data.map(item => item.month_name),
            datasets: [
                {
                    label: 'Medicine Revenue',
                    data: data.map(item => item.medicine_revenue),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                },
                {
                    label: 'Consultation Revenue',
                    data: data.map(item => item.consultation_revenue),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }
            ]
        };
    };

    const getPaymentBreakdownChart = () => {
        if (!comprehensiveData?.payment_breakdown) return null;

        const payments = comprehensiveData.payment_breakdown;
        const labels = Object.keys(payments).map(key => key.charAt(0).toUpperCase() + key.slice(1));
        const data = Object.values(payments).map(payment => payment.amount);

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)'
                ],
                borderWidth: 1
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Revenue Analysis'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    if (loading && !comprehensiveData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                    <p className="text-gray-600 mt-2">Comprehensive insights into your pharmacy operations</p>
                </div>
                
                {/* Export Buttons */}
                <div className="flex space-x-2 mt-4 md:mt-0">
                    <button
                        onClick={() => handleExport('comprehensive')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                    </button>
                    <button
                        onClick={() => handleExport('medicine_analysis')}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Medicine Analysis
                    </button>
                </div>
            </div>

            {/* Date Range Selector */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Date Range:</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {['today', 'yesterday', 'this_week', 'this_month', 'custom'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    dateRange === range
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1).replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {dateRange === 'custom' && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: 'Overview', icon: TrendingUp },
                            { id: 'medicines', name: 'Medicine Analysis', icon: Package },
                            { id: 'comparisons', name: 'Comparisons', icon: ShoppingCart }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* KPIs */}
                            {kpis && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <KPICard
                                        title="Total Revenue"
                                        value={kpis.revenue_kpis.total_revenue.current}
                                        change={kpis.revenue_kpis.total_revenue.growth}
                                        icon={DollarSign}
                                        color="blue"
                                    />
                                    <KPICard
                                        title="Medicine Revenue"
                                        value={kpis.revenue_kpis.medicine_revenue.current}
                                        change={kpis.revenue_kpis.medicine_revenue.growth}
                                        icon={Package}
                                        color="green"
                                    />
                                    <KPICard
                                        title="Consultation Revenue"
                                        value={kpis.revenue_kpis.consultation_revenue.current}
                                        change={kpis.revenue_kpis.consultation_revenue.growth}
                                        icon={Users}
                                        color="purple"
                                    />
                                    <KPICard
                                        title="Transactions"
                                        value={kpis.transaction_kpis.total_transactions.current}
                                        change={kpis.transaction_kpis.total_transactions.growth}
                                        icon={ShoppingCart}
                                        color="orange"
                                    />
                                </div>
                            )}

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Monthly Comparison Chart */}
                                {monthlyComparison && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
                                        <Bar data={getMonthlyComparisonChart()} options={chartOptions} />
                                    </div>
                                )}

                                {/* Payment Breakdown Chart */}
                                {comprehensiveData?.payment_breakdown && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                                        <Pie data={getPaymentBreakdownChart()} />
                                    </div>
                                )}
                            </div>

                            {/* Summary Stats */}
                            {comprehensiveData && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-900">Revenue Summary</h4>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <div>Total: ${comprehensiveData.summary.total_revenue.toLocaleString()}</div>
                                            <div>Medicine: ${comprehensiveData.summary.medicine_revenue.toLocaleString()}</div>
                                            <div>Consultation: ${comprehensiveData.summary.consultation_revenue.toLocaleString()}</div>
                                            <div>Profit Margin: {comprehensiveData.summary.profit_margin.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-green-900">Transaction Summary</h4>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <div>Sales: {comprehensiveData.summary.total_transactions}</div>
                                            <div>Consultations: {comprehensiveData.summary.total_consultations}</div>
                                            <div>Avg Transaction: ${(comprehensiveData.summary.medicine_revenue / comprehensiveData.summary.total_transactions || 0).toFixed(2)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-purple-900">Profitability</h4>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <div>Total Cost: ${comprehensiveData.summary.total_cost.toLocaleString()}</div>
                                            <div>Total Profit: ${comprehensiveData.summary.total_profit.toLocaleString()}</div>
                                            <div>Margin: {comprehensiveData.summary.profit_margin.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Medicine Analysis Tab */}
                    {activeTab === 'medicines' && comprehensiveData && (
                        <div className="space-y-6">
                            {/* Top Medicines Table */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Top Performing Medicines</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {comprehensiveData.medicine_analysis.slice(0, 10).map((medicine, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{medicine.medicine_name}</div>
                                                        <div className="text-sm text-gray-500">{medicine.generic_name}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {medicine.manufacturer}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {medicine.quantity}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ${medicine.revenue.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ${medicine.profit.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            medicine.profit_margin > 50 
                                                                ? 'bg-green-100 text-green-800'
                                                                : medicine.profit_margin > 25
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {medicine.profit_margin.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Manufacturer Breakdown */}
                            {comprehensiveData.manufacturer_breakdown && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Manufacturer Performance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(comprehensiveData.manufacturer_breakdown).map(([manufacturer, data]) => (
                                            <div key={manufacturer} className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900">{manufacturer}</h4>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                    <div>Quantity: {data.quantity}</div>
                                                    <div>Revenue: ${data.revenue.toLocaleString()}</div>
                                                    <div>Profit: ${data.profit.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Comparisons Tab */}
                    {activeTab === 'comparisons' && (
                        <div className="space-y-6">
                            {/* Monthly Comparison Table */}
                            {monthlyComparison && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Monthly Comparison (Last 12 Months)</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Revenue</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultation Revenue</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {monthlyComparison.monthly_data.map((month, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                                                            {month.month_name}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            ${month.medicine_revenue.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            ${month.consultation_revenue.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            ${month.total_revenue.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            ${month.profit.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {month.transaction_count}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Yearly Comparison */}
                            {yearlyComparison && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Year-over-Year Comparison</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {yearlyComparison.yearly_data.map((year) => (
                                            <div key={year.year} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                                                <h4 className="text-xl font-bold text-blue-900 mb-4">{year.year}</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700">Medicine Revenue:</span>
                                                        <span className="font-semibold">${year.medicine_revenue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700">Consultation Revenue:</span>
                                                        <span className="font-semibold">${year.consultation_revenue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-blue-200 pt-2">
                                                        <span className="text-blue-900 font-medium">Total Revenue:</span>
                                                        <span className="font-bold text-lg">${year.total_revenue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700">Profit:</span>
                                                        <span className="font-semibold text-green-600">${year.profit.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700">Transactions:</span>
                                                        <span className="font-semibold">{year.transaction_count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;