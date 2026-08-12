import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { saleService, purchaseService, type Sale, type Purchase } from '@/api/services';
import { getErrorMessage } from '@/utils/error';

export const useSales = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleService.list(params),
    placeholderData: (previousData) => previousData,
  });

export const useSale = (id: string) =>
  useQuery({
    queryKey: ['sales', 'detail', id],
    queryFn: () => saleService.get(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => saleService.create(body),
    onSuccess: (sale) => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['cash-book'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      if (sale?.id) qc.setQueryData(['sales', 'detail', sale.id], sale);
      toast.success('Sale created successfully');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to create sale')),
  });
};

export const usePurchases = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['purchases', params], queryFn: () => purchaseService.list(params) });

export const usePurchase = (id: string) =>
  useQuery({ queryKey: ['purchases', id], queryFn: () => purchaseService.get(id), enabled: !!id });

export const useCreatePurchase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => purchaseService.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchases'] }); toast.success('Purchase created successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create purchase')),
  });
};

export const useDeletePurchase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchases'] }); toast.success('Purchase deleted successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete purchase')),
  });
};

export type { Sale, Purchase };
