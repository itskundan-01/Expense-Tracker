import React, { useState, useEffect } from 'react';
import { BarChart2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAuthStore } from '../store/useAuthStore';
import { showSuccess, showError } from '../utils/notifications';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

// Production login - no demo credentials

// Reusable auth layout with dark mode support
const AuthLayout = ({ title, children, onSwitch, switchText, switchActionText }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md border border-gray-200
                    dark:bg-gray-900 dark:border-gray-800">
      <div className="flex justify-center">
        <BarChart2 className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">{title}</h2>
      {children}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {switchText}{' '}
        <button onClick={onSwitch} className="font-medium text-indigo-600 hover:text-indigo-500">
          {switchActionText}
        </button>
      </p>
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Note: Redirect handled by App.jsx routes - no manual redirect needed here

  const onSubmit = async (data) => {
    console.log('🔑 Login form submitted with data:', { email: data.email });
    
    try {
      const result = await login(data);
      console.log('🔑 Login result:', result);
      
      if (result.success) {
        console.log('🔑 Login successful! Authentication state should trigger redirect.');
        // Don't manually navigate - let the useEffect handle it
      } else {
        showError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('🔑 Login submission error:', error);
      showError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      onSwitch={() => navigate('/signup')}
      switchText="Don't have an account?"
      switchActionText="Sign Up"
    >
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Please enter a valid email address',
            },
          })}
          error={errors.email?.message}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 3,
                message: 'Password must be at least 3 characters',
              },
            })}
            error={errors.password?.message}
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          
          <button
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-500"
            onClick={() => showError('Password reset feature coming soon!')}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading || isSubmitting}
          className="w-full"
        >
          {isLoading || isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Secure Authentication</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Your data is protected with industry-standard security
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
