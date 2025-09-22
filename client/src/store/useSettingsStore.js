import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      preferences: {
        theme: 'system', // 'light', 'dark', 'system'
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        notifications: {
          email: true,
          push: true,
          sms: false,
          budgetAlerts: true,
          recurringReminders: true,
          weeklyReports: false,
          monthlyReports: true,
        },
        privacy: {
          dataSharing: false,
          analytics: true,
        },
      },
      
      // Actions
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        }));
      },

      updateNotificationSettings: (notifications) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications: { ...state.preferences.notifications, ...notifications },
          },
        }));
      },

      updatePrivacySettings: (privacy) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            privacy: { ...state.preferences.privacy, ...privacy },
          },
        }));
      },

      resetPreferences: () => {
        set({
          preferences: {
            theme: 'system',
            currency: 'INR',
            dateFormat: 'DD/MM/YYYY',
            notifications: {
              email: true,
              push: true,
              sms: false,
              budgetAlerts: true,
              recurringReminders: true,
              weeklyReports: false,
              monthlyReports: true,
            },
            privacy: {
              dataSharing: false,
              analytics: true,
            },
          },
        });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);