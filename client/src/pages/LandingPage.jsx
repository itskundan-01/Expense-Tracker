import React from 'react';
import { ArrowRight, CheckCircle2, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Logo = () => (
  <div className="flex items-center space-x-2">
    <BarChart2 className="w-8 h-8 text-indigo-600" />
    <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">FinTrack</span>
  </div>
);

const LandingPage = ({ onLogin, onSignup }) => {
  const navigate = useNavigate();

  const goLogin = (e) => {
    if (onLogin) return onLogin(e);
    navigate('/login', { replace: false });
  };

  const goSignup = (e) => {
    if (onSignup) return onSignup(e);
    navigate('/signup', { replace: false });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans dark:bg-gray-950 dark:text-gray-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Logo />
        <div>
          <button
            onClick={goLogin}
            className="text-gray-600 hover:text-indigo-600 font-medium mr-6 dark:text-gray-300"
          >
            Log In
          </button>
          <button
            onClick={goSignup}
            className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                       focus-visible:ring-offset-2 ring-offset-white dark:focus-visible:ring-offset-gray-900"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 text-center pt-24 pb-16">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Track Expenses <span className="text-indigo-600">Like a Pro</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 dark:text-gray-400">
          The all-in-one expense tracking solution that helps you monitor transactions, set budgets, and achieve your financial goals.
        </p>

        <div className="flex justify-center items-center space-x-4 mb-12">
          <button
            onClick={goLogin}
            className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                       focus-visible:ring-offset-2 ring-offset-white dark:focus-visible:ring-offset-gray-900"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center space-x-8 text-gray-500 text-sm dark:text-gray-400">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Categorize Expenses
          </span>
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Set Budgets
          </span>
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> View Insights
          </span>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
