import { Box, type SxProps, type Theme } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Renders as a hoverable surface — for cards that are themselves links. */
  interactive?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * The one surface the mock pages are built out of. Kept local to the playground
 * rather than added to `src/ui` — bliro-ui is a snapshot of the real library and
 * shouldn't grow components the real library doesn't have.
 */
export const Card = ({ children, interactive, sx }: CardProps) => (
  <Box
    sx={{
      border: `1px solid ${colors.dark[700]}`,
      borderRadius: "12px",
      backgroundColor: "#FFFFFF",
      transition: "border-color 0.15s, box-shadow 0.15s",
      ...(interactive && {
        cursor: "pointer",
        "&:hover": {
          borderColor: colors.dark[600],
          boxShadow: "0 2px 8px rgba(19, 26, 38, 0.06)",
        },
      }),
      ...sx,
    }}
  >
    {children}
  </Box>
);
