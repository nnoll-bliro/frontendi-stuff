import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, TableCell, TableRow, TableSortLabel, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";

import { ColumnData, TABLE_HEADER_HEIGHT } from "./BliroTableShared";

export interface SortOptions<RowData> {
  by: Extract<keyof RowData, string>;
  direction: "asc" | "desc";
  onSort: (property: Extract<keyof RowData, string>) => void;
  isSortable?: (property: Extract<keyof RowData, string>) => boolean;
}

export interface BliroTableHeaderProps<RowData> {
  columns: ColumnData<RowData>[];
  sortOptions?: SortOptions<RowData>;
}

export const BliroTableHeader = <RowData extends Record<string, unknown>>({
  columns,
  sortOptions,
}: BliroTableHeaderProps<RowData>) => {
  const { by, direction, onSort, isSortable } = sortOptions || {};
  return (
    <TableRow
      sx={{
        height: `${TABLE_HEADER_HEIGHT}px`,
        verticalAlign: "top",
        backgroundColor: "#fff",
      }}
    >
      {columns.map((column) => {
        const isSorted = by === column.id;
        const isColumnSortable = isSortable ? isSortable(column.id) : true;
        return (
          <TableCell
            key={column.id}
            variant="head"
            sx={{ minWidth: `${column.minWidthPx}px`, p: 0, backgroundColor: "#fff" }}
            sortDirection={isSorted ? direction : false}
          >
            {onSort && isColumnSortable ? (
              <TableSortLabel
                active={isSorted}
                direction={isSorted ? direction : "asc"}
                onClick={() => onSort(column.id)}
              >
                <Typography
                  variant="xSmallBody"
                  fontWeight={fontWeight["semiBold"]}
                  color={isSorted ? colors.dark["300"] : colors.dark["500"]}
                  sx={{
                    textDecoration: isSorted ? "underline" : "none",
                  }}
                >
                  {column.label}
                </Typography>
                {isSorted ? (
                  <Box component="span" sx={visuallyHidden}>
                    {direction === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              <Typography
                variant="xSmallBody"
                fontWeight={fontWeight["semiBold"]}
                color={colors.dark["500"]}
              >
                {column.label}
              </Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};
