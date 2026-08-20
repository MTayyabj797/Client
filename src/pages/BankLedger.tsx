import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, FileText, Printer, Landmark } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DataTable, { TablePagination } from '@/components/DataTable';
import LedgerSummary from '@/components/LedgerSummary';
import FormDialog from '@/components/FormDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useBankAccounts, useBankLedger,  useUpdateBankTransaction, useTransfer, type BankTransaction } from '@/hooks/useCashBank';
import { formatCurrency, formatDate } from '@/utils/format';
import { exportTableToPDF, printDocument } from '@/components/PDFButton';

export default function BankLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [dialog, setDialog] = useState<null | 'Deposit' | 'Withdraw' | 'Transfer'>(null);

  const { data: accountsData } = useBankAccounts();
  const account = accountsData?.data.find((a) => a.id === id);
  const ledgerQuery = useBankLedger(id!, { page, limit: rowsPerPage });
  const transferMut = useTransfer();

  const entries: BankTransaction[] = ledgerQuery.data?.data ?? [];
  const meta = ledgerQuery.data?.meta;
  const current = account?.current_balance ?? entries[entries.length - 1]?.running_balance ?? 0;
  const totalDeposit = entries.reduce((s, e) => s + e.deposit, 0);
  const totalWithdrawal = entries.reduce((s, e) => s + e.withdrawal, 0);

  const updateTransactionMut = useUpdateBankTransaction();

  const [editingTransaction, setEditingTransaction] =
    useState<BankTransaction | null>(null);

  const handleAction = (vals: Record<string, string | number>) => {
    const amount = Number(vals.amount);
    if (dialog === 'Transfer') {
      transferMut.mutate({ from_type: 'bank', to_type: 'bank', from_bank_account_id: id, to_bank_account_id: String(vals.toAccount), amount, description: String(vals.description) }, { onSuccess: () => setDialog(null) });
    } else {
      transferMut.mutate({
        from_type: dialog === 'Withdraw' ? 'bank' : 'cash',
        to_type: dialog === 'Withdraw' ? 'cash' : 'bank',
        from_bank_account_id: dialog === 'Withdraw' ? id : undefined,
        to_bank_account_id: dialog === 'Deposit' ? id : undefined,
        amount, description: String(vals.description),
      }, { onSuccess: () => setDialog(null) });
    }
  };

  const handleExport = () => {
    exportTableToPDF(`Bank Ledger - ${account?.bank_name ?? id}`, ['Date', 'Description', 'Deposit', 'Withdrawal', 'Balance'],
      entries.map((e) => [formatDate(e.date), e.description, formatCurrency(e.deposit), formatCurrency(e.withdrawal), formatCurrency(e.running_balance)]),
      `Account: ${account?.bank_name} ${account?.account_number}`);
  };

  const handlePrint = () => {
    const rowsHtml = entries.map((e) => `<tr><td>${formatDate(e.date)}</td><td>${e.description}</td><td>${formatCurrency(e.deposit)}</td><td>${formatCurrency(e.withdrawal)}</td><td>${formatCurrency(e.running_balance)}</td></tr>`).join('');
    printDocument(`Bank Ledger - ${account?.bank_name}`, `<h1>Bank Ledger</h1><p class="sub">${account?.bank_name} · ${account?.account_number}</p><table><thead><tr><th>Date</th><th>Description</th><th>Deposit</th><th>Withdrawal</th><th>Balance</th></tr></thead><tbody>${rowsHtml}</tbody></table>`);
  };

  const columns = [
    { id: 'date', label: 'Date', render: (r: typeof entries[number]) => formatDate(r.date) },
    { id: 'description', label: 'Description' },
    { id: 'deposit', label: 'Deposit', align: 'right' as const, render: (r: typeof entries[number]) => (r.deposit ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(r.deposit)}</span> : '—') },
    { id: 'withdrawal', label: 'Withdrawal', align: 'right' as const, render: (r: typeof entries[number]) => (r.withdrawal ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(r.withdrawal)}</span> : '—') },
    { id: 'running_balance', label: 'Balance', align: 'right' as const, render: (r: typeof entries[number]) => <strong>{formatCurrency(r.running_balance)}</strong> },
  ];

  const summaryCards = [
    { title: 'Current Balance', value: formatCurrency(current), icon: Landmark, color: '#2563eb' },
    { title: 'Total Deposits', value: formatCurrency(totalDeposit), icon: ArrowDownToLine, color: '#16a34a' },
    { title: 'Total Withdrawals', value: formatCurrency(totalWithdrawal), icon: ArrowUpFromLine, color: '#dc2626' },
    { title: 'Net Movement', value: formatCurrency(totalDeposit - totalWithdrawal), icon: ArrowLeftRight, color: '#0891b2' },
  ];

  return (
    <Box>
      <PageHeader title={account ? `${account.bank_name} - Ledger` : 'Bank Ledger'} subtitle={account?.account_number}
        breadcrumbs={[{ label: 'Bank Accounts', path: '/bank-accounts' }, { label: account?.bank_name ?? 'Ledger' }]}
        action={<Button variant="outlined" startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/bank-accounts')} sx={{ borderRadius: 2 }}>Back</Button>} />

      {ledgerQuery.isLoading ? <LoadingSkeleton rows={4} /> : ledgerQuery.isError ? <ErrorState message="Failed to load bank ledger" onRetry={() => ledgerQuery.refetch()} /> : <LedgerSummary cards={summaryCards} />}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="outlined" color="success" startIcon={<ArrowDownToLine size={18} />} onClick={() => setDialog('Deposit')} sx={{ borderRadius: 2 }}>Deposit</Button>
        <Button variant="outlined" color="error" startIcon={<ArrowUpFromLine size={18} />} onClick={() => setDialog('Withdraw')} sx={{ borderRadius: 2 }}>Withdraw</Button>
        <Button variant="outlined" startIcon={<ArrowLeftRight size={18} />} onClick={() => setDialog('Transfer')} sx={{ borderRadius: 2 }}>Transfer</Button>
        <Button variant="outlined" startIcon={<Printer size={18} />} onClick={handlePrint} sx={{ borderRadius: 2 }}>Print</Button>
        <Button variant="contained" startIcon={<FileText size={18} />} onClick={handleExport} sx={{ borderRadius: 2 }}>Export PDF</Button>
      </Stack>

      {ledgerQuery.isLoading ? <LoadingSkeleton rows={8} /> : ledgerQuery.isError ? <ErrorState message="Failed to load ledger" onRetry={() => ledgerQuery.refetch()} /> : entries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">No transactions found for this account.</Typography></Box>
      ) : (
        <>
          {/* <DataTable columns={columns} rows={entries} rowKey={(r) => r.id} /> */}
          <DataTable
            columns={columns}
            rows={entries}
            rowKey={(r) => r.id}
            onEdit={(transaction) => {
              setEditingTransaction(transaction);
            }}
          />
          <TablePagination count={meta?.total ?? entries.length} page={page - 1} rowsPerPage={rowsPerPage} onPageChange={(p) => setPage(p + 1)} />
        </>
      )}

      <FormDialog open={!!dialog} title={dialog ?? ''} fields={[
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'description', label: 'Description', required: true },
        ...(dialog === 'Transfer' ? [{ name: 'toAccount', label: 'To Account', type: 'select' as const, options: (accountsData?.data ?? []).filter((a) => a.id !== id).map((a) => a.id), required: true }] : []),
      ]} onClose={() => setDialog(null)} onSubmit={handleAction} />
      <FormDialog
        open={!!editingTransaction}
        title="Edit Bank Transaction"
        fields={[
          {
            name: 'date',
            label: 'Date',
            type: 'date',
            required: true,
            defaultValue: editingTransaction
              ? new Date(editingTransaction.date)
                  .toISOString()
                  .slice(0, 10)
              : '',
          },
          {
            name: 'description',
            label: 'Description',
            required: true,
            defaultValue:
              editingTransaction?.description ?? '',
          },
          {
            name: 'deposit',
            label: 'Deposit',
            type: 'number',
            defaultValue:
              editingTransaction?.deposit ?? 0,
          },
          {
            name: 'withdrawal',
            label: 'Withdrawal',
            type: 'number',
            defaultValue:
              editingTransaction?.withdrawal ?? 0,
          },
        ]}
        onClose={() => setEditingTransaction(null)}
        onSubmit={(vals) => {
          if (!editingTransaction || !id) return;

          updateTransactionMut.mutate(
            {
              accountId: id,
              transactionId: editingTransaction.id,
              body: {
                date: vals.date,
                description: String(vals.description),
                deposit: Number(vals.deposit),
                withdrawal: Number(vals.withdrawal),
              },
            },
            {
              onSuccess: () => {
                setEditingTransaction(null);
              },
            }
          );
        }}
      />
    </Box>
  );
}
