import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, Typography } from "@mui/material";
import { TriangleAlert } from "lucide-react";
import { ReactNode } from "react";

interface WarningBannerProps {
  message: string;
  // An inline action rendered after the message (e.g. a text button) — omit for a
  // notice-only banner.
  action?: ReactNode;
  // "alert" interrupts; "status" waits for a pause. Use "status" for standing advisories.
  role?: "alert" | "status";
  fontWeight?: number;
}

// Shared org-policy notice: an inline warning next to the control it explains, not a
// dismissible alert — it disappears on its own once the underlying condition clears.
export const WarningBanner = ({
  message,
  action,
  role = "alert",
  fontWeight: fontWeightProp = fontWeight.medium,
}: WarningBannerProps) => (
  <Box
    role={role}
    sx={{
      bgcolor: colors.yellow[600],
      borderRadius: "8px",
      p: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <TriangleAlert
      size={20}
      color={colors.yellow[100]}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    />
    <Typography
      variant="smallBody"
      fontWeight={fontWeightProp}
      color={colors.dark[100]}
      sx={{ flex: 1 }}
    >
      {message}
    </Typography>
    {action}
  </Box>
);
