import axiosInstance, { type ApiSuccessResponse } from '../axios';

const list = async <T>(path: string, params?: Record<string, unknown>) => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<T[]>>(path, { params });
  return data;
};

const get = async <T>(path: string) => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<T>>(path);
  return data.data;
};

const create = async <T>(path: string, body: unknown) => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<T>>(path, body);
  return data.data;
};

const update = async <T>(path: string, body: unknown) => {
  const { data } = await axiosInstance.put<ApiSuccessResponse<T>>(path, body);
  return data.data;
};

const remove = async (path: string) => {
  const { data } = await axiosInstance.delete<ApiSuccessResponse<unknown>>(path);
  return data.data;
};

const patch = async <T>(path: string, body: unknown) => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<T>>(path, body);
  return data.data;
};

// ===== Types =====
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  opening_balance: number;
  current_balance: number;
  status: 'active' | 'inactive';
}

export interface LedgerEntry {
  id: string;
  customer_id?: string;
  supplier_id?: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  payment_method: string;
  ref_type?: string;
  ref_id?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  opening_balance: number;
  current_balance: number;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  category_id?: { id: string; name: string; description?: string } | string;
  sku: string;
  purchase_price: number;
  sale_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  status: 'active' | 'inactive';
}

export interface SaleItem {
  id: string;
  product_id: { id: string; name: string; sku: string };
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  invoice_no: string;
  customer_id: { id: string; name: string; phone: string; address?: string };
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: 'cash' | 'bank' | 'credit' | 'mixed';
  bank_account_id?: { id: string; bank_name: string; account_number: string };
  status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  date: string;
  items?: SaleItem[];
}

export interface Purchase {
  id: string;
  invoice_no: string;
  supplier_id: { id: string; name: string; phone: string; address?: string };
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: 'cash' | 'bank' ;
  bank_account_id?: { id: string; bank_name: string; account_number: string };
  status: 'paid' | 'unpaid' ;
  date: string;
  items?: SaleItem[];
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  category_id: { id: string; name: string };
  description: string;
  amount: number;
  payment_method: 'cash' | 'bank';
  bank_account_id?: { id: string; bank_name: string; account_number: string };
  date: string;
}

export interface CashEntry {
  id: string;
  date: string;
  description: string;
  cash_in: number;
  cash_out: number;
  running_balance: number;
  ref_type?: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  current_balance: number;
  status: 'active' | 'inactive';
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  date: string;
  description: string;
  deposit: number;
  withdrawal: number;
  running_balance: number;
  ref_type?: string;
}

