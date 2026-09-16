import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect } from "react";

import { colors } from "../../theme/colors";
import { BliroTableHeader, SortOptions } from "./BliroTableHeader";
import { BliroTableRow } from "./BliroTableRow";
import {
  BliroTableContext,
  BliroTablePaginationOptions,
  getTableSizingSx,
  TABLE_ROW_HEIGHT,
  TableColGroup,
  tableBoxSx,
} from "./BliroTableShared";

const PaginationPreviousIcon = () => <ChevronLeftIcon size={20} color={colors.dark[400]} />;
const PaginationNextIcon = () => <ChevronRightIcon size={20} color={colors.dark[400]} />;
const paginationActionButtonSx = { width: 40, height: 40, p: "4px" };

// Skeleton row count while loading — a rough screenful, not the full page size (25/50 would be noise).
const SKELETON_ROWS = 10;

export interface PaginatedBliroTableProps<RowData> extends BliroTableContext<RowData> {
  data: RowData[];
  sortOptions?: SortOptions<RowData>;
  pagination: BliroTablePaginationOptions;
  // While true, keep the header/footer and render a page of skeleton rows instead of the data, so
  // the table doesn't collapse on (re)fetch.
  loading?: boolean;
}

export const PaginatedBliroTable = <RowData extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  sortOptions,
  pagination,
  getRowId,
  loading,
}: PaginatedBliroTableProps<RowData>) => {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions,
    labelRowsPerPage,
    labelDisplayedRows,
    totalCount,
    fillHeight,
  } = pagination;

  // Server-side mode: `data` is already the page and `totalCount` is the full count. Client-side
  // mode (totalCount omitted): the table owns slicing, so the count is `data.length`.
  const isServerSide = totalCount !== undefined;
  const count = isServerSide ? totalCount : data.length;

  const maxPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  // Safety net for consumers that don't clamp themselves when the row count shrinks.
  useEffect(() => {
    if (page > maxPage) {
      onPageChange(maxPage);
    }
  }, [page, maxPage, onPageChange]);

  const pageStart = currentPage * rowsPerPage;
  const pageRows = isServerSide ? data : data.slice(pageStart, pageStart + rowsPerPage);

  const skeletonRows = Math.min(rowsPerPage, SKELETON_ROWS);

  return (
    <Box
      sx={[
        tableBoxSx,
        // Fill the parent (a flex column with a bounded height) and let the body scroll, so the table
        // grows to the available space and no further — adapts to viewport/zoom without any estimate.
        fillHeight ? { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 } : {},
      ]}
    >
      <TableContainer sx={fillHeight ? { flex: 1, minHeight: 0, overflowY: "auto" } : undefined}>
        <Table
          stickyHeader={fillHeight}
          sx={{
            ...getTableSizingSx(columns),
            ...(fillHeight
              ? {
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }
              : {}),
          }}
        >
          <TableColGroup columns={columns} />
          <TableHead>
            <BliroTableHeader<RowData> columns={columns} sortOptions={sortOptions} />
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`} sx={{ height: `${TABLE_ROW_HEIGHT}px` }}>
                    {columns.map((column) => (
                      <TableCell key={column.id} sx={{ p: 0, overflow: "hidden" }}>
                        <Skeleton variant="rounded" width="60%" height={16} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : pageRows.map((row, rowIndex) => (
                  <BliroTableRow<RowData>
                    key={getRowId ? getRowId(row) : pageStart + rowIndex}
                    row={row}
                    columns={columns}
                    onRowClick={onRowClick}
                  />
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={count}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions ?? [10, 25, 50]}
        onPageChange={(_event, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
        labelRowsPerPage={
          <Typography component="span" variant="xSmallBody">
            {labelRowsPerPage ?? "Rows per page:"}
          </Typography>
        }
        labelDisplayedRows={({ from, to, count }) => (
          <Typography component="span" variant="xSmallTitle">
            {labelDisplayedRows?.({ from, to, count }) ?? `${from}-${to} of ${count}`}
          </Typography>
        )}
        slots={{
          actions: {
            previousButtonIcon: PaginationPreviousIcon,
            nextButtonIcon: PaginationNextIcon,
          },
        }}
        slotProps={{
          actions: {
            previousButton: { sx: paginationActionButtonSx },
            nextButton: { sx: paginationActionButtonSx },
          },
          select: {
            IconComponent: ChevronDownIcon,
            renderValue: (value) => (
              <Typography component="span" variant="xSmallTitle">
                {String(value)}
              </Typography>
            ),
          },
        }}
        sx={{
          color: colors.dark[100],
          "& .MuiTablePagination-toolbar": {
            minHeight: "auto",
            pl: 0,
            pr: 0,
            py: "2px",
            gap: 3,
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            m: 0,
          },
          "& .MuiTablePagination-input": {
            m: 0,
          },
          "& .MuiTablePagination-select": {
            display: "flex",
            alignItems: "center",
            p: "0 !important",
          },
          "& .MuiSelect-icon": {
            position: "static",
            ml: "4px",
            color: colors.dark[400],
          },
          "& .MuiTablePagination-actions": {
            ml: 0,
          },
        }}
      />
    </Box>
  );
};
