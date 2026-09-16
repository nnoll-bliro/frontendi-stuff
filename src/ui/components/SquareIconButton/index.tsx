import { IconButton, IconButtonProps, SxProps, Theme } from "@mui/material";
import { ReactNode, Ref } from "react";

import { colors } from "../../theme/colors";

/**
 * Props for the SquareIconButton component. Extends MUI IconButton so callers can
 * pass through accessibility props (e.g. `aria-label`) and the handlers MUI Tooltip
 * injects when this button is used as a tooltip child.
 */
interface SquareIconButtonProps extends Omit<IconButtonProps, "size" | "onClick"> {
  /** The content to be displayed inside the button */
  children: ReactNode;
  /** The size of the button - 'small', 'medium', or 'large' @default 'medium' */
  size?: "small" | "medium" | "large";
  /** Whether the button is disabled @default false */
  disabled?: boolean;
  /** Whether to show a border around the button @default false */
  border?: boolean;
  /** Whether the button background should be transparent @default false */
  transparent?: boolean;
  /** Whether the button is active @default false */
  active?: boolean;
  /** Function to be called when the button is clicked */
  onClick: NonNullable<IconButtonProps["onClick"]>;
  /** Additional styles to be applied to the button */
  sx?: SxProps<Theme>;
  /** Forwarded to the underlying button element. */
  ref?: Ref<HTMLButtonElement>;
}

const PADDINGS_MAP = {
  small: "4px",
  medium: "6px",
  large: "10px",
};

export const SquareIconButton = ({
  children,
  transparent = false,
  border = false,
  size = "medium",
  disabled = false,
  active = false,
  onClick,
  sx,
  ref,
  ...rest
}: SquareIconButtonProps) => {
  const backgroundColor = transparent ? "transparent" : "#fff";
  const hoverBackgroundColor = colors["dark"][800];

  return (
    <IconButton
      ref={ref}
      sx={{
        minWidth: 0,
        height: size === "small" ? "32px" : "auto",
        width: size === "small" ? "32px" : "auto",
        padding: PADDINGS_MAP[size],
        borderRadius: "4px",
        border: border ? `1px solid ${colors["dark"][600]}` : "none",
        color: colors["dark"][200],
        backgroundColor: active ? hoverBackgroundColor : backgroundColor,
        "&:hover": {
          backgroundColor: hoverBackgroundColor,
        },
        ...sx,
      }}
      disabled={disabled}
      size={size}
      onClick={onClick}
      {...rest}
    >
      {children}
    </IconButton>
  );
};
