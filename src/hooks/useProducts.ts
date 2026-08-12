import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productService, type Product, type Category } from '@/api/services';
import { getErrorMessage } from '@/utils/error';

const KEY = 'products';
const CAT_KEY = 'product-categories';

export const useProducts = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => productService.list(params) });

export const useProductCategories = () =>
  useQuery({ queryKey: [CAT_KEY], queryFn: () => productService.categories() });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => productService.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Product created successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create product')),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => productService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Product updated successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to update product')),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Product deactivated successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete product')),
  });
};

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => productService.adjustStock(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Stock adjusted successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to adjust stock')),
  });
};

export const useCreateProductCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => productService.createCategory(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CAT_KEY] }); toast.success('Category created successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create category')),
  });
};

export type { Product, Category };
