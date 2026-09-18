import { Box, type BoxProps } from "@mui/material";
import { tokens } from "../../theme/tokens";

export interface SurfaceProps extends BoxProps {
  /** Visual affordance only. Callers must supply a semantic link or button. */
  interactive?: boolean;
}

/** Quiet, bordered surface. No elevation unless the content is floating. */
export const Surface = ({ interactive = false, sx, ...props }: SurfaceProps) => (
  <Box
    data-surface=""
    {...props}
    sx={[
      {
        minWidth: 0,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius.surface,
        backgroundColor: tokens.color.surface,
        transition: "background-color 150ms, border-color 150ms",
        ...(interactive && {
          "&:hover, &:focus-within": {
            borderColor: "var(--bliro-dark-6)",
            backgroundColor: tokens.color.canvas,
          },
        }),
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);

/** Group related record surfaces with dividers instead of repeated card outlines. */
export const SurfaceList = ({ sx, ...props }: BoxProps) => (
  <Surface
    {...props}
    sx={[
      {
        "& > [data-surface]": {
          border: 0,
          borderRadius: 0,
          backgroundColor: "transparent",
          "& + [data-surface]": { borderTop: `1px solid ${tokens.color.border}` },
          "&:first-of-type": { borderTopLeftRadius: "inherit", borderTopRightRadius: "inherit" },
          "&:last-of-type": { borderBottomLeftRadius: "inherit", borderBottomRightRadius: "inherit" },
          "&:hover": { backgroundColor: tokens.color.canvas },
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
