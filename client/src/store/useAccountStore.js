import { create } from 'zustand';
import { accountsAPI } from '../api/endpoints';

export const useAccountStore = create((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,

  // Fetch all accounts from backend
  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await accountsAPI.getAll();
      console.log('🏦 Fetched accounts:', data);
      // Handle both array response and wrapped response
      const accountsList = Array.isArray(data) ? data : (data.accounts || []);
      set({ accounts: accountsList, isLoading: false });
      return accountsList;
    } catch (error) {
      console.error('🏦 Error fetching accounts:', error);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  // Create a new account
  createAccount: async (accountData) => {
    set({ isLoading: true, error: null });
    try {
      const newAccount = await accountsAPI.create(accountData);
      console.log('🏦 Created account:', newAccount);
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        isLoading: false,
      }));
      return newAccount;
    } catch (error) {
      console.error('🏦 Error creating account:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update an account
  updateAccount: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAccount = await accountsAPI.update(id, updates);
      console.log('🏦 Updated account:', updatedAccount);
      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === id ? updatedAccount : account
        ),
        isLoading: false,
      }));
      return updatedAccount;
    } catch (error) {
      console.error('🏦 Error updating account:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete an account
  deleteAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await accountsAPI.delete(id);
      console.log('🏦 Deleted account:', id);
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('🏦 Error deleting account:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Calculate total balance across all active accounts
  getTotalBalance: () => {
    const { accounts } = get();
    return accounts
      .filter((account) => account.isActive !== false)
      .reduce((total, account) => {
        const balance = parseFloat(account.balance) || 0;
        // For credit accounts, negative balance means debt
        if (account.type === 'credit') {
          return total + balance; // Keep as is (already negative if debt)
        }
        return total + balance;
      }, 0);
  },

  // Get accounts by type
  getAccountsByType: (type) => {
    const { accounts } = get();
    return accounts.filter((account) => account.type === type && account.isActive !== false);
  },

  // Get all active accounts
  getActiveAccounts: () => {
    const { accounts } = get();
    return accounts.filter((account) => account.isActive !== false);
  },

  // Clear accounts (for logout)
  clearAccounts: () => {
    set({ accounts: [], isLoading: false, error: null });
  },
}));