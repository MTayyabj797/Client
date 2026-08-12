import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/api/axios';

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError?.response?.data?.message || fallback;
};

export const getValidationErrors = (error: unknown): Record<string, string> => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const details = axiosError?.response?.data?.details;
  if (Array.isArray(details)) {
    return details.reduce((acc, item) => {
      if (item && typeof item === 'object' && 'path' in item && 'message' in item) {
        acc[String((item as { path: unknown }).path)] = (item as { message: string }).message;
      }
      return acc;
    }, {} as Record<string, string>);
  }
  return {};
};
