import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock Data for the chart
const expenseDataForChart = [
    { name: 'Groceries', value: 400 },
    { name: 'Utilities', value: 300 },
    { name: 'Transport', value: 200 },
    { name: 'Dining', value: 278 },
    { name: 'Health', value: 189 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const CategoryChart = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie 
                        data={expenseDataForChart} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        outerRadius={110} 
                        fill="#8884d8" 
                        dataKey="value"
                    >
                        {expenseDataForChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoryChart;
