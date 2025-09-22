import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Database, 
  Palette,
  Settings as SettingsIcon,
  Camera,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Tags,
  DollarSign,
  FileText,
  Smartphone
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import CategoriesManager from '../components/CategoriesManager';
import CurrencySettings from '../components/CurrencySettings';
import DataManager from '../components/DataManager';
import { toast } from 'react-toastify';

const SettingsCard = ({ icon, title, subtitle, children, onClick, showArrow = false }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${
      onClick ? 'cursor-pointer' : ''
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl text-white">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
      {showArrow && (
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  </motion.div>
);

const SettingsPage = () => {
  const { user, updateProfile } = useAuthStore();
  const { 
    preferences,
    updateNotificationSettings,
    updatePreferences
  } = useSettingsStore();
  
  // Extract values with defaults to prevent undefined errors
  const notifications = preferences?.notifications || {};
  const theme = preferences?.theme || 'system';
  const defaultCurrency = preferences?.currency || 'INR';
  const dateFormat = preferences?.dateFormat || 'DD/MM/YYYY';
  
  const [activeModal, setActiveModal] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      // In a real app, you'd call an API to change password
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* Profile Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <User className="w-6 h-6 mr-2 text-blue-600" />
          Profile & Account
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <SettingsCard
            icon={<User className="w-6 h-6" />}
            title="Personal Information"
            subtitle="Update your profile details"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                onClick={handleProfileUpdate}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </SettingsCard>

          {/* Security */}
          <SettingsCard
            icon={<Shield className="w-6 h-6" />}
            title="Security"
            subtitle="Password and account security"
          >
            <div className="space-y-4">
              {!showPasswordChange ? (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePasswordChange}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => setShowPasswordChange(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>
        </div>
      </div>

      {/* Application Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-blue-600" />
          Application Settings
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme */}
          <SettingsCard
            icon={theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            title="Theme"
            subtitle="Choose your preferred appearance"
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updatePreferences({ theme: 'light' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-sm font-medium">Light</div>
              </button>
              <button
                onClick={() => updatePreferences({ theme: 'dark' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Dark</div>
              </button>
            </div>
          </SettingsCard>

          {/* Notifications */}
          <SettingsCard
            icon={<Bell className="w-6 h-6" />}
            title="Notifications"
            subtitle="Manage your notification preferences"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive updates via email</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => updateNotificationSettings({ email: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Push Notifications</div>
                  <div className="text-sm text-gray-600">Get notified on your device</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => updateNotificationSettings({ push: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Budget Alerts</div>
                  <div className="text-sm text-gray-600">Alert when nearing budget limits</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.budgetAlerts}
                    onChange={(e) => updateNotificationSettings({ budgetAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </SettingsCard>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
          Financial Settings
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SettingsCard
            icon={<Globe className="w-6 h-6" />}
            title="Currency & Region"
            subtitle={`Default currency: ${defaultCurrency}`}
            onClick={() => setActiveModal('currency')}
            showArrow
          />
          
          <SettingsCard
            icon={<Tags className="w-6 h-6" />}
            title="Categories"
            subtitle="Manage expense and income categories"
            onClick={() => setActiveModal('categories')}
            showArrow
          />
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          Data Management
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SettingsCard
            icon={<FileText className="w-6 h-6" />}
            title="Export & Import"
            subtitle="Backup and restore your financial data"
            onClick={() => setActiveModal('data')}
            showArrow
          />
          
          <SettingsCard
            icon={<Smartphone className="w-6 h-6" />}
            title="Date Format"
            subtitle="Choose how dates are displayed"
          >
            <select
              value={dateFormat}
              onChange={(e) => updatePreferences({ dateFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
              <option value="dd/MM/yyyy">DD/MM/YYYY (EU)</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
              <option value="dd MMM yyyy">DD MMM YYYY</option>
            </select>
          </SettingsCard>
        </div>
      </div>

      {/* Modals */}
      <CategoriesManager 
        isOpen={activeModal === 'categories'} 
        onClose={() => setActiveModal(null)} 
      />
      <CurrencySettings 
        isOpen={activeModal === 'currency'} 
        onClose={() => setActiveModal(null)} 
      />
      <DataManager 
        isOpen={activeModal === 'data'} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
};

export default SettingsPage;
