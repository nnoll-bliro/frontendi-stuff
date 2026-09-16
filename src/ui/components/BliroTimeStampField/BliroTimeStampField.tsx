import "dayjs/locale/de";
import "dayjs/locale/en";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { InputAdornment, Stack, SxProps, Theme, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CalendarIcon } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

interface BliroTimeStampFieldProps {
  label: string | undefined;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any;
  required: boolean | undefined;
  format?: string;
  isPlatform?: boolean;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  handleChange: (newValue: any) => void;
  readOnly?: boolean;
  sx?: SxProps<Theme>;
  locale?: string;
  timezone?: string;
  tzLabel?: string;
}

export const BliroTimeStampField = ({
  label,
  value,
  required,
  format,
  isPlatform = false,
  handleChange,
  readOnly,
  sx,
  locale = "en",
  timezone: tz,
  tzLabel,
}: BliroTimeStampFieldProps) => {
  return (
    <Stack direction="column" gap={0.5}>
      {!isPlatform && (
        <Stack direction="row" gap={1}>
          <CalendarIcon size={20} color={colors.dark[400]} />
          <Typography
            variant="smallBody"
            fontWeight={fontWeight["semiBold"]}
            color={colors.dark[400]}
          >
            {label}
          </Typography>
        </Stack>
      )}

      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        dateLibInstance={dayjs}
        adapterLocale={locale}
      >
        <DateTimeField
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
              fontWeight: fontWeight["regular"],
              lineHeight: "22px",
              letterSpacing: "-0.28px",
            },
            ...sx,
          }}
          value={value ? dayjs(value) : null}
          onChange={handleChange}
          variant="standard"
          fullWidth
          required={required}
          readOnly={readOnly}
          format={format}
          timezone={tz}
          slotProps={
            tzLabel
              ? {
                  textField: {
                    InputProps: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            variant="xSmallBody"
                            color={colors.dark[400]}
                            sx={{ whiteSpace: "nowrap", pr: 1 }}
                          >
                            {tzLabel}
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  },
                }
              : undefined
          }
        />
      </LocalizationProvider>
    </Stack>
  );
};
