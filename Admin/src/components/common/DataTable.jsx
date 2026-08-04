import { useMemo, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, TextField, InputAdornment, Paper,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Loader from './Loader';
import { colors } from '../../theme/colors';

/**
 * Fully client-side table: search, column sort, and pagination all live here
 * so every list page (Employees/Departments/Roles) gets the same behavior for free.
 *
 * columns: [{ key, label, sortable?, render?(row) }]
 * rows: full data array (not pre-paginated)
 * searchKeys: which row fields the search box filters on
 */
const DataTable = ({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  loading = false,
  emptyLabel = 'No records found.',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  toolbarAction,
}) => {
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(columns[0]?.key);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(term))
    );
  }, [rows, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!orderBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[orderBy] ?? '';
      const bv = b[orderBy] ?? '';
      if (av < bv) return order === 'asc' ? -1 : 1;
      if (av > bv) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, orderBy, order]);

  const paged = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (key) => {
    if (orderBy === key) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(key);
      setOrder('asc');
    }
  };

  return (
    <Paper sx={{ borderRadius: 2, border: `1px solid ${colors.line}` }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: { xs: '100%', sm: 260 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {toolbarAction}
      </Box>

      {loading ? (
        <Loader label="Loading data..." minHeight="30vh" />
      ) : (
        <>
          <TableContainer sx={{ overflowX: 'auto', width: '100%', display: 'block' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{ py: 1.5, borderBottom: `2px solid ${colors.line}`, bgcolor: colors.navySoft, ...col.sx }}
                    >
                      {col.sortable !== false ? (
                        <TableSortLabel
                          active={orderBy === col.key}
                          direction={orderBy === col.key ? order : 'asc'}
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 5, color: 'text.secondary', border: 0 }}>
                      {emptyLabel}
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row, i) => (
                    <TableRow
                      key={row.id ?? i}
                      hover
                      sx={{ '&:last-of-type td': { borderBottom: 0 } }}
                    >
                      {columns.map((col) => (
                        <TableCell key={col.key} sx={{ py: 1.5, borderBottom: `1px solid ${colors.line}`, ...col.sx }}>
                          {col.render ? col.render(row) : row[col.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={sorted.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        </>
      )}
    </Paper>
  );
};

export default DataTable;
