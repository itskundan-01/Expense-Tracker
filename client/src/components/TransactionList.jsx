import React from 'react';
import { PlusCircle, ArrowDown, ArrowUp } from 'lucide-react';

// INR formatter (₹ with Indian digit grouping, 2 decimals)
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

// Mock data for recent transactions (keep numbers, not strings)
const mockTransactions = [
  { id: 1, category: 'Groceries', description: 'Weekly shopping', amount: -75.4, type: 'expense' },
  { id: 2, category: 'Salary', description: 'Monthly paycheck', amount: 2500.0, type: 'income' },
  { id: 3, category: 'Utilities', description: 'Electricity Bill', amount: -120.0, type: 'expense' },
  { id: 4, category: 'Dining Out', description: 'Dinner with friends', amount: -45.5, type: 'expense' },
];

const TransactionItem = ({ transaction }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100">
    <div className="flex items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
          transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}
      >
        {transaction.type === 'income' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
      </div>
      <div>
        <p className="font-semibold text-gray-800">{transaction.category}</p>
        <p className="text-sm text-gray-500">{transaction.description}</p>
      </div>
    </div>
    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
      {transaction.type === 'income'
        ? `+${formatINR(transaction.amount)}`
        : `-${formatINR(Math.abs(transaction.amount))}`}
    </p>
  </div>
);

const TransactionList = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Transactions</h3>
      <div className="space-y-2">
        {mockTransactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
