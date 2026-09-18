import { Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { tokens } from "@bliro/ui/theme/tokens";
import { ReactNode } from "react";

import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/fonts";

interface IBliroTextFieldProps {
  mainProps: TextFieldProps;
  label?: string;
  icon?: ReactNode;
  isPlatform?: boolean;
}

export const BliroTextField = ({
  mainProps,
  label,
  icon,
  isPlatform = false,
}: IBliroTextFieldProps) => {
  return (
    <Stack direction="column" gap={tokens.spacing.xs}>
      {!isPlatform && (icon || label) && (
        <Stack direction="row" gap={tokens.spacing.sm}>
          {icon}
          {label && (
            <Typography
              variant="smallBody"
              fontWeight={fontWeight.semiBold}
              color={colors.dark[400]}
            >
              {label}
            </Typography>
          )}
        </Stack>
      )}
      <TextField
        {...mainProps}
        sx={{
          borderRadius: "4px",
          border: `1px solid ${colors.dark[600]}`,
          outline: "none",
          boxSizing: "border-box",
          "& .MuiInputBase-root::before": {
            display: "none",
          },
          "& .MuiInputBase-root::after": {
            display: "none",
          },
          "& .MuiInputBase-root": {
            paddingRight: "0 !important",
          },
          "& .MuiFormHelperText-root": {
            display: "none",
          },
          "& .MuiInputBase-root ": {
            "& .MuiInput-input": {
              padding: "10px 16px !important",
              color: colors.dark[200],
              fontSize: "14px",
              fontWeight: fontWeight.regular,
              lineHeight: "22px",
              letterSpacing: "-0.28px",
            },
          },
        }}
      />
      {mainProps?.error && (
        <Typography variant="xSmallBody" color={colors.orange[100]}>
          * {mainProps?.helperText}
        </Typography>
      )}
    </Stack>
  );
};
