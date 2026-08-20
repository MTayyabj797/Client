import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supplierService, type Supplier, type LedgerEntry } from '@/api/services';
import { getErrorMessage } from '@/utils/error';

const KEY = 'suppliers';

export const useSuppliers = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => supplierService.list(params) });

export const useSupplier = (id: string) =>
  useQuery({ queryKey: [KEY, id], queryFn: () => supplierService.get(id), enabled: !!id });

export const useSupplierLedger = (id: string, params?: Record<string, unknown>) =>
  useQuery({ queryKey: [KEY, id, 'ledger', params], queryFn: () => supplierService.ledger(id, params), enabled: !!id });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => supplierService.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Supplier created successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create supplier')),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => supplierService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Supplier updated successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to update supplier')),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Supplier deactivated successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete supplier')),
  });
};

export const useAddSupplierLedgerEntry = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => supplierService.addLedgerEntry(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id, 'ledger'] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
      toast.success('Ledger entry added successfully');
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to add ledger entry')),
  });
};
export const useUpdateSupplierLedgerEntry = (supplierId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      body,
    }: {
      entryId: string;
      body: unknown;
    }) => supplierService.updateLedgerEntry(supplierId, entryId, body),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [KEY, supplierId, 'ledger'],
      });

      qc.invalidateQueries({
        queryKey: [KEY, supplierId],
      });

      toast.success('Ledger entry updated successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Failed to update ledger entry')
      ),
  });
};

export type { Supplier, LedgerEntry };
