import { Box, Table, TableBody, TableContainer, TableHead } from "@mui/material";
import { useState } from "react";
import { TableComponents, TableVirtuoso } from "react-virtuoso";

import { BliroTableHeader, SortOptions } from "./BliroTableHeader";
import { BliroTableRow } from "./BliroTableRow";
import {
  BliroTableContext,
  getTableSizingSx,
  TABLE_HEADER_HEIGHT,
  TableColGroup,
  tableBoxSx,
} from "./BliroTableShared";

const virtuosoTableComponents: TableComponents<Record<string, unknown>, BliroTableContext> = {
  Scroller: TableContainer,
  Table: ({ context, ...props }) => (
    <Table {...props} sx={getTableSizingSx(context.columns)}>
      <TableColGroup columns={context.columns} />
      {props.children}
    </Table>
  ),
  TableHead,
  TableRow: ({ item, context, ...props }) => (
    <BliroTableRow
      row={item}
      columns={context?.columns ?? []}
      onRowClick={context?.onRowClick}
      {...props}
    />
  ),
  TableBody,
};

export interface VirtualizedBliroTableProps<RowData> extends BliroTableContext<RowData> {
  data: RowData[];
  sortOptions?: SortOptions<RowData>;
}

export const VirtualizedBliroTable = <RowData extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  sortOptions,
  getRowId,
}: VirtualizedBliroTableProps<RowData>) => {
  const [contentHeight, setContentHeight] = useState<number>(0);

  const tableHeight = contentHeight + TABLE_HEADER_HEIGHT;

  const context: BliroTableContext<RowData> = {
    columns,
    onRowClick,
  };

  // Only forward computeItemKey when we actually have a getRowId. Passing
  // `computeItemKey={undefined}` is not the same as omitting it: Virtuoso treats
  // the prop as present and overwrites its own default key function with
  // undefined, which then blows up with "o is not a function" during render.
  const computeItemKey = getRowId
    ? { computeItemKey: (_index: number, item: RowData) => getRowId(item) }
    : {};

  return (
    <Box sx={{ ...tableBoxSx, height: tableHeight }}>
      <TableVirtuoso
        data={data}
        totalListHeightChanged={setContentHeight}
        components={virtuosoTableComponents as TableComponents<RowData, BliroTableContext<RowData>>}
        context={context}
        {...computeItemKey}
        fixedHeaderContent={() => (
          <BliroTableHeader<RowData> columns={columns} sortOptions={sortOptions} />
        )}
      />
    </Box>
  );
};
