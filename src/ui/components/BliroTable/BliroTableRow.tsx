import { colors } from "@bliro/ui/theme/colors";
import { TableCell, TableRow, Typography } from "@mui/material";

import { BliroTableContext, TABLE_ROW_HEIGHT } from "./BliroTableShared";

export interface BliroTableRowProps<
  RowData extends Record<string, unknown> = Record<string, unknown>,
> extends BliroTableContext<RowData> {
  row: RowData;
}

export const BliroTableRow = <RowData extends Record<string, unknown>>({
  row,
  columns,
  onRowClick,
  ...props
}: BliroTableRowProps<RowData>) => {
  return (
    <TableRow
      {...props}
      hover={!!onRowClick}
      onClick={() => onRowClick?.(row)}
      sx={{
        cursor: onRowClick ? "pointer" : "default",
        height: `${TABLE_ROW_HEIGHT}px`,
      }}
    >
      {columns.map((column) => (
        <TableCell
          key={column.id}
          sx={{
            minWidth: `${column.minWidthPx}px`,
            p: 0,
            overflow: "hidden",
          }}
        >
          {column.renderCell ? (
            column.renderCell(row)
          ) : (
            <Typography variant="smallBody" color={colors.dark["200"]}>
              {String(row[column.id] ?? "")}
            </Typography>
          )}
        </TableCell>
      ))}
    </TableRow>
  );
};
