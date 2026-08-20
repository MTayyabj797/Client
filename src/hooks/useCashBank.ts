// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import toast from 'react-hot-toast';
// import { cashBankService, dailyBookService, type CashEntry, type BankAccount, type BankTransaction, type DailyEntry } from '@/api/services';
// import { getErrorMessage } from '@/utils/error';

// // Cash Book
// export const useCashBook = (params?: Record<string, unknown>) =>
//   useQuery({ queryKey: ['cash-book', params], queryFn: () => cashBankService.listCashBook(params) });

// export const useCreateCashEntry = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (body: unknown) => cashBankService.createCashEntry(body),
//     onSuccess: () => { qc.invalidateQueries({ queryKey: ['cash-book'] }); toast.success('Cash entry created successfully'); },
//     onError: (e) => toast.error(getErrorMessage(e, 'Failed to create cash entry')),
//   });
// };

// // Bank Accounts
// export const useBankAccounts = () =>
//   useQuery({ queryKey: ['bank-accounts'], queryFn: () => cashBankService.listBankAccounts() });

// export const useCreateBankAccount = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (body: unknown) => cashBankService.createBankAccount(body),
//     onSuccess: () => { qc.invalidateQueries({ queryKey: ['bank-accounts'] }); toast.success('Bank account created successfully'); },
//     onError: (e) => toast.error(getErrorMessage(e, 'Failed to create bank account')),
//   });
// };

// export const useDeleteBankAccount = () => {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => cashBankService.deleteBankAccount(id),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['bank-accounts'] });
//       toast.success('Bank account deleted successfully');
//     },
//     onError: (e) =>
//       toast.error(getErrorMessage(e, 'Failed to delete bank account')),
//   });
// };

// export const useUpdateBankAccountStatus = () => {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       id,
//       status,
//     }: {
//       id: string;
//       status: 'active' | 'inactive';
//     }) =>
//       cashBankService.updateBankAccountStatus(id, status),

//     onSuccess: (_, variables) => {
//       qc.invalidateQueries({
//         queryKey: ['bank-accounts'],
//       });

//       toast.success(
//         variables.status === 'inactive'
//           ? 'Bank account deactivated successfully'
//           : 'Bank account activated successfully'
//       );
//     },

//     onError: (e) =>
//       toast.error(
//         getErrorMessage(e, 'Failed to update bank account status')
//       ),
//   });
// };
// export const useUpdateCashEntry = () => {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       id,
//       body,
//     }: {
//       id: string;
//       body: unknown;
//     }) => cashBankService.updateCashEntry(id, body),

//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['cash-book'] });
//       qc.invalidateQueries({ queryKey: ['daily-book'] });
//       toast.success('Cash entry updated successfully');
//     },

//     onError: (e) =>
//       toast.error(
//         getErrorMessage(e, 'Failed to update cash entry')
//       ),
//   });
// };

// export const useUpdateBankAccount = () => {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       id,
//       body,
//     }: {
//       id: string;
//       body: unknown;
//     }) => cashBankService.updateBankAccount(id, body),

//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['bank-accounts'] });
//       toast.success('Bank account updated successfully');
//     },

//     onError: (e) =>
//       toast.error(
//         getErrorMessage(e, 'Failed to update bank account')
//       ),
//   });
// };

// export const useUpdateBankTransaction = () => {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       accountId,
//       transactionId,
//       body,
//     }: {
//       accountId: string;
//       transactionId: string;
//       body: unknown;
//     }) =>
//       cashBankService.updateBankTransaction(
//         accountId,
//         transactionId,
//         body
//       ),

//     onSuccess: (_, variables) => {
//       qc.invalidateQueries({
//         queryKey: [
//           'bank-accounts',
//           variables.accountId,
//           'ledger',
//         ],
//       });

//       qc.invalidateQueries({
//         queryKey: ['bank-accounts'],
//       });

//       toast.success(
//         'Bank transaction updated successfully'
//       );
//     },

//     onError: (e) =>
//       toast.error(
//         getErrorMessage(
//           e,
//           'Failed to update bank transaction'
//         )
//       ),
//   });
// };
// export const useBankLedger = (id: string, params?: Record<string, unknown>) =>
//   useQuery({ queryKey: ['bank-accounts', id, 'ledger', params], queryFn: () => cashBankService.bankLedger(id, params), enabled: !!id });

