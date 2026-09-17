import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned slot: filters, buttons, counts. */
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <Stack
    direction="row"
    alignItems="flex-start"
    justifyContent="space-between"
    spacing={2}
    sx={{ mb: 3 }}
  >
    <Stack spacing={0.5}>
      <Typography component="h1" variant="h3">
        {title}
      </Typography>
      {description && (
        <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
          {description}
        </Typography>
      )}
    </Stack>
    {action}
  </Stack>
);
