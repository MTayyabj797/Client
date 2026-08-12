import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { FileText, Printer, X } from 'lucide-react';
import { exportTableToPDF, printDocument } from '@/components/PDFButton';

import type { Sale } from '@/api/services';
import { formatCurrency, formatDate } from '@/utils/format';

interface SaleDetailsDialogProps {
  open: boolean;
  sale?: Sale | null;
  loading?: boolean;
  onClose: () => void;
}

const methodLabel = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '—';

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;')
    .replace('"', '&quot;')
    .replace("'", '&#039;');

export default function SaleDetailsDialog({ open, sale, loading = false, onClose }: SaleDetailsDialogProps) {
  if (!sale && !loading) return null;

  const items = sale?.items ?? [];
  const customer = sale?.customer_id;
  const bank = sale?.bank_account_id;

  // const handleExport = () => {
  //   if (!sale) return;
  //   exportTableToPDF(
  //     `Sale Invoice - ${sale.invoice_no}`,
  //     ['Product', 'SKU', 'Qty', 'Unit Price', 'Total'],
  //     items.map((item) => [
  //       item.product_id?.name ?? '—',
  //       item.product_id?.sku ?? '—',
  //       String(item.quantity),
  //       formatCurrency(item.unit_price),
  //       formatCurrency(item.total_price),
  //     ]),
  //     `Customer: ${customer?.name ?? '—'} | Invoice: ${sale.invoice_no} | Date: ${formatDate(sale.date)} | Total: ${formatCurrency(sale.total_amount)} | Paid: ${formatCurrency(sale.paid_amount)} | Remaining: ${formatCurrency(sale.remaining_amount)}`
  //   );
  // };
  const handleExport = () => {
  if (!sale) return;

  exportTableToPDF(
    `Sale Invoice - ${sale.invoice_no}`,
    ['Product', 'SKU', 'Qty', 'Unit Price', 'Total'],
    items.map((item) => [
      item.product_id?.name ?? '—',
      item.product_id?.sku ?? '—',
      String(item.quantity),
      formatCurrency(item.unit_price),
      formatCurrency(item.total_price),
    ]),
    `Customer: ${customer?.name ?? '—'} | Invoice: ${sale.invoice_no} | Date: ${formatDate(sale.date)}`,
    [
      {
        label: 'Net Total',
        value: formatCurrency(sale.total_amount),
      },
      {
        label: 'Paid',
        value: formatCurrency(sale.paid_amount),
      },
      {
        label: 'Remaining',
        value: formatCurrency(sale.remaining_amount),
      },
    ]
  );
};

  const handlePrint = () => {
    if (!sale) return;
    const rows = items
      .map((item) => `<tr><td>${escapeHtml(item.product_id?.name ?? '—')}</td><td>${escapeHtml(item.product_id?.sku ?? '—')}</td><td>${escapeHtml(item.quantity)}</td><td>${escapeHtml(formatCurrency(item.unit_price))}</td><td>${escapeHtml(formatCurrency(item.total_price))}</td></tr>`)
      .join('');

    printDocument(
      `Sale Invoice - ${sale.invoice_no}`,
      `<h1>Sale Invoice</h1>
       <p class="sub"><strong>${escapeHtml(sale.invoice_no)}</strong> · ${escapeHtml(formatDate(sale.date))}</p>
       <p><strong>Customer:</strong> ${escapeHtml(customer?.name ?? '—')} · ${escapeHtml(customer?.phone ?? '')}</p>
       <p><strong>Payment:</strong> ${escapeHtml(methodLabel(sale.payment_method))}${bank ? ` · ${escapeHtml(bank.bank_name)} — ${escapeHtml(bank.account_number)}` : ''}</p>
       <table><thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
       <div class="totals"><p><strong>Total:</strong> ${escapeHtml(formatCurrency(sale.total_amount))}</p><p><strong>Paid:</strong> ${escapeHtml(formatCurrency(sale.paid_amount))}</p><p><strong>Remaining:</strong> ${escapeHtml(formatCurrency(sale.remaining_amount))}</p></div>`
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700}>Sale Details</Typography>
            {sale && <Typography variant="body2" color="text.secondary">{sale.invoice_no}</Typography>}
          </Box>
          <Button onClick={onClose} size="small" sx={{ minWidth: 0 }}><X size={18} /></Button>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack spacing={2} sx={{ py: 3 }}>
            <Typography color="text.secondary">Loading sale details...</Typography>
          </Stack>
        ) : sale ? (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box><Typography variant="caption" color="text.secondary">Customer</Typography><Typography fontWeight={600}>{customer?.name ?? '—'}</Typography><Typography variant="body2" color="text.secondary">{customer?.phone ?? ''}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography fontWeight={600}>{formatDate(sale.date)}</Typography><Typography variant="body2" color="text.secondary">Payment: {methodLabel(sale.payment_method)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Status</Typography><Box sx={{ mt: 0.5 }}><Chip size="small" label={methodLabel(sale.status)} color={sale.status === 'paid' ? 'success' : sale.status === 'partial' ? 'warning' : sale.status === 'cancelled' ? 'default' : 'error'} /></Box>{bank && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{bank.bank_name} — {bank.account_number}</Typography>}</Box>
            </Box>

            <Divider />

            <Table size="small">
              <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>Product</TableCell><TableCell sx={{ fontWeight: 700 }}>SKU</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell></TableRow></TableHead>
              <TableBody>
                {items.length === 0 ? <TableRow><TableCell colSpan={5} align="center">No items found</TableCell></TableRow> : items.map((item) => <TableRow key={item.id}><TableCell>{item.product_id?.name ?? '—'}</TableCell><TableCell>{item.product_id?.sku ?? '—'}</TableCell><TableCell align="right">{item.quantity}</TableCell><TableCell align="right">{formatCurrency(item.unit_price)}</TableCell><TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(item.total_price)}</TableCell></TableRow>)}
              </TableBody>
            </Table>

            <Box sx={{ ml: 'auto', width: { xs: '100%', sm: 320 } }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Total</Typography><Typography fontWeight={700}>{formatCurrency(sale.total_amount)}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Paid</Typography><Typography fontWeight={700} color="success.main">{formatCurrency(sale.paid_amount)}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>Remaining</Typography><Typography fontWeight={700} color={sale.remaining_amount > 0 ? 'warning.main' : 'success.main'}>{formatCurrency(sale.remaining_amount)}</Typography></Stack>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" startIcon={<Printer size={17} />} onClick={handlePrint} disabled={!sale || loading} sx={{ borderRadius: 2 }}>Print</Button>
        <Button variant="contained" startIcon={<FileText size={17} />} onClick={handleExport} disabled={!sale || loading} sx={{ borderRadius: 2 }}>Export PDF</Button>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
