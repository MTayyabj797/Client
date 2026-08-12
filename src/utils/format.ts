export const formatCurrency = (amount: number, currency = 'PKR'): string => {
  const formatted = new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  return `${currency} ${formatted}`;
};

export const formatNumber = (amount: number): string =>
  new Intl.NumberFormat('en-PK').format(amount);

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
