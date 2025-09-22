import React, { useState } from 'react';
import { BarChart2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const AuthLayout = ({ title, children, onSwitch, switchText, switchActionText }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
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

const SimpleSignupPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    console.log('🔥 SIGNUP - Submitting form:', data.email);
    
    const result = await registerUser(data);
    
    if (result.success) {
      console.log('🔥 SIGNUP - Success, navigating to dashboard');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      onSwitch={() => navigate('/login')}
      switchText="Already have an account?"
      switchActionText="Sign In"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="First name"
            {...register('firstName', {
              required: 'First name is required',
            })}
            error={errors.firstName?.message}
          />
          
          <Input
            label="Last Name"
            placeholder="Last name"
            {...register('lastName', {
              required: 'Last name is required',
            })}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
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

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default SimpleSignupPage;