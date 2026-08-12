import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';

export interface SaleCustomerOption {
  value: string;
  label: string;
}

export interface SaleProductOption {
  value: string;
  label: string;
  sale_price: number;
  stock_quantity: number;
}

export interface SaleBankOption {
  value: string;
  label: string;
}

export interface SaleFormItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface SaleFormDialogProps {
  open: boolean;
  customers: SaleCustomerOption[];
  products: SaleProductOption[];
  banks: SaleBankOption[];
  onClose: () => void;
  onSubmit: (data: {
    customer_id: string;
    payment_method: 'cash' | 'bank' | 'credit' | 'mixed';
    paid_amount: number;
    bank_account_id?: string;
    items: SaleFormItem[];
  }) => void;
  loading?: boolean;
}

const paymentMethods = ['cash', 'bank', 'credit', 'mixed'] as const;

type PaymentMethod = (typeof paymentMethods)[number];

const emptyItem = (): SaleFormItem => ({
  product_id: '',
  quantity: 1,
  unit_price: 0,
});

export default function SaleFormDialog({
  open,
  customers,
  products,
  banks,
  onClose,
  onSubmit,
  loading = false,
}: SaleFormDialogProps) {
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [bankAccountId, setBankAccountId] = useState('');
  const [items, setItems] = useState<SaleFormItem[]>([emptyItem()]);

  useEffect(() => {
    if (!open) return;

    setCustomerId('');
    setPaymentMethod('cash');
    setPaidAmount(0);
    setBankAccountId('');
    setItems([emptyItem()]);
  }, [open]);

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.unit_price || 0),
        0
      ),
    [items]
  );

  const remainingAmount = Math.max(
    0,
    totalAmount - Number(paidAmount || 0)
  );

  const updateItem = (
    index: number,
    changes: Partial<SaleFormItem>
  ) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, ...changes } : item
      )
    );
  };

  const handleProductChange = (
    index: number,
    productId: string
  ) => {
    const product = products.find(
      (p) => p.value === productId
    );

    updateItem(index, {
      product_id: productId,
      unit_price: product?.sale_price ?? 0,
      quantity: 1,
    });
  };

  const addItem = () => {
    setItems((current) => [...current, emptyItem()]);
  };

  const removeItem = (index: number) => {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = () => {
    const validItems = items.filter(
      (item) =>
        item.product_id &&
        Number(item.quantity) > 0 &&
        Number(item.unit_price) >= 0
    );

    if (!customerId || validItems.length === 0) {
      return;
    }

    if (Number(paidAmount) > totalAmount) {
      return;
    }

    onSubmit({
      customer_id: customerId,
      payment_method: paymentMethod,
      paid_amount: Number(paidAmount),
      bank_account_id:
        paymentMethod === 'bank' || paymentMethod === 'mixed'
          ? bankAccountId || undefined
          : undefined,
      items: validItems.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Create Sale
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Customer */}
          <TextField
            select
            fullWidth
            label="Customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            {customers.map((customer) => (
              <MenuItem
                key={customer.value}
                value={customer.value}
              >
                {customer.label}
              </MenuItem>
            ))}
          </TextField>

          <Divider />

          {/* Items */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography fontWeight={700}>
                Sale Items
              </Typography>

              <Button
                size="small"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={addItem}
                sx={{ borderRadius: 2 }}
              >
                Add Item
              </Button>
            </Box>

            <Stack spacing={1.5}>
              {items.map((item, index) => {
                const selectedProduct = products.find(
                  (p) => p.value === item.product_id
                );

                const itemTotal =
                  Number(item.quantity || 0) *
                  Number(item.unit_price || 0);

                return (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction={{
                        xs: 'column',
                        sm: 'row',
                      }}
                      spacing={1.5}
                      alignItems={{
                        xs: 'stretch',
                        sm: 'center',
                      }}
                    >
                      {/* Product */}
                      <TextField
                        select
                        fullWidth
                        label="Product"
                        value={item.product_id}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            e.target.value
                          )
                        }
                        sx={{ flex: 2 }}
                      >
                        {products.map((product) => (
                          <MenuItem
                            key={product.value}
                            value={product.value}
                            disabled={
                              product.stock_quantity <= 0
                            }
                          >
                            {product.label} — Stock:{' '}
                            {product.stock_quantity}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Quantity */}
                      <TextField
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, {
                            quantity: Number(e.target.value),
                          })
                        }
                        inputProps={{
                          min: 0.01,
                          step: 0.01,
                        }}
                        sx={{ width: { xs: '100%', sm: 120 } }}
                      />

                      {/* Unit Price */}
                      <TextField
                        label="Unit Price"
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, {
                            unit_price: Number(e.target.value),
                          })
                        }
                        inputProps={{
                          min: 0,
                          step: 0.01,
                        }}
                        sx={{ width: { xs: '100%', sm: 140 } }}
                      />

                      {/* Item Total */}
                      <Box
                        sx={{
                          minWidth: { sm: 110 },
                          textAlign: {
                            xs: 'left',
                            sm: 'right',
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Total
                        </Typography>

                        <Typography fontWeight={700}>
                          {itemTotal.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </Typography>
                      </Box>

                      {/* Delete */}
                      <IconButton
                        color="error"
                        disabled={items.length === 1}
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Stack>

                    {selectedProduct &&
                      Number(item.quantity) >
                        selectedProduct.stock_quantity && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            display: 'block',
                            mt: 1,
                          }}
                        >
                          Quantity exceeds available stock
                          ({selectedProduct.stock_quantity}).
                        </Typography>
                      )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Divider />

          {/* Payment */}
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={2}
          >
            <TextField
              select
              fullWidth
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as PaymentMethod
                )
              }
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method.charAt(0).toUpperCase() +
                    method.slice(1)}
                </MenuItem>
              ))}
            </TextField>

            {(paymentMethod === 'bank' ||
              paymentMethod === 'mixed') && (
              <TextField
                select
                fullWidth
                label="Bank Account"
                value={bankAccountId}
                onChange={(e) =>
                  setBankAccountId(e.target.value)
                }
              >
                {banks.map((bank) => (
                  <MenuItem
                    key={bank.value}
                    value={bank.value}
                  >
                    {bank.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>

          {/* Paid Amount */}
          <TextField
            fullWidth
            label="Paid Amount"
            type="number"
            value={paidAmount}
            onChange={(e) =>
              setPaidAmount(Number(e.target.value))
            }
            inputProps={{
              min: 0,
              max: totalAmount,
              step: 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  Rs.
                </InputAdornment>
              ),
            }}
          />

          {/* Summary */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Stack spacing={1}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography color="text.secondary">
                  Total
                </Typography>

                <Typography fontWeight={700}>
                  Rs.{' '}
                  {totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography color="text.secondary">
                  Paid
                </Typography>

                <Typography
                  fontWeight={700}
                  color="success.main"
                >
                  Rs.{' '}
                  {Number(paidAmount || 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography fontWeight={700}>
                  Remaining
                </Typography>

                <Typography
                  fontWeight={700}
                  color={
                    remainingAmount > 0
                      ? 'warning.main'
                      : 'success.main'
                  }
                >
                  Rs.{' '}
                  {remainingAmount.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            !customerId ||
            items.every((item) => !item.product_id) ||
            paidAmount > totalAmount ||
            items.some((item) => {
              const product = products.find((p) => p.value === item.product_id);
              return Boolean(product) && Number(item.quantity) > Number(product?.stock_quantity ?? 0);
            }) ||
            ((paymentMethod === 'bank' || paymentMethod === 'mixed') && !bankAccountId)
          }
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Creating...' : 'Create Sale'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}