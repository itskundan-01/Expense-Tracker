import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAccountStore = create(
  persist(
    (set, get) => ({
      accounts: [
        {
          id: 1,
          name: 'Checking Account',
          type: 'checking',
          balance: 4250.75,
          currency: 'INR',
          lastFour: '1234',
          color: '#3B82F6',
          isActive: true,
        },
        {
          id: 2,
          name: 'Savings Account',
          type: 'savings',
          balance: 15500.2,
          currency: 'INR',
          lastFour: '5678',
          color: '#10B981',
          isActive: true,
        },
        {
          id: 3,
          name: 'Credit Card',
          type: 'credit',
          balance: -850.4,
          currency: 'INR',
          lastFour: '9876',
          color: '#EF4444',
          isActive: true,
        },
      ],

      // Actions
      addAccount: (account) => {
        const newAccount = {
          ...account,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        set((state) => ({
          accounts: [...state.accounts, newAccount],
        }));
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, ...updates } : account
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== id),
        }));
      },

      // Update account balance based on transactions
      updateAccountBalance: (accountId, amount, type) => {
        set((state) => ({
          accounts: state.accounts.map((account) => {
            if (account.id === accountId) {
              const newBalance = type === 'income' 
                ? account.balance + amount 
                : account.balance - amount;
              return { ...account, balance: newBalance };
            }
            return account;
          }),
        }));
      },

      getTotalBalance: () => {
        const { accounts } = get();
        return accounts
          .filter((account) => account.isActive)
          .reduce((total, account) => {
            // For credit accounts, negative balance is actually positive (credit available)
            if (account.type === 'credit') {
              return total - account.balance; // Convert negative to positive
            }
            return total + account.balance;
          }, 0);
      },

      getAccountsByType: (type) => {
        const { accounts } = get();
        return accounts.filter((account) => account.type === type && account.isActive);
      },

      getActiveAccounts: () => {
        const { accounts } = get();
        return accounts.filter((account) => account.isActive);
      },
    }),
    {
      name: 'account-storage',
    }
  )
);