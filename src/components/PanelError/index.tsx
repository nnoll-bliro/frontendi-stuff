import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, Stack, Typography } from "@mui/material";
import { CircleAlertIcon } from "lucide-react";

import styles from "./PanelError.module.css";

interface IPanelErrorProps {
  title: string;
  description?: string;
}

export const PanelError = ({ title, description }: IPanelErrorProps) => {
  return (
    <Box className={styles.failed}>
      <Stack direction="column" gap={tokens.spacing.xs}>
        <Stack direction="row" gap={tokens.spacing.sm} alignItems="center">
          <CircleAlertIcon size={20} color={colors.red[100]} />
          <Typography variant="smallBody" fontWeight={fontWeight.semiBold} color={colors.red[100]}>
            {title}
          </Typography>
        </Stack>
        {description && (
          <Typography variant="caption" color={colors.red[100]} sx={{ mt: tokens.space.xs }}>
            {description}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
