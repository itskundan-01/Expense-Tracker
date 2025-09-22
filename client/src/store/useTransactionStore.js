import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/endpoints';

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [],
      accounts: [],
      loading: false,
      error: null,
      filters: {
        startDate: null,
        endDate: null,
        category: null,
        type: null, // 'income', 'expense', or null for all
        account: null,
      },

      // Fetch all data
      fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.transactions.getAll();
          console.log('📊 Transactions API response:', response);
          
          // Server returns {success: true, message: "...", data: [...]}
          const transactions = response?.data || [];
          
          if (!Array.isArray(transactions)) {
            console.warn('📊 Transactions data is not an array:', transactions);
            set({ transactions: [], loading: false });
            return;
          }
          
          set({ transactions, loading: false });
        } catch (error) {
          console.error('📊 Failed to fetch transactions:', error);
          set({ error: error.message, loading: false, transactions: [] });
          throw error;
        }
      },

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const data = await api.categories.getAll();
          set({ categories: data, loading: false });
        } catch (error) {
          // If it's a 401/404 (missing endpoint), use mock data
          if (error.response?.status === 401 || error.response?.status === 404) {
            console.log('🏷️ Using mock categories (endpoint not implemented)');
            const mockCategories = [
              { id: 1, name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
              { id: 2, name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
              { id: 3, name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
              { id: 4, name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
              { id: 5, name: 'Bills & Utilities', color: '#FFEAA7', icon: '💡' },
              { id: 6, name: 'Healthcare', color: '#DDA0DD', icon: '🏥' },
              { id: 7, name: 'Education', color: '#98D8C8', icon: '📚' },
              { id: 8, name: 'Travel', color: '#F7DC6F', icon: '✈️' }
            ];
            set({ categories: mockCategories, loading: false, error: null });
            return;
          }
          
          // For other errors, still throw
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchAccounts: async () => {
        set({ loading: true, error: null });
        try {
          const data = await api.accounts.getAll();
          set({ accounts: data, loading: false });
        } catch (error) {
          // If it's a 401/404 (missing endpoint), use mock data
          if (error.response?.status === 401 || error.response?.status === 404) {
            console.log('🏦 Using mock accounts (endpoint not implemented)');
            const mockAccounts = [
              { id: 1, name: 'Checking Account', type: 'checking', balance: 4250.75 },
              { id: 2, name: 'Savings Account', type: 'savings', balance: 15500.20 },
              { id: 3, name: 'Credit Card', type: 'credit', balance: -1250.00 }
            ];
            set({ accounts: mockAccounts, loading: false, error: null });
            return;
          }
          
          // For other errors, still throw
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Actions
      addTransaction: async (transaction) => {
        set({ loading: true, error: null });
        try {
          const newTransaction = await api.transactions.create(transaction);
          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
            loading: false
          }));
          return newTransaction;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateTransaction: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updatedTransaction = await api.transactions.update(id, updates);
          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === id ? updatedTransaction : transaction
            ),
            loading: false
          }));
          return updatedTransaction;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteTransaction: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.transactions.delete(id);
          set((state) => ({
            transactions: state.transactions.filter((transaction) => transaction.id !== id),
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      addCategory: async (category) => {
        set({ loading: true, error: null });
        try {
          const newCategory = await api.categories.create(category);
          set((state) => ({
            categories: [...state.categories, newCategory],
            loading: false
          }));
          return newCategory;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateCategory: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updatedCategory = await api.categories.update(id, updates);
          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === id ? updatedCategory : category
            ),
            loading: false
          }));
          return updatedCategory;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.categories.delete(id);
          set((state) => ({
            categories: state.categories.filter((category) => category.id !== id),
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      addAccount: async (account) => {
        set({ loading: true, error: null });
        try {
          const newAccount = await api.accounts.create(account);
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            loading: false
          }));
          return newAccount;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateAccount: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updatedAccount = await api.accounts.update(id, updates);
          set((state) => ({
            accounts: state.accounts.map((account) =>
              account.id === id ? updatedAccount : account
            ),
            loading: false
          }));
          return updatedAccount;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteAccount: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.accounts.delete(id);
          set((state) => ({
            accounts: state.accounts.filter((account) => account.id !== id),
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({
          filters: {
            startDate: null,
            endDate: null,
            category: null,
            type: null,
            account: null,
          },
        });
      },

      // Computed values
      getFilteredTransactions: () => {
        const { transactions, filters } = get();
        
        // Safety check - ensure transactions is an array
        if (!Array.isArray(transactions)) {
          console.warn('📊 getFilteredTransactions: transactions is not an array:', transactions);
          return [];
        }
        
        return transactions.filter((transaction) => {
          if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
            return false;
          }
          if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
            return false;
          }
          if (filters.category && transaction.category?.id !== filters.category) {
            return false;
          }
          if (filters.type && transaction.type !== filters.type) {
            return false;
          }
          if (filters.account && transaction.account?.id !== filters.account) {
            return false;
          }
          return true;
        });
      },

      getTotalIncome: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalExpenses: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      },

      getBalance: () => {
        const { getTotalIncome, getTotalExpenses } = get();
        return getTotalIncome() - getTotalExpenses();
      },

      getCategoryTotals: () => {
        const { transactions, categories } = get();
        const totals = {};
        
        transactions.forEach((transaction) => {
          const category = transaction.category || categories.find((c) => c.id === transaction.categoryId);
          if (category) {
            if (!totals[category.name]) {
              totals[category.name] = 0;
            }
            totals[category.name] += Math.abs(transaction.amount);
          }
        });
        
        return totals;
      },

      // Initialize all data
      initializeData: async () => {
        try {
          await Promise.all([
            get().fetchTransactions(),
            get().fetchCategories(),
            get().fetchAccounts()
          ]);
        } catch (error) {
          console.error('Failed to initialize data:', error);
          throw error;
        }
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);