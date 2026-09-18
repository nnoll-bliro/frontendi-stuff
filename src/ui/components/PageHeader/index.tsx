import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { tokens } from "../../theme/tokens";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}

/** Product heading: one title, a short purpose, and an optional primary action. */
export const PageHeader = ({ title, description, action, eyebrow }: PageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    alignItems={{ xs: "stretch", sm: "flex-start" }}
    justifyContent="space-between"
    spacing={3}
    sx={{ mb: tokens.space.xl }}
  >
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      {eyebrow && <Typography variant="eyebrow">{eyebrow}</Typography>}
      <Typography component="h1" variant="pageTitle" sx={{ overflowWrap: "anywhere" }}>
        {title}
      </Typography>
      {description && (
        <Typography component="p" variant="smallBody" sx={{ maxWidth: 640 }}>
          {description}
        </Typography>
      )}
    </Stack>
    {action && <Box sx={{ flexShrink: 0, pt: { sm: 0.5 } }}>{action}</Box>}
  </Stack>
);
