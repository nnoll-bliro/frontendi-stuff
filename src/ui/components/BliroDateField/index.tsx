import "dayjs/locale/de";
import { Stack, SxProps, Theme, Typography } from "@mui/material";
import { DateField } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";

import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/fonts";

/**
 * Props for the BliroDateField component.
 * @interface IBliroDateFieldProps
 */
interface IBliroDateFieldProps {
  /** Label text for the date field */
  label?: string;
  /** Date value (can be a Date object, string, or dayjs object) */
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is used in platform mode (hides label and icon) */
  isPlatform?: boolean;
  /** Callback function when date value changes */
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  handleChange: (newValue: any) => void;
  /** Whether the field is read only */
  readOnly?: boolean;
  sx?: SxProps<Theme>;
}

export const BliroDateField = ({
  label,
  value,
  required,
  handleChange,
  isPlatform = false,
  readOnly,
  sx,
}: IBliroDateFieldProps) => {
  return (
    <Stack direction="column" gap={0.5}>
      {!isPlatform && (
        <Stack direction="row" gap={1}>
          <CalendarIcon size={20} color={colors.dark[400]} />
          <Typography variant="smallBody" fontWeight={fontWeight.semiBold} color={colors.dark[400]}>
            {label}
          </Typography>
        </Stack>
      )}

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
        <DateField
          sx={{
            boxSizing: "border-box",
            borderRadius: "4px",
            border: `1px solid ${colors.dark[600]}`,
            "& .MuiInputBase-root::before": {
              display: "none",
            },
            "& .MuiInputBase-root::after": {
              display: "none",
            },
            "& .MuiInput-root .MuiInput-input": {
              padding: "10px 16px",
              color: colors.dark[200],
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "22px",
              letterSpacing: "-0.28px",
            },
            ...sx,
          }}
          value={dayjs(value) || null}
          onChange={handleChange}
          variant="standard"
          fullWidth
          required={required}
          readOnly={readOnly}
        />
      </LocalizationProvider>
    </Stack>
  );
};
