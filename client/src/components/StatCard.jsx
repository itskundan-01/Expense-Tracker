import { formatINR } from '../utils/currency';

const StatCard = ({ title, value, change, changeType }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <p className="text-gray-500 text-sm font-medium">{title}</p>
    <p className="text-3xl font-semibold text-gray-800 my-2">
      {formatINR(value)}
    </p>
    <p className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
      {change}
    </p>
  </div>
);
