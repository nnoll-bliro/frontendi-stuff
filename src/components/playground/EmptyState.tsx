import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ Icon, title, description, action }: EmptyStateProps) => (
  <Stack
    alignItems="center"
    spacing={tokens.spacing.sm}
    sx={{
      py: tokens.space.xl,
      px: tokens.space.lg,
      textAlign: "center",
      border: `1px solid ${colors.dark[700]}`,
      backgroundColor: colors.dark[900],
      borderRadius: "8px",
    }}
  >
    <Icon size={22} color={colors.dark[400]} aria-hidden="true" />
    <Typography variant="normalTitle" sx={{ color: colors.dark[200] }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="smallBody" sx={{ color: colors.dark[400], maxWidth: 420 }}>
        {description}
      </Typography>
    )}
    {action}
  </Stack>
);
