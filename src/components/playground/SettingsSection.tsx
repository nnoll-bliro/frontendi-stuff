import { Box, Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import type { ReactNode } from "react";

import { Card } from "./Card";

interface SettingsSectionProps {
  title: string;
  description?: string;
  /** Right-aligned slot in the section header — a switch, a status, a button. */
  action?: ReactNode;
  children?: ReactNode;
  /** Red border and heading, for the destructive section at the bottom. */
  destructive?: boolean;
}

export const SettingsSection = ({
  title,
  description,
  action,
  children,
  destructive,
}: SettingsSectionProps) => (
  <Card sx={{ p: { xs: 2.5, sm: 3 }, ...(destructive && { borderColor: colors.red[400] }) }}>
    <Stack spacing={children ? 2.5 : 0}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, maxWidth: 680 }}>
          <Typography
            component="h2"
            variant="normalTitle"
            sx={{
              color: destructive ? colors.red.dark : colors.dark[100],
              fontWeight: fontWeight.semiBold,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
              {description}
            </Typography>
          )}
        </Stack>
        {action && (
          <Box sx={{ flexShrink: 0, alignSelf: { xs: "flex-start", sm: "auto" } }}>{action}</Box>
        )}
      </Stack>
      {children}
    </Stack>
  </Card>
);

interface SettingsFieldProps {
  label: string;
  children: ReactNode;
  /** Optional helper text under the control. */
  hint?: string;
}

/** Label above a control, matching the spacing the design system's Input uses. */
export const SettingsField = ({ label, children, hint }: SettingsFieldProps) => (
  <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
    <Typography
      variant="smallBody"
      component="div"
      sx={{ color: colors.dark[200], fontWeight: fontWeight.semiBold }}
    >
      {label}
    </Typography>
    {children}
    {hint && (
      <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
        {hint}
      </Typography>
    )}
  </Stack>
);
