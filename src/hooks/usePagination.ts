import { useMemo, useState, useEffect } from 'react';

interface UseServerTableOptions {
  searchKeys?: string[];
  initialRowsPerPage?: number;
}

export function useServerPagination({ initialRowsPerPage = 10 }: UseServerTableOptions = {}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
  };
}

export function useClientPagination<T>(data: T[], initialRowsPerPage = 8) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [data]);

  const paged = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [data, page, rowsPerPage]
  );

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paged,
    totalPages,
  };
}
