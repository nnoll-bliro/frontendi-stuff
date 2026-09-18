import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { tokens } from "@bliro/ui/theme/tokens";
import clsx from "classnames";
import { useMemo } from "react";

import { fontWeight } from "../../theme/fonts";

import styles from "./Avatar.module.css";

/**
 * Props for the Avatar component.
 */
export interface IAvatarProps {
  /**
   * The main text to display inside the avatar.
   */
  title: string;
  /**
   * The tooltip content to show on hover.
   * Can be a comma-separated string for multi-line tooltips.
   */
  tooltip: string;
  /**
   * The visual style of the avatar.
   * @default 'primary'
   */
  variant?: "primary" | "secondary";
  /**
   * The size of the avatar.
   * @default 'medium'
   */
  size?: "small" | "medium";
  /**
   * If true, applies overlapped styling to the avatar.
   * @default false
   */
  overlapped?: boolean;
  /**
   * If true, shows the tooltip as plain text.
   * If false, splits the tooltip by commas for multi-line display.
   * @default true
   */
  isTextTooltip?: boolean;
}

export const Avatar = ({
  title,
  tooltip,
  overlapped = false,
  isTextTooltip = true,
  size = "medium",
  variant = "primary",
}: IAvatarProps) => {
  const tooltipElement = useMemo(() => {
    if (isTextTooltip)
      return (
        <Typography variant="xxSmallBody" fontWeight={fontWeight.medium} color="white">
          {tooltip}
        </Typography>
      );
    const titles = tooltip.split(",");
    return (
      <Stack direction="column" gap={tokens.spacing.xs}>
        {titles.map((title, idx) => {
          return (
            <Typography
              key={idx}
              component="div"
              variant="xxSmallBody"
              fontWeight={fontWeight.medium}
              color="white"
            >
              {title}
            </Typography>
          );
        })}
      </Stack>
    );
  }, [tooltip, isTextTooltip]);

  return (
    <Tooltip title={tooltipElement} className={styles.title}>
      <Box
        className={clsx(styles.container, {
          [styles.overlapped]: overlapped,
          [styles.overlappedSmall]: size === "small",
        })}
      >
        <Box
          className={clsx(styles.wrapper, {
            [styles.smallWrapper]: size === "small",
            [styles.secondary]: variant === "secondary",
          })}
        >
          <Typography
            className={clsx(styles.avatarTitle, {
              [styles.smallAvatarTitle]: size === "small",
            })}
            variant={"smallBody"}
            fontWeight={fontWeight.semiBold}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
};
