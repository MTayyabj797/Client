import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { dashboardService, settingsService, type DashboardSummary, type DashboardCharts, type ShopSettings } from '@/api/services';
import { getErrorMessage } from '@/utils/error';

export const useDashboardSummary = () =>
  useQuery({ queryKey: ['dashboard', 'summary'], queryFn: () => dashboardService.summary() });

export const useDashboardCharts = () =>
  useQuery({ queryKey: ['dashboard', 'charts'], queryFn: () => dashboardService.charts() });

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => settingsService.get() });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => settingsService.update(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings updated successfully'); },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to update settings')),
  });
};

export type { DashboardSummary, DashboardCharts, ShopSettings };
