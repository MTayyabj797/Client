import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  customerService,
  type Customer,
  type LedgerEntry,
} from '@/api/services';
import { getErrorMessage } from '@/utils/error';

const KEY = 'customers';

export const useCustomers = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => customerService.list(params) });

export const useCustomer = (id: string) =>
  useQuery({ queryKey: [KEY, id], queryFn: () => customerService.get(id), enabled: !!id });

export const useCustomerLedger = (id: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [KEY, id, 'ledger', params],
    queryFn: () => customerService.ledger(id, params),
    enabled: !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => customerService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Customer created successfully');
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create customer')),
  });
};

export const useUpdateCustomerLedgerEntry = (customerId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      body,
    }: {
      entryId: string;
      body: unknown;
    }) => customerService.updateLedgerEntry(customerId, entryId, body),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [KEY, customerId, 'ledger'],
      });

      qc.invalidateQueries({
        queryKey: [KEY, customerId],
      });

      toast.success('Ledger entry updated successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Failed to update ledger entry')
      ),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => customerService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Customer updated successfully');
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to update customer')),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Customer deactivated successfully');
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete customer')),
  });
};

export const useAddCustomerLedgerEntry = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => customerService.addLedgerEntry(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id, 'ledger'] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
      toast.success('Ledger entry added successfully');
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to add ledger entry')),
  });
};

export type { Customer, LedgerEntry };