// export const useTransfer = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (body: unknown) => cashBankService.transfer(body),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['bank-accounts'] });
//       qc.invalidateQueries({ queryKey: ['cash-book'] });
//       toast.success('Transfer completed successfully');
//     },
//     onError: (e) => toast.error(getErrorMessage(e, 'Transfer failed')),
//   });
// };

// // Daily Book
// export const useDailyBook = (params?: Record<string, unknown>) =>
//   useQuery({ queryKey: ['daily-book', params], queryFn: () => dailyBookService.list(params) });

// export type { CashEntry, BankAccount, BankTransaction, DailyEntry};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  cashBankService,
  dailyBookService,
  type CashEntry,
  type BankAccount,
  type BankTransaction,
  type DailyEntry,
} from '@/api/services';
import { getErrorMessage } from '@/utils/error';

// ============================================================
// Cash Book
// ============================================================

export const useCashBook = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['cash-book', params],
    queryFn: () => cashBankService.listCashBook(params),
  });

export const useCreateCashEntry = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: unknown) =>
      cashBankService.createCashEntry(body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-book'] });
      toast.success('Cash entry created successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Failed to create cash entry')
      ),
  });
};

export const useUpdateCashEntry = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: unknown;
    }) => cashBankService.updateCashEntry(id, body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-book'] });
      qc.invalidateQueries({ queryKey: ['daily-book'] });

      toast.success('Cash entry updated successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Failed to update cash entry')
      ),
  });
};

// ============================================================
// Bank Accounts
// ============================================================

export const useBankAccounts = () =>
  useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => cashBankService.listBankAccounts(),
  });

export const useCreateBankAccount = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: unknown) =>
      cashBankService.createBankAccount(body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Bank account created successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Failed to create bank account')
      ),
  });
};

export const useUpdateBankAccount = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: unknown;
    }) => cashBankService.updateBankAccount(id, body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });

      toast.success('Bank account updated successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Failed to update bank account')
      ),
  });
};

export const useDeleteBankAccount = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      cashBankService.deleteBankAccount(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });

      toast.success('Bank account deleted successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Failed to delete bank account')
      ),
  });
};

export const useUpdateBankAccountStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'active' | 'inactive';
    }) =>
      cashBankService.updateBankAccountStatus(id, status),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ['bank-accounts'],
      });

      toast.success(
        variables.status === 'inactive'
          ? 'Bank account deactivated successfully'
          : 'Bank account activated successfully'
      );
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(
          e,
          'Failed to update bank account status'
        )
      ),
  });
};

// ============================================================
// Bank Ledger
// ============================================================

export const useBankLedger = (
  id: string,
  params?: Record<string, unknown>
) =>
  useQuery({
    queryKey: ['bank-accounts', id, 'ledger', params],
    queryFn: () => cashBankService.bankLedger(id, params),
    enabled: !!id,
  });

export const useUpdateBankTransaction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      transactionId,
      body,
    }: {
      accountId: string;
      transactionId: string;
      body: unknown;
    }) =>
      cashBankService.updateBankTransaction(
        accountId,
        transactionId,
        body
      ),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: [
          'bank-accounts',
          variables.accountId,
          'ledger',
        ],
      });

      qc.invalidateQueries({
        queryKey: ['bank-accounts'],
      });

      toast.success(
        'Bank transaction updated successfully'
      );
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(
          e,
          'Failed to update bank transaction'
        )
      ),
  });
};

export const useTransfer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: unknown) =>
      cashBankService.transfer(body),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['bank-accounts'],
      });

      qc.invalidateQueries({
        queryKey: ['cash-book'],
      });

      toast.success('Transfer completed successfully');
    },

    onError: (e) =>
      toast.error(
        getErrorMessage(e, 'Transfer failed')
      ),
  });
};

// ============================================================
// Daily Book
// ============================================================

export const useDailyBook = (
  params?: Record<string, unknown>
) =>
  useQuery({
    queryKey: ['daily-book', params],
    queryFn: () => dailyBookService.list(params),
  });

export type {
  CashEntry,
  BankAccount,
  BankTransaction,
  DailyEntry,
};
