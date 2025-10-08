import { useCallback, useState } from 'react';

const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [orderBy, setOrderBy] = useState();
  const [orderDirection, setOrderDirection] = useState();

  const updatePage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const updateLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    // Reset to first page when changing limit
    setPage(1);
  }, []);

  const updateOrderBy = useCallback((field) => {
    setOrderBy(field);
  }, []);

  const updateOrderDirection = useCallback((direction) => {
    if (direction === 'ascend') {
      setOrderDirection('ASC');
    } else if (direction === 'descend') {
      setOrderDirection('DESC');
    } else {
      setOrderDirection(undefined);
    }
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    orderBy,
    orderDirection,
    setPage: updatePage,
    setLimit: updateLimit,
    setOrderBy: updateOrderBy,
    setOrderDirection: updateOrderDirection,
    resetPagination,
  };
};

export default usePagination;
