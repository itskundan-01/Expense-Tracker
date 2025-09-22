import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/endpoints';

export const useBudgetStore = create(
  persist(
    (set, get) => ({
      budgets: [],
      loading: false,
      error: null,

      // Fetch budgets
      fetchBudgets: async () => {
        set({ loading: true, error: null });
        try {
          const data = await api.budgets.getAll();
          set({ budgets: data, loading: false });
              } catch (error) {
        // If it's a 401/404 (missing endpoint), use empty list
        if (error.response?.status === 401 || error.response?.status === 404) {
          console.log('🏦 Using empty budgets (endpoint not implemented)');
            set({ budgets: [], loading: false, error: null });
            return;
          }
          
          // For other errors, still throw
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      // Actions
      addBudget: async (budget) => {
        set({ loading: true, error: null });
        try {
          const newBudget = await api.budgets.create(budget);
          set((state) => ({
            budgets: [...state.budgets, newBudget],
            loading: false
          }));
          return newBudget;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateBudget: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updatedBudget = await api.budgets.update(id, updates);
          set((state) => ({
            budgets: state.budgets.map((budget) =>
              budget.id === id ? updatedBudget : budget
            ),
            loading: false
          }));
          return updatedBudget;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteBudget: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.budgets.delete(id);
          set((state) => ({
            budgets: state.budgets.filter((budget) => budget.id !== id),
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Computed values
      getBudgetById: (id) => {
        const { budgets } = get();
        return budgets.find(budget => budget.id === id);
      },

      getBudgetsByCategory: (categoryId) => {
        const { budgets } = get();
        return budgets.filter(budget => budget.category?.id === categoryId);
      },

      getActiveBudgets: () => {
        const { budgets } = get();
        const now = new Date();
        return budgets.filter(budget => {
          const startDate = new Date(budget.startDate);
          const endDate = new Date(budget.endDate);
          return now >= startDate && now <= endDate;
        });
      },

      getTotalBudgetAmount: () => {
        const { getActiveBudgets } = get();
        return getActiveBudgets().reduce((sum, budget) => sum + budget.amount, 0);
      },

      getBudgetProgress: (budgetId, transactions) => {
        const budget = get().getBudgetById(budgetId);
        if (!budget) return null;

        const budgetTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const budgetStart = new Date(budget.startDate);
          const budgetEnd = new Date(budget.endDate);
          
          return transaction.category?.id === budget.category?.id &&
                 transaction.type === 'EXPENSE' &&
                 transactionDate >= budgetStart &&
                 transactionDate <= budgetEnd;
        });

        const spent = budgetTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const remaining = budget.amount - spent;
        const progress = (spent / budget.amount) * 100;

        return {
          budget,
          spent,
          remaining,
          progress: Math.min(progress, 100),
          isOverBudget: spent > budget.amount,
          transactions: budgetTransactions
        };
      },

      getAllBudgetProgress: (transactions) => {
        const { budgets } = get();
        return budgets.map(budget => get().getBudgetProgress(budget.id, transactions));
      },

      isOverBudget: (budgetId, transactions = []) => {
        const progress = get().getBudgetProgress(budgetId, transactions);
        return progress ? progress.isOverBudget : false;
      },

      // Update budget spending based on transactions
      updateBudgetSpending: (transactions) => {
        console.log('🏦 Updating budget spending with transactions:', transactions?.length || 0);
        
        // This function can be used to recalculate budget progress
        // Since getBudgetProgress already calculates based on transactions,
        // we just need to trigger a re-render or update state if needed
        
        // For now, this is a placeholder that logs the update
        // The actual spending calculations are done dynamically in getBudgetProgress
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'budget-storage',
    }
  )
);