import {
  BaseTextFieldProps,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { parsePhoneNumberFromString, validatePhoneNumberLength } from "libphonenumber-js";
import { Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CountryIso2,
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

import "react-international-phone/style.css";
import { colors } from "../../theme/colors";

export const isPhoneValid = (phone: string) => {
  try {
    const parsed = parsePhoneNumberFromString(phone);
    if (
      !parsed ||
      !parsed.isValid() ||
      !parsed.isPossible() ||
      validatePhoneNumberLength(phone) !== undefined
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export interface BliroPhoneInputProps extends BaseTextFieldProps {
  value: string;
  onChange: (phone: string) => void;
  locale?: string;
}

const parseLocale = (locale?: string) => {
  if (!locale) return { language: undefined, region: undefined };
  const parts = locale.toLowerCase().split(/[-_]/);
  return {
    language: parts[0],
    region: parts.length > 1 ? parts[parts.length - 1] : parts[0],
  };
};

export const BliroPhoneInput = ({
  value,
  onChange,
  locale,
  error,
  ...restProps
}: BliroPhoneInputProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { language } = parseLocale(locale);

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } = usePhoneInput({
    defaultCountry: "de",
    value,
    countries: defaultCountries,
    onChange: (data) => {
      onChange(data.phone);
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const isValidCountry = useMemo(() => {
    const cleanValue = inputValue.replace(/\D/g, "");
    return !!cleanValue && cleanValue.startsWith(country.dialCode);
  }, [inputValue, country.dialCode]);

  const regionNames = useMemo(() => {
    const isGerman = !language || language === "de";
    return new Intl.DisplayNames([isGerman ? "de-DE" : "en"], {
      type: "region",
    });
  }, [language]);

  return (
    <TextField
      fullWidth
      value={inputValue}
      onChange={handlePhoneValueChange}
      type="tel"
      inputRef={inputRef}
      error={error || !isValidCountry}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" style={{ marginRight: "2px", marginLeft: "-8px" }}>
            <Select
              onOpen={() => setIsMenuOpen(true)}
              onClose={() => setIsMenuOpen(false)}
              displayEmpty
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderTopLeftRadius: "0 !important",
                      borderTopRightRadius: "0 !important",
                      borderBottomLeftRadius: "4px !important",
                      borderBottomRightRadius: "4px !important",
                      border: `1px solid ${colors.dark[400]} !important`,
                      borderTop: "none !important",
                      backgroundColor: "#fff",
                      boxSizing: "border-box",
                      boxShadow: "none",
                    },
                  },
                },
                style: {
                  height: "300px",
                  width: "360px",
                  top: "6px",
                  left: "-34px",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
              sx={{
                width: "max-content",
                fieldset: {
                  display: "none",
                },
                ".MuiSelect-select": {
                  py: "0",
                  pr: "24px !important",
                  pl: "8px !important",
                  outline: "none !important",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "24px",
                },
                "& .MuiSelect-icon": {
                  top: "calc(50% - 12px)",
                  right: 0,
                },
              }}
              value={isValidCountry ? country.iso2 : ""}
              onChange={(e) => setCountry(e.target.value as CountryIso2)}
              renderValue={(value) =>
                value ? (
                  <FlagImage iso2={value as CountryIso2} style={{ display: "flex" }} />
                ) : (
                  <Globe size={18} color={colors.dark[400]} style={{ display: "flex" }} />
                )
              }
            >
              {defaultCountries.map((c) => {
                const country = parseCountry(c);
                const countryName = regionNames.of(country.iso2.toUpperCase()) || country.name;
                return (
                  <MenuItem key={country.iso2} value={country.iso2}>
                    <FlagImage iso2={country.iso2} style={{ marginRight: "8px" }} />
                    <Typography marginRight="8px">{countryName}</Typography>
                    <Typography color="gray">+{country.dialCode}</Typography>
                  </MenuItem>
                );
              })}
            </Select>
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: "#fff",
        "& .MuiOutlinedInput-root": {
          borderRadius: isMenuOpen ? "4px 4px 4px 0px" : "4px",
          "& fieldset": {
            border: `1px solid ${isMenuOpen ? colors.dark[400] : colors.dark[600]}`,
            borderRadius: 2,
          },
          "&.Mui-focused fieldset": {
            borderColor: `${colors.dark[400]} !important`,
            borderWidth: "1px !important",
          },
          "&:hover fieldset": {
            borderColor: `${colors.dark[400]} !important`,
          },
          "&.Mui-error": {
            "& fieldset": {
              borderColor: `${colors.red[100]} !important`,
            },
            "&.Mui-focused fieldset": {
              borderColor: `${colors.red[100]} !important`,
            },
            "&:hover fieldset": {
              borderColor: `${colors.red[100]} !important`,
            },
          },
        },
        "& .MuiInputBase-input": {
          py: 0,
          height: "48px",
        },
      }}
      {...restProps}
    />
  );
};
