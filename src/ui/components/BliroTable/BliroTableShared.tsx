import { ReactNode } from "react";

export interface ColumnData<RowData = Record<string, unknown>> {
  id: Extract<keyof RowData, string>;
  label: string;
  minWidthPx: number;
  renderCell?: (item: RowData) => ReactNode;
}

export interface BliroTableContext<RowData = Record<string, unknown>> {
  columns: ColumnData<RowData>[];
  onRowClick?: (item: RowData) => void;
  // Stable React key for a row, shared by the paginated and virtualized
  // renderers. Falls back to a position-based key when omitted.
  getRowId?: (row: RowData) => string | number;
}

export interface BliroTablePaginationLabelInfo {
  from: number;
  to: number;
  count: number;
}

export interface BliroTablePaginationOptions {
  page: number;
  // Must be one of `rowsPerPageOptions` (defaults to [10, 25, 50]) — otherwise MUI's
  // TablePagination renders an empty select and logs an out-of-range warning.
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  // Server-side pagination: when set, `data` is already the current page (not the full set),
  // so the table renders it as-is and uses this for the total count. Omit for client-side
  // pagination, where the table slices the full `data` itself.
  totalCount?: number;
  // BliroTable has no i18n of its own — pass already-translated text, same as ColumnData.label.
  labelRowsPerPage?: ReactNode;
  labelDisplayedRows?: (info: BliroTablePaginationLabelInfo) => ReactNode;
  // Fill the parent's available height (which must be a bounded flex column) and scroll the body
  // instead of growing the page. The footer stays pinned at the bottom and it adapts to viewport and
  // zoom via flexbox — no pixel estimate. Requires the ancestors down to the table to be flex.
  fillHeight?: boolean;
}

export const TABLE_HEADER_HEIGHT = 35;
export const TABLE_ROW_HEIGHT = 48;

export const tableBoxSx = {
  width: "100%",
  "& .MuiPaper-root": {
    backgroundColor: "#fff",
    boxShadow: "none",
  },
  "& *": {
    boxSizing: "border-box",
  },
  "& .MuiTableBody-root tr": {
    "& td": {
      pr: 4,
    },
    "& td:last-of-type": {
      pr: 0,
    },
  },
  "& .MuiTableContainer-root": {
    "::-webkit-scrollbar": {
      height: "6px",
    },
  },
};

export const getTableSizingSx = <RowData,>(columns: ColumnData<RowData>[]) => {
  const totalMinimumWidth = columns.reduce((sum, column) => sum + column.minWidthPx, 0);
  return {
    tableLayout: totalMinimumWidth > 0 ? ("fixed" as const) : ("auto" as const),
    width: "100%",
    minWidth: totalMinimumWidth > 0 ? `${totalMinimumWidth}px` : undefined,
  };
};

export const TableColGroup = <RowData,>({ columns }: { columns: ColumnData<RowData>[] }) => {
  if (columns.length === 0) {
    return null;
  }
  return (
    <colgroup>
      {columns.map((column, columnIndex) => {
        const width = `${column.minWidthPx}px`;
        return <col key={`column-width-${columnIndex}`} style={{ width, minWidth: width }} />;
      })}
    </colgroup>
  );
};
