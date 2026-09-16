import { colors } from "@bliro/ui/theme/colors";
import { Box, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";
import { ReactNode } from "react";

interface BannerCardProps {
  children: ReactNode;
  sx?: SystemStyleObject<Theme>;
}

export const BannerCard = ({ children, sx }: BannerCardProps) => (
  <Box
    sx={{
      border: `1px solid ${colors.orange[100]}`,
      backgroundColor: colors.orange[600],
      borderRadius: "4px",
      padding: "16px 24px",
      position: "relative",
      ...sx,
    }}
  >
    {children}
  </Box>
);
