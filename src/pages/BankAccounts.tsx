// import { useState } from 'react';
// import { Box, Button, Card, CardContent, Grid, Stack, Typography, Chip } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Landmark, Eye, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, FileText, PlusCircle } from 'lucide-react';
// import PageHeader from '@/components/PageHeader';
// import FormDialog from '@/components/FormDialog';
// import LoadingSkeleton, { CardGridSkeleton } from '@/components/LoadingSkeleton';
// import ErrorState from '@/components/ErrorState';
// import { useBankAccounts, useCreateBankAccount, useTransfer, type BankAccount } from '@/hooks/useCashBank';
// import { formatCurrency } from '@/utils/format';

// export default function BankAccounts() {
//   const navigate = useNavigate();
//   const { data: result, isLoading, isError, refetch } = useBankAccounts();
//   const transferMut = useTransfer();
//   const createBankMut = useCreateBankAccount();
//   const [action, setAction] = useState<{ type: 'Deposit' | 'Withdraw' | 'Transfer'; bank: { id: string; bank_name: string } } | null>(null);
//   const [addOpen, setAddOpen] = useState(false);

//   const accounts: BankAccount[] = result?.data ?? [];

//   const handleExport = () => {
//     import('@/components/PDFButton').then(({ exportTableToPDF }) => {
//       exportTableToPDF('Bank Accounts', ['Bank', 'Account Number', 'Balance'],
//         accounts.map((a) => [a.bank_name, a.account_number, formatCurrency(a.current_balance)]));
//     });
//   };

//   const handleAction = (vals: Record<string, string | number>) => {
//     if (action?.type === 'Transfer') {
//       transferMut.mutate({
//         from_type: 'bank', to_type: 'bank',
//         from_bank_account_id: action.bank.id, to_bank_account_id: String(vals.toAccount),
//         amount: Number(vals.amount), description: String(vals.description),
//       }, { onSuccess: () => setAction(null) });
//     } else {
//       transferMut.mutate({
//         from_type: action?.type === 'Withdraw' ? 'bank' : 'cash',
//         to_type: action?.type === 'Withdraw' ? 'cash' : 'bank',
//         from_bank_account_id: action?.type === 'Withdraw' ? action.bank.id : undefined,
//         to_bank_account_id: action?.type === 'Deposit' ? action?.bank.id : undefined,
//         amount: Number(vals.amount), description: String(vals.description),
//       }, { onSuccess: () => setAction(null) });
//     }
//   };

//   if (isLoading) return (
//     <Box>
//       <PageHeader title="Bank Accounts" subtitle="View balances and manage bank transactions" breadcrumbs={[{ label: 'Bank Accounts' }]}
//         action={<Button variant="contained" startIcon={<FileText size={18} />} onClick={handleExport} sx={{ borderRadius: 2 }}>Export PDF</Button>} />
//       <CardGridSkeleton count={3} />
//     </Box>
//   );

//   if (isError) return (
//     <Box>
//       <PageHeader title="Bank Accounts" subtitle="View balances and manage bank transactions" breadcrumbs={[{ label: 'Bank Accounts' }]} />
//       <ErrorState message="Failed to load bank accounts" onRetry={() => refetch()} />
//     </Box>
//   );

//   return (
//     <Box>
//       <PageHeader title="Bank Accounts" subtitle="View balances and manage bank transactions" breadcrumbs={[{ label: 'Bank Accounts' }]}
//         action={
//           <Stack direction="row" spacing={1}>
//             <Button variant="outlined" startIcon={<FileText size={18} />} onClick={handleExport} sx={{ borderRadius: 2 }}>Export PDF</Button>
//             <Button variant="contained" startIcon={<PlusCircle size={18} />} onClick={() => setAddOpen(true)} sx={{ borderRadius: 2 }}>Add Bank Account</Button>
//           </Stack>
//         } />

