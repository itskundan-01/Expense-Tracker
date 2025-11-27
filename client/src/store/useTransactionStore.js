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
          console.log('🏷️ Categories API response:', data);
          
          // Handle both array and wrapped response formats
          const categories = Array.isArray(data) ? data : (data?.data || []);
          console.log('🏷️ Processed categories:', categories);
          
          if (!Array.isArray(categories)) {
            console.warn('🏷️ Categories data is not an array:', categories);
            set({ categories: [], loading: false });
            return;
          }
          
          set({ categories, loading: false });
        } catch (error) {
          console.error('🏷️ Failed to fetch categories:', error);
          // If it's a 401/404 (missing endpoint), use mock data
          if (error.response?.status === 401 || error.response?.status === 404) {
            console.log('🏷️ Using mock categories (endpoint not implemented)');
            const mockCategories = [
              { id: 1, name: 'Food & Dining', type: 'expense', color: '#FF6B6B', icon: '🍽️' },
              { id: 2, name: 'Transportation', type: 'expense', color: '#4ECDC4', icon: '🚗' },
              { id: 3, name: 'Shopping', type: 'expense', color: '#45B7D1', icon: '🛍️' },
              { id: 4, name: 'Entertainment', type: 'expense', color: '#96CEB4', icon: '🎬' },
              { id: 5, name: 'Bills & Utilities', type: 'expense', color: '#FFEAA7', icon: '💡' },
              { id: 6, name: 'Healthcare', type: 'expense', color: '#DDA0DD', icon: '🏥' },
              { id: 7, name: 'Education', type: 'expense', color: '#98D8C8', icon: '📚' },
              { id: 8, name: 'Travel', type: 'expense', color: '#F7DC6F', icon: '✈️' }
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
          const response = await api.transactions.create(transaction);
          // API returns {success: true, data: {...}}
          const newTransaction = response?.data || response;
          console.log('📊 Created transaction:', newTransaction);
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
          const response = await api.transactions.update(id, updates);
          // API returns {success: true, data: {...}}
          const updatedTransaction = response?.data || response;
          console.log('📊 Updated transaction:', updatedTransaction);
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
        if (!id) {
          console.error('📊 Cannot delete transaction: id is undefined');
          return;
        }
        set({ loading: true, error: null });
        try {
          console.log('📊 Deleting transaction:', id);
          await api.transactions.delete(id);
          set((state) => ({
            transactions: state.transactions.filter((transaction) => transaction.id !== id),
            loading: false
          }));
        } catch (error) {
          console.error('📊 Delete error:', error);
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
          const txDate = transaction.transactionDate || transaction.date;
          if (filters.startDate && txDate && new Date(txDate) < new Date(filters.startDate)) {
            return false;
          }
          if (filters.endDate && txDate && new Date(txDate) > new Date(filters.endDate)) {
            return false;
          }
          if (filters.category && transaction.categoryId !== filters.category) {
            return false;
          }
          // Case-insensitive type comparison
          if (filters.type && (transaction.type || '').toLowerCase() !== filters.type.toLowerCase()) {
            return false;
          }
          if (filters.account && transaction.accountId !== filters.account) {
            return false;
          }
          return true;
        });
      },

      getTotalIncome: () => {
        const { transactions } = get();
        if (!Array.isArray(transactions)) return 0;
        return transactions
          .filter((t) => (t.type || '').toLowerCase() === 'income')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      },

      getTotalExpenses: () => {
        const { transactions } = get();
        if (!Array.isArray(transactions)) return 0;
        return transactions
          .filter((t) => (t.type || '').toLowerCase() === 'expense')
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);
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