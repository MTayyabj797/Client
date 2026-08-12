import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { expenseService, type Expense, type ExpenseCategory } from '@/api/services';
import { getErrorMessage } from '@/utils/error';

export const useExpenses = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['expenses', params], queryFn: () => expenseService.list(params) });

export const useExpenseCategories = () =>
  useQuery({ queryKey: ['expense-categories'], queryFn: () => expenseService.categories() });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => expenseService.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Expense created successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create expense')),
  });
};

export const useCreateExpenseCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => expenseService.createCategory(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expense-categories'] }); toast.success('Category created successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create category')),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseService.delete(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
    },

    onError: (e) =>
      toast.error(getErrorMessage(e, 'Failed to delete expense')),
  });
};

export type { Expense, ExpenseCategory };