//       <Grid container spacing={2.5}>
//         {accounts.map((acc, i) => (
//           <Grid item xs={12} md={6} lg={4} key={acc.id}>
//             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
//               <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
//                 <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(37,99,235,0.06)' }} />
//                 <CardContent sx={{ p: 3, position: 'relative' }}>
//                   <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
//                     <Stack direction="row" spacing={1.5} alignItems="center">
//                       <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, p: 1.25, display: 'flex' }}>
//                         <Landmark size={22} />
//                       </Box>
//                       <Box>
//                         <Typography sx={{ fontWeight: 700, fontSize: 17 }}>{acc.bank_name}</Typography>
//                         <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{acc.account_number}</Typography>
//                       </Box>
//                     </Stack>
//                     <Chip label={acc.status} size="small" color={acc.status === 'active' ? 'success' : 'default'} variant="outlined" />
//                   </Stack>

//                   <Box sx={{ py: 1.5, mb: 2, bgcolor: 'action.hover', borderRadius: 2, px: 2 }}>
//                     <Typography variant="caption" color="text.secondary">Current Balance</Typography>
//                     <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{formatCurrency(acc.current_balance)}</Typography>
//                   </Box>

//                   <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
//                     <Button size="small" variant="outlined" startIcon={<Eye size={16} />} onClick={() => navigate(`/bank-accounts/${acc.id}`)} sx={{ borderRadius: 2 }}>Ledger</Button>
//                     <Button size="small" variant="outlined" color="success" startIcon={<ArrowDownToLine size={16} />} onClick={() => setAction({ type: 'Deposit', bank: acc })} sx={{ borderRadius: 2 }}>Deposit</Button>
//                     <Button size="small" variant="outlined" color="error" startIcon={<ArrowUpFromLine size={16} />} onClick={() => setAction({ type: 'Withdraw', bank: acc })} sx={{ borderRadius: 2 }}>Withdraw</Button>
//                     <Button size="small" variant="outlined" startIcon={<ArrowLeftRight size={16} />} onClick={() => setAction({ type: 'Transfer', bank: acc })} sx={{ borderRadius: 2 }}>Transfer</Button>
//                   </Stack>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </Grid>
//         ))}
//       </Grid>

//       <FormDialog open={!!action} title={`${action?.type} - ${action?.bank.bank_name}`} fields={[
//         { name: 'amount', label: 'Amount', type: 'number', required: true },
//         { name: 'description', label: 'Description', required: true },
//         ...(action?.type === 'Transfer' ? [{ name: 'toAccount', label: 'To Account', type: 'select' as const, options: accounts.filter((a) => a.id !== action.bank.id).map((a) => ({ value: a.id, label: `${a.bank_name} — ${a.account_number}` })), required: true }] : []),
//       ]} onClose={() => setAction(null)} onSubmit={handleAction} />

//       <FormDialog open={addOpen} title="Add Bank Account" fields={[
//         { name: 'account_title', label: 'Account Title', required: true },
//         { name: 'account_number', label: 'Account Number', required: true },
//         { name: 'bank_name', label: 'Bank Name', required: true },
//         { name: 'initial_balance', label: 'Initial Balance', type: 'number', required: true, defaultValue: 0 },
//       ]} onClose={() => setAddOpen(false)} onSubmit={(vals) => {
//         createBankMut.mutate({
//           account_title: String(vals.account_title),
//           account_number: String(vals.account_number),
//           bank_name: String(vals.bank_name),
//           initial_balance: Number(vals.initial_balance),
//         }, { onSuccess: () => setAddOpen(false) });
//       }} />
//     </Box>
//   );
// }

import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Landmark,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  FileText,
  PlusCircle,
  Trash2,
} from 'lucide-react';

import PageHeader from '@/components/PageHeader';
import FormDialog from '@/components/FormDialog';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import {
  useBankAccounts,
  useCreateBankAccount,
  useTransfer,
  useDeleteBankAccount,
  useUpdateBankAccountStatus,
  type BankAccount,
} from '@/hooks/useCashBank';
import { formatCurrency } from '@/utils/format';