export interface DailyEntry {
  id: string;
  date: string;
  description: string;
  ref_type?: string;
  ref_id?: string;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface DashboardSummary {
  todays_sales: number;
  todays_expenses: number;
  cash_in_hand: number;
  bank_balances: BankAccount[];
  total_bank_balance: number;
  total_receivables: number;
  total_payables: number;
  recent_transactions: DailyEntry[];
}

export interface DashboardCharts {
  monthly_sales: { month: string; sales: number }[];
  monthly_expenses: { month: string; expenses: number }[];
  cash_flow: { month: string; cash_in: number; cash_out: number; net: number }[];
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  logo_url: string;
  phone: string;
  address: string;
  currency: string;
  language: string;
}

// ===== Services =====
export const customerService = {
  list: (params?: Record<string, unknown>) => list<Customer>('/customers', params),
  get: (id: string) => get<Customer>(`/customers/${id}`),
  create: (body: unknown) => create<Customer>('/customers', body),
  update: (id: string, body: unknown) => update<Customer>(`/customers/${id}`, body),
  remove: (id: string) => remove(`/customers/${id}`),
  ledger: (id: string, params?: Record<string, unknown>) => list<LedgerEntry>(`/customers/${id}/ledger`, params),
  addLedgerEntry: (id: string, body: unknown) => create<LedgerEntry>(`/customers/${id}/ledger`, body),
};

export const supplierService = {
  list: (params?: Record<string, unknown>) => list<Supplier>('/suppliers', params),
  get: (id: string) => get<Supplier>(`/suppliers/${id}`),
  create: (body: unknown) => create<Supplier>('/suppliers', body),
  update: (id: string, body: unknown) => update<Supplier>(`/suppliers/${id}`, body),
  remove: (id: string) => remove(`/suppliers/${id}`),
  ledger: (id: string, params?: Record<string, unknown>) => list<LedgerEntry>(`/suppliers/${id}/ledger`, params),
  addLedgerEntry: (id: string, body: unknown) => create<LedgerEntry>(`/suppliers/${id}/ledger`, body),
};

export const productService = {
  list: (params?: Record<string, unknown>) => list<Product>('/products', params),
  get: (id: string) => get<Product>(`/products/${id}`),
  create: (body: unknown) => create<Product>('/products', body),
  update: (id: string, body: unknown) => update<Product>(`/products/${id}`, body),
  remove: (id: string) => remove(`/products/${id}`),
  adjustStock: (id: string, body: unknown) => patch<Product>(`/products/${id}/adjust-stock`, body),
  categories: () => list<Category>('/products/categories'),
  createCategory: (body: unknown) => create<Category>('/products/categories', body),
};

export const saleService = {
  list: (params?: Record<string, unknown>) => list<Sale>('/sales', params),
  get: (id: string) => get<Sale>(`/sales/${id}`),
  create: (body: unknown) => create<Sale>('/sales', body),
};

export const purchaseService = {
  list: (params?: Record<string, unknown>) => list<Purchase>('/purchases', params),
  get: (id: string) => get<Purchase>(`/purchases/${id}`),
  create: (body: unknown) => create<Purchase>('/purchases', body),
  delete: (id: string) => remove(`/purchases/${id}`),
};

export const expenseService = {
  list: (params?: Record<string, unknown>) => list<Expense>('/expenses', params),
  create: (body: unknown) => create<Expense>('/expenses', body),
  categories: () => list<ExpenseCategory>('/expenses/categories'),
  createCategory: (body: unknown) => create<ExpenseCategory>('/expenses/categories', body),
  delete: (id: string) => remove(`/expenses/${id}`),
};

export const cashBankService = {
  listCashBook: (params?: Record<string, unknown>) => list<CashEntry>('/cash-book', params),
  createCashEntry: (body: unknown) => create<CashEntry>('/cash-book', body),
  listBankAccounts: () => list<BankAccount>('/bank-accounts'),
  createBankAccount: (body: unknown) => create<BankAccount>('/bank-accounts', body),
  deleteBankAccount: (id: string) =>remove(`/bank-accounts/${id}`),
  updateBankAccountStatus: (id: string, status: 'active' | 'inactive') => patch<BankAccount>(  `/bank-accounts/${id}/status`,  { status }),
  transfer: (body: unknown) => create<unknown>('/bank-accounts/transfer', body),
  bankLedger: (id: string, params?: Record<string, unknown>) => list<BankTransaction>(`/bank-accounts/${id}/ledger`, params),
};

export const dailyBookService = {
  list: (params?: Record<string, unknown>) => list<DailyEntry>('/daily-book', params),
};

export const dashboardService = {
  summary: () => get<DashboardSummary>('/dashboard/summary'),
  charts: () => get<DashboardCharts>('/dashboard/charts'),
};

export const reportService = {
  sales: (params?: Record<string, unknown>) => list<unknown>('/reports/sales', params),
  expenses: (params?: Record<string, unknown>) => list<unknown>('/reports/expenses', params),
  customerSummary: (params?: Record<string, unknown>) => list<unknown>('/reports/customer-summary', params),
  supplierSummary: (params?: Record<string, unknown>) => list<unknown>('/reports/supplier-summary', params),
  cashFlow: (params?: Record<string, unknown>) => list<unknown>('/reports/cash-flow', params),
  downloadPdf: async (endpoint: string, params?: Record<string, unknown>) => {
    const response = await axiosInstance.get(`/reports/${endpoint}`, {
      params: { ...params, format: 'pdf' },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

export const settingsService = {
  get: () => get<ShopSettings>('/settings'),
  update: (body: unknown) => update<ShopSettings>('/settings', body),
};
