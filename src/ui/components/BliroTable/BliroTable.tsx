import { SortOptions } from "./BliroTableHeader";
import { BliroTableContext, BliroTablePaginationOptions, ColumnData } from "./BliroTableShared";
import { PaginatedBliroTable } from "./PaginatedBliroTable";
import { VirtualizedBliroTable } from "./VirtualizedBliroTable";

export type { ColumnData };

export interface BliroTableProps<RowData> extends BliroTableContext<RowData> {
  data: RowData[];
  sortOptions?: SortOptions<RowData>;
  // When set, renders a plain paginated table instead of the virtualized one —
  // Virtuoso sizes itself to the full list, which fights a fixed-height paged footer.
  pagination?: BliroTablePaginationOptions;
  // Paginated tables only: render skeleton rows in place of data while (re)fetching.
  loading?: boolean;
}

export const BliroTable = <RowData extends Record<string, unknown>>({
  pagination,
  loading,
  ...props
}: BliroTableProps<RowData>) => {
  if (pagination) {
    return <PaginatedBliroTable<RowData> {...props} pagination={pagination} loading={loading} />;
  }

  return <VirtualizedBliroTable<RowData> {...props} />;
};
