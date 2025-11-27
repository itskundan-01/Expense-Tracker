import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Download, Calendar, TrendingUp, TrendingDown, 
  PieChart as PieIcon, BarChart3, LineChart as LineIcon 
} from 'lucide-react';
import { startOfMonth, endOfMonth, format, subMonths, parseISO } from 'date-fns';

import { useTransactionStore } from '../store/useTransactionStore';
import { formatINR } from '../utils/currency';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const ReportsPage = () => {
  const { transactions, categories, getCategoryTotals } = useTransactionStore();
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [chartType, setChartType] = useState('bar');

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const dateStr = transaction.transactionDate || transaction.date;
    if (!dateStr) return false;
    try {
      const transactionDate = parseISO(dateStr);
      const start = parseISO(dateRange.startDate);
      const end = parseISO(dateRange.endDate);
      return transactionDate >= start && transactionDate <= end;
    } catch (e) {
      return false;
    }
  });

  // Prepare monthly data for charts
  const monthlyData = {};
  filteredTransactions.forEach(transaction => {
    const dateStr = transaction.transactionDate || transaction.date;
    if (!dateStr) return;
    try {
      const month = format(parseISO(dateStr), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += Math.abs(transaction.amount);
      }
    } catch (e) {
      // Skip invalid dates
    }
  });

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month) - new Date(b.month)
  );

  // Prepare category data for pie chart
  const categoryTotals = getCategoryTotals();
  const categoryData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 categories

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#AF19FF', '#FF6B6B', '#4ECDC4', '#45B7D1'
  ];

  // Calculate summary statistics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

  // Export data function
  const exportData = () => {
    const csvData = [
      ['Date', 'Type', 'Category', 'Description', 'Amount'],
      ...filteredTransactions.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return [
          t.transactionDate || t.date || '',
          t.type || '',
          category?.name || 'Unknown',
          t.description || '',
          t.amount || 0
        ];
      })
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value, name) => [formatINR(value), name]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatINR(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value, name) => [formatINR(value), name]} />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expense" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card
        title="Financial Reports & Analytics"
        subtitle="Analyze your spending patterns and financial trends"
        actions={
          <Button onClick={exportData} variant="outline">
            <Download size={18} className="mr-2" />
            Export Data
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={chartType === 'bar' ? 'primary' : 'outline'}
                onClick={() => setChartType('bar')}
              >
                <BarChart3 size={16} />
              </Button>
              <Button
                size="sm"
                variant={chartType === 'line' ? 'primary' : 'outline'}
                onClick={() => setChartType('line')}
              >
                <LineIcon size={16} />
              </Button>
              <Button
                size="sm"
                variant={chartType === 'pie' ? 'primary' : 'outline'}
                onClick={() => setChartType('pie')}
              >
                <PieIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatINR(totalIncome)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-semibold text-red-600">
                {formatINR(totalExpenses)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Income</p>
              <p className={`text-2xl font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatINR(netIncome)}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              netIncome >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {netIncome >= 0 ? '+' : '-'}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
              <p className={`text-2xl font-semibold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              savingsRate >= 20 ? 'bg-green-100 text-green-600' :
              savingsRate >= 10 ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {savingsRate >= 20 ? '🎯' : savingsRate >= 10 ? '⚠️' : '🚨'}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card title="Financial Trends">
        {monthlyChartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            No data available for the selected date range
          </div>
        ) : (
          renderChart()
        )}
      </Card>

      {/* Category Breakdown Table */}
      {categoryData.length > 0 && (
        <Card title="Category Breakdown" subtitle="Top spending categories in selected period">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Percentage</th>
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categoryData.map((item, index) => {
                  const percentage = (item.value / totalExpenses) * 100;
                  const category = categories.find(c => c.name === item.name);
                  
                  return (
                    <tr key={item.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          {category && <span>{category.icon}</span>}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 font-semibold">{formatINR(item.value)}</td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <TrendingUp size={16} />
                          <span className="text-xs">Stable</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;