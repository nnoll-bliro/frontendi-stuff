import { Box, BoxProps, Stack, Typography, TypographyProps } from "@mui/material";
import { tokens } from "@bliro/ui/theme/tokens";
import clsx from "classnames";
import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";

import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/fonts";

import styles from "./Input.module.css";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Text label displayed above the input field */
  label?: string;
  /** Placeholder text shown when the input is empty */
  placeholder?: string;
  /** Icon component to be displayed at the start (left) of the input field */
  startIcon?: ReactNode;
  /** Icon component to be displayed at the end (right) of the input field */
  endIcon?: ReactNode;
  /** Error message to be displayed below the input field when validation fails */
  errorMessage?: string;
  /** Size variant of the input field - affects height and typography */
  variant?: "small" | "medium" | "large" | "xlarge";
  /** Whether the input field is disabled and non-interactive */
  disabled?: boolean;
  /** Props to be passed to the Box component that wraps the input */
  wrapperProps?: BoxProps;
}

const typographyVariantMap: Record<
  NonNullable<IInputProps["variant"]>,
  TypographyProps["variant"]
> = {
  small: "xSmallBody",
  medium: "smallBody",
  large: "normalBody",
  xlarge: "normalBody",
};

const inputSizeMap: Record<NonNullable<IInputProps["variant"]>, keyof typeof styles> = {
  small: styles["small"],
  medium: styles["medium"],
  large: styles["large"],
  xlarge: styles["xLarge"],
};

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  (props: IInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      startIcon,
      endIcon,
      variant = "medium",
      errorMessage,
      label,
      wrapperProps,
      ...inputProps
    } = props;

    const generatedId = useId();
    const id = inputProps.id ?? generatedId;
    const errorId = `${id}-error`;
    const describedBy = [inputProps["aria-describedby"], errorMessage ? errorId : undefined].filter(Boolean).join(" ") || undefined;

    return (
      <Box {...wrapperProps}>
        {label && (
          <Typography
            component="label"
            htmlFor={id}
            variant={typographyVariantMap[variant]}
            color={colors.dark[200]}
            fontWeight={fontWeight["semiBold"]}
          >
            {label}
          </Typography>
        )}
        <Stack
          direction="row"
          alignItems="center"
          className={clsx(styles["container"], inputSizeMap[variant], {
            [styles["error"]]: Boolean(errorMessage),
          })}
          gap={tokens.spacing.sm}
        >
          {startIcon}
          <input type="text" {...inputProps} id={id} aria-invalid={errorMessage ? true : inputProps["aria-invalid"]} aria-describedby={describedBy} className={styles["input"]} ref={ref} />
          {endIcon}
        </Stack>
        {Boolean(errorMessage) && (
          <Typography
            id={errorId}
            variant="xSmallBody"
            color={colors.red[100]}
            fontWeight={fontWeight["medium"]}
          >
            {errorMessage}
          </Typography>
        )}
      </Box>
    );
  },
);

Input.displayName = "Input";
