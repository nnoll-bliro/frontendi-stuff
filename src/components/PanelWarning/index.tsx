import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, Stack, Typography } from "@mui/material";
import { AlertTriangleIcon } from "lucide-react";

import styles from "./PanelWarning.module.css";

interface IPanelWarningProps {
  title: string;
  description?: string;
}

export const PanelWarning = ({ title, description }: IPanelWarningProps) => {
  return (
    <Box className={styles.warning}>
      <Stack direction="column" gap={0.5}>
        <Stack direction="row" gap={1} alignItems="center">
          <AlertTriangleIcon size={20} color={colors.yellow[100]} />
          <Typography
            variant="smallBody"
            fontWeight={fontWeight.semiBold}
            color={colors.yellow[100]}
          >
            {title}
          </Typography>
        </Stack>
        {description && (
          <Typography variant="caption" color={colors.yellow[100]}>
            {description}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
