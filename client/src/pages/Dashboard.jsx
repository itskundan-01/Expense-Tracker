import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

import { useTransactionStore } from '../store/useTransactionStore';
import { useAccountStore } from '../store/useAccountStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { formatINR } from '../utils/currency';
import { formatRelativeDate } from '../utils/dateUtils';
import Card from '../components/UI/Card';

const StatCard = ({ title, value, change, changeType, icon: Icon }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-semibold text-gray-800 dark:text-gray-100 my-2">{formatINR(value)}</p>
        <div className="flex items-center space-x-2">
          {changeType === 'positive' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <p className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </p>
        </div>
      </div>
      {Icon && (
        <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
          <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      )}
    </div>
  </Card>
);

const CategoryChart = () => {
  const { getCategoryTotals, loading } = useTransactionStore();
  const categoryTotals = getCategoryTotals();
  
  const expenseData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  if (loading) {
    return (
      <Card title="Expense Breakdown">
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          Loading expenses...
        </div>
      </Card>
    );
  }

  if (expenseData.length === 0) {
    return (
      <Card title="Expense Breakdown">
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No expense data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Expense Breakdown">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie 
            data={expenseData} 
            cx="50%" 
            cy="50%" 
            labelLine={false} 
            outerRadius={110} 
            fill="#8884d8" 
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatINR(value)} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

const TransactionList = () => {
  const { transactions, categories, loading } = useTransactionStore();
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <Card title="Recent Transactions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </Card>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <Card title="Recent Transactions">
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No transactions yet
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recent Transactions">
      <div className="space-y-3">
        {recentTransactions.map((tx) => {
          // Handle both API format (tx.category) and legacy format (categoryId lookup)
          const category = tx.category || categories.find(c => c.id === tx.categoryId);
          const isIncome = tx.type === 'INCOME' || tx.type === 'income';
          
          return (
            <div key={tx.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    isIncome ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                             : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  }`}
                >
                  {isIncome ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    {category && <span>{category.icon || '💰'}</span>}
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {category?.name || 'Unknown Category'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tx.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatRelativeDate(tx.date)}
                  </p>
                </div>
              </div>
              <p className={`font-bold ${isIncome ? 'text-green-600' : 'text-gray-800 dark:text-gray-100'}`}>
                {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(Math.abs(tx.amount))}`}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};const Dashboard = () => {
  const { 
    getTotalIncome, 
    getTotalExpenses, 
    getBalance, 
    transactions, 
    initializeData: initTransactionData, 
    loading: transactionLoading,
    error: transactionError 
  } = useTransactionStore();
  
  const { 
    budgets, 
    fetchBudgets, 
    getAllBudgetProgress, 
    loading: budgetLoading,
    error: budgetError 
  } = useBudgetStore();
  
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsInitializing(true);
        // Initialize all data in parallel
        await Promise.all([
          initTransactionData(),
          fetchBudgets()
        ]);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDashboard();
  }, [initTransactionData, fetchBudgets]);

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if data fetch failed
  if (transactionError || budgetError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-lg font-semibold mb-2">Failed to load dashboard data</p>
          <p className="text-sm">{transactionError || budgetError}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Income', 
      value: getTotalIncome(), 
      change: '+12.5%', 
      changeType: 'positive',
      icon: TrendingUp
    },
    { 
      title: 'Total Expenses', 
      value: getTotalExpenses(), 
      change: '-5.2%', 
      changeType: 'negative',
      icon: TrendingDown
    },
    { 
      title: 'Net Balance', 
      value: getBalance(), 
      change: '+8.1%', 
      changeType: 'positive',
      icon: DollarSign
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CategoryChart />
        </div>
        <div className="lg:col-span-2">
          <TransactionList />
        </div>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.slice(0, 3).map((budget) => {
            const progress = getAllBudgetProgress(transactions).find(p => p.budget.id === budget.id);
            return (
              <Card key={budget.id} title={`Budget: ${budget.category?.name || 'Unknown'}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
                    <span className="font-semibold">
                      {formatINR(progress?.spent || 0)} / {formatINR(budget.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        progress?.isOverBudget ? 'bg-red-500' : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${progress?.progress || 0}%`,
                      }}
                    />
                  </div>
                  {progress?.isOverBudget && (
                    <p className="text-xs text-red-500">Over budget!</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
