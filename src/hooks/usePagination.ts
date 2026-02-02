import { useState, useCallback, useMemo } from 'react';

/**
 * Pagination state interface
 */
export interface PaginationState {
  page: number; // Current page (0-indexed)
  rowsPerPage: number;
  totalRows: number;
}

/**
 * Pagination hook return type
 */
export interface UsePaginationReturn {
  page: number;
  rowsPerPage: number;
  totalRows: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  handleChangePage: (newPage: number) => void;
  handleChangeRowsPerPage: (newRowsPerPage: number) => void;
  setTotalRows: (total: number) => void;
  resetPagination: () => void;
}

/**
 * Pagination hook
 * Manages pagination state for tables
 *
 * @param initialRowsPerPage - Initial rows per page (default: 25)
 * @returns Pagination state and handlers
 */
export const usePagination = (
  initialRowsPerPage: number = 25
): UsePaginationReturn => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [totalRows, setTotalRows] = useState(0);

  // Computed values
  const totalPages = useMemo(() => {
    return Math.ceil(totalRows / rowsPerPage);
  }, [totalRows, rowsPerPage]);

  const hasNextPage = useMemo(() => {
    return page < totalPages - 1;
  }, [page, totalPages]);

  const hasPrevPage = useMemo(() => {
    return page > 0;
  }, [page]);

  const startIndex = useMemo(() => {
    return page * rowsPerPage;
  }, [page, rowsPerPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + rowsPerPage, totalRows);
  }, [startIndex, rowsPerPage, totalRows]);

  // Handlers
  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  const resetPagination = useCallback(() => {
    setPage(0);
    setRowsPerPage(initialRowsPerPage);
    setTotalRows(0);
  }, [initialRowsPerPage]);

  return {
    page,
    rowsPerPage,
    totalRows,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    handleChangePage,
    handleChangeRowsPerPage,
    setTotalRows,
    resetPagination,
  };
};

/**
 * Usage example:
 *
 * function UserTable() {
 *   const pagination = usePagination(25);
 *   const [users, setUsers] = useState([]);
 *
 *   useEffect(() => {
 *     const fetchUsers = async () => {
 *       const response = await fetchUsersAPI({
 *         page: pagination.page,
 *         limit: pagination.rowsPerPage,
 *       });
 *
 *       setUsers(response.data);
 *       pagination.setTotalRows(response.total);
 *     };
 *
 *     fetchUsers();
 *   }, [pagination.page, pagination.rowsPerPage]);
 *
 *   return (
 *     <>
 *       <Table>
 *         {users.map((user) => (
 *           <TableRow key={user.id}>...</TableRow>
 *         ))}
 *       </Table>
 *
 *       <TablePagination
 *         page={pagination.page}
 *         rowsPerPage={pagination.rowsPerPage}
 *         count={pagination.totalRows}
 *         onPageChange={(_, newPage) => pagination.handleChangePage(newPage)}
 *         onRowsPerPageChange={(e) =>
 *           pagination.handleChangeRowsPerPage(Number(e.target.value))
 *         }
 *       />
 *     </>
 *   );
 * }
 */