export default function BankAccounts() {
  const navigate = useNavigate();

  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useBankAccounts();

  const transferMut = useTransfer();
  const createBankMut = useCreateBankAccount();
  const deleteBankMut = useDeleteBankAccount();
  const statusMut = useUpdateBankAccountStatus();

  const [action, setAction] = useState<{
    type: 'Deposit' | 'Withdraw' | 'Transfer';
    bank: BankAccount;
  } | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const accounts: BankAccount[] = result?.data ?? [];

  const handleExport = () => {
    import('@/components/PDFButton').then(({ exportTableToPDF }) => {
      exportTableToPDF(
        'Bank Accounts',
        ['Bank', 'Account Number', 'Current Balance', 'Status'],
        accounts.map((account) => [
          account.bank_name,
          account.account_number,
          formatCurrency(account.current_balance),
          account.status,
        ])
      );
    });
  };

  const handleAction = (vals: Record<string, string | number>) => {
    if (!action) return;

    if (action.type === 'Transfer') {
      transferMut.mutate(
        {
          from_type: 'bank',
          to_type: 'bank',
          from_bank_account_id: action.bank.id,
          to_bank_account_id: String(vals.toAccount),
          amount: Number(vals.amount),
          description: String(vals.description),
        },
        {
          onSuccess: () => setAction(null),
        }
      );
    } else {
      transferMut.mutate(
        {
          from_type: action.type === 'Withdraw' ? 'bank' : 'cash',
          to_type: action.type === 'Withdraw' ? 'cash' : 'bank',
          from_bank_account_id:
            action.type === 'Withdraw' ? action.bank.id : undefined,
          to_bank_account_id:
            action.type === 'Deposit' ? action.bank.id : undefined,
          amount: Number(vals.amount),
          description: String(vals.description),
        },
        {
          onSuccess: () => setAction(null),
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader
          title="Bank Accounts"
          subtitle="View balances and manage bank transactions"
          breadcrumbs={[{ label: 'Bank Accounts' }]}
          action={
            <Button
              variant="contained"
              startIcon={<FileText size={18} />}
              onClick={handleExport}
              sx={{ borderRadius: 2 }}
            >
              Export PDF
            </Button>
          }
        />

        <CardGridSkeleton count={3} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <PageHeader
          title="Bank Accounts"
          subtitle="View balances and manage bank transactions"
          breadcrumbs={[{ label: 'Bank Accounts' }]}
        />

        <ErrorState
          message="Failed to load bank accounts"
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Bank Accounts"
        subtitle="View balances and manage bank transactions"
        breadcrumbs={[{ label: 'Bank Accounts' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FileText size={18} />}
              onClick={handleExport}
              sx={{ borderRadius: 2 }}
            >
              Export PDF
            </Button>

            <Button
              variant="contained"
              startIcon={<PlusCircle size={18} />}
              onClick={() => setAddOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Bank Account
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2.5}>
        {accounts.map((acc, i) => (
          <Grid item xs={12} md={6} lg={4} key={acc.id}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.06,
              }}
            >
              {/* <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              > */}
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: acc.status === 'inactive' ? 0.65 : 1,
                  border:
                    acc.status === 'inactive'
                      ? '1px solid'
                      : undefined,
                  borderColor:
                    acc.status === 'inactive'
                      ? 'divider'
                      : undefined,
                }}
              >
                <Box
                  // sx={{
                  //   position: 'absolute',
                  //   top: -30,
                  //   right: -30,
                  //   width: 120,
                  //   height: 120,
                  //   borderRadius: '50%',
                  //   bgcolor: 'rgba(37,99,235,0.06)',
                  // }}
                    sx={{
                      bgcolor:
                        acc.status === 'inactive'
                          ? 'action.disabledBackground'
                          : 'primary.main',
                      // color:
                      //   acc.status === 'inactive'
                      //     ? 'text.disabled'
                      //     : 'primary.contrastText',
                      // borderRadius: 2,
                      p: 0.25,
                      display: 'flex',
                    }}
                />

                <CardContent
                  sx={{
                    p: 3,
                    position: 'relative',
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 2.5 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderRadius: 2,
                          p: 1.25,
                          display: 'flex',
                        }}
                      >
                        <Landmark size={22} />
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 17,
                          }}
                        >
                          {acc.bank_name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {acc.account_number}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* <Chip
                      label={acc.status}
                      size="small"
                      color={
                        acc.status === 'active' ? 'success' : 'default'
                      }
                      variant="outlined"
                    /> */}
                    <Chip
                      label={acc.status === 'active' ? 'Active' : 'Inactive'}
                      size="small"
                      color={acc.status === 'active' ? 'success' : 'error'}
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        ...(acc.status === 'inactive' && {
                          bgcolor: 'error.50',
                          borderColor: 'error.main',
                        }),
                      }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      py: 1.5,
                      mb: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      px: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Current Balance
                    </Typography>

                    {/* <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: 'primary.main',
                      }}
                    > */}
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color:
                          acc.status === 'inactive'
                            ? 'text.secondary'
                            : 'primary.main',
                      }}
                    >
                      {formatCurrency(acc.current_balance)}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={16} />}
                      onClick={() =>
                        navigate(`/bank-accounts/${acc.id}`)
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      Ledger
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<ArrowDownToLine size={16} />}
                      onClick={() =>
                        setAction({
                          type: 'Deposit',
                          bank: acc,
                        })
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      Deposit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<ArrowUpFromLine size={16} />}
                      onClick={() =>
                        setAction({
                          type: 'Withdraw',
                          bank: acc,
                        })
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      Withdraw
                    </Button>

                    {/* DELETE BUTTON IF NEEDED LATER (ALL THE WORKING IS DONE) */}
                    
                    {/* <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${acc.bank_name}?`
                          )
                        ) {
                          deleteBankMut.mutate(acc.id);
                        }
                      }}
                      disabled={deleteBankMut.isPending}
                      sx={{ borderRadius: 2 }}
                    >
                      {deleteBankMut.isPending ? 'Deleting...' : 'Delete'}
                    </Button> */}
                    <Button
                      size="small"
                      variant="outlined"
                      color={acc.status === 'active' ? 'error' : 'success'}
                      onClick={() => {
                        const newStatus =
                          acc.status === 'active' ? 'inactive' : 'active';

                        statusMut.mutate({
                          id: acc.id,
                          status: newStatus,
                        });
                      }}
                      disabled={statusMut.isPending}
                      sx={{ borderRadius: 2 }}
                    >
                      {acc.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Deposit / Withdraw / Transfer */}
      <FormDialog
        open={!!action}
        title={`${action?.type} - ${action?.bank.bank_name}`}
        fields={[
          {
            name: 'amount',
            label: 'Amount',
            type: 'number',
            required: true,
          },

          {
            name: 'description',
            label: 'Description',
            required: true,
          },

          ...(action?.type === 'Transfer'
            ? [
                {
                  name: 'toAccount',
                  label: 'To Account',
                  type: 'select' as const,
                  options: accounts
                    .filter((a) => a.id !== action.bank.id)
                    .map((a) => ({
                      value: a.id,
                      label: `${a.bank_name} — ${a.account_number}`,
                    })),
                  required: true,
                },
              ]
            : []),
        ]}
        onClose={() => setAction(null)}
        onSubmit={handleAction}
      />

      {/* Add Bank Account */}
      <FormDialog
        open={addOpen}
        title="Add Bank Account"
        fields={[
          {
            name: 'bank_name',
            label: 'Bank Name',
            required: true,
          },

          {
            name: 'account_number',
            label: 'Account Number',
            required: true,
          },

          {
            name: 'current_balance',
            label: 'Current Balance',
            type: 'number',
            required: true,
            defaultValue: 0,
          },
        ]}
        onClose={() => setAddOpen(false)}
        onSubmit={(vals) => {
          createBankMut.mutate(
            {
              bank_name: String(vals.bank_name),
              account_number: String(vals.account_number),
              current_balance: Number(vals.current_balance),
            },
            {
              onSuccess: () => setAddOpen(false),
            }
          );
        }}
      />
    </Box>
  );
}

