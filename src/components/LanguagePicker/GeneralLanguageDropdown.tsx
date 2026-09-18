import {
  getLanguageByCode,
  OutputLanguageCode,
  TranscriptionLanguageCode,
} from "@bliro/common-types/languages";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import { fontWeight } from "@bliro/ui/theme/fonts";
import {
  Autocomplete,
  AutocompleteRenderGroupParams,
  Box,
  InputBase,
  Stack,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";

import { LanguageFlagIcon } from "../LanguageFlagIcon";
import { filterLanguageOptions } from "./utils";

const variantStyles = {
  xSmall: {
    padding: "5.5px",
    fontSize: "12px",
    flagWidth: 20,
    flagHeight: 20,
    inputHeight: "100%",
  },
  small: {
    padding: "6px 12px",
    fontSize: "12px",
    flagWidth: 16,
    flagHeight: 12,
    inputHeight: "32px",
  },
  medium: {
    padding: "8px 16px",
    fontSize: "14px",
    flagWidth: 20,
    flagHeight: 15,
    inputHeight: "100%",
  },
  large: {
    padding: "12px 16px",
    fontSize: "16px",
    flagWidth: 24,
    flagHeight: 18,
    inputHeight: "100%",
  },
  artifact: {
    padding: "10px 12px",
    fontSize: "12px",
    flagWidth: 24,
    flagHeight: 18,
    inputHeight: "100%",
  },
};

const typographyVariantMap = {
  xSmall: "xSmallBody",
  small: "xSmallBody",
  medium: "smallBody",
  large: "normalBody",
  artifact: "xSmallBody",
} as const;

export type LanguageCode = TranscriptionLanguageCode | OutputLanguageCode;

export type LanguageOption<L extends LanguageCode> = {
  code: L;
  localizedName: string;
  englishName: string;
  group: "pinned" | "other";
};

export type GeneralLanguageDropdownProps<L extends LanguageCode> = {
  value: L | null;
  placeholder: string;
  onChange: (code: L) => void;
  label?: string;
  variant?: "xSmall" | "small" | "medium" | "large" | "artifact";
  menuVariant?: "artifact";
  availableLanguageCodes: readonly L[];
  pinnedLanguageCodes?: L[];
  excludeLanguageCodes?: L[];
  compact?: boolean;
  inputSx?: SxProps<Theme>;
};

export function GeneralLanguageDropdown<L extends LanguageCode>({
  value,
  onChange,
  label,
  placeholder,
  variant = "medium",
  menuVariant,
  availableLanguageCodes,
  pinnedLanguageCodes = [],
  excludeLanguageCodes = [],
  compact = false,
  inputSx,
}: GeneralLanguageDropdownProps<L>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenUp, setIsOpenUp] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const isArtifactMenu = menuVariant === "artifact";
  const showTextInMenu = !compact || isArtifactMenu;
  const itemVariant = menuVariant ?? variant;
  const styles = variantStyles[variant];
  const menuStyles = variantStyles[itemVariant];
  const menuHeight = isArtifactMenu ? 160 : 300;

  const options = useMemo(() => {
    const pinnedSet = new Set(pinnedLanguageCodes);
    const excludeSet = new Set(excludeLanguageCodes);

    const pinned: LanguageOption<L>[] = [];
    const rest: LanguageOption<L>[] = [];

    availableLanguageCodes.forEach((code) => {
      if (excludeSet.has(code) || code === value) return;

      const language = getLanguageByCode(code);
      const option: LanguageOption<L> = {
        code,
        localizedName: language.localizedName,
        englishName: language.englishName,
        group: pinnedSet.has(code) ? "pinned" : "other",
      };

      if (pinnedSet.has(code)) {
        pinned.push(option);
      } else {
        rest.push(option);
      }
    });

    return [...pinned, ...rest];
  }, [availableLanguageCodes, pinnedLanguageCodes, excludeLanguageCodes, value]);

  const selectedOption = useMemo((): LanguageOption<L> | undefined => {
    if (!value) return undefined;
    const language = getLanguageByCode(value);
    return {
      code: value,
      localizedName: language.localizedName,
      englishName: language.englishName,
      group: "other" as const,
    };
  }, [value]);

  const handleChange = (_event: ChangeEvent<{}>, newValue: LanguageOption<L> | null) => {
    if (newValue) {
      onChange(newValue.code);
    }
  };

  const handleOpen = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuPadding = 16;
      const bottomMarginBuffer = 16;
      const totalMenuHeight = menuHeight + menuPadding + bottomMarginBuffer;
      setIsOpenUp(spaceBelow < totalMenuHeight);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const hasPinnedLanguages = pinnedLanguageCodes.length > 0;
  const showChevron = variant !== "xSmall" && variant !== "artifact";

  return (
    <Stack gap={tokens.spacing.xs} sx={{ height: "100%" }}>
      {label && (
        <Typography
          variant={typographyVariantMap[variant]}
          color={colors.dark[200]}
          fontWeight={fontWeight.semiBold}
          component="div"
        >
          {label}
        </Typography>
      )}
      <Autocomplete
        value={selectedOption}
        onChange={handleChange}
        options={options}
        getOptionLabel={(option) => option.localizedName}
        isOptionEqualToValue={(option, val) => option.code === val.code}
        groupBy={hasPinnedLanguages ? (option) => option.group : undefined}
        filterOptions={filterLanguageOptions}
        open={isOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        openOnFocus
        blurOnSelect
        disableClearable
        forcePopupIcon={false}
        renderGroup={(params: AutocompleteRenderGroupParams) => (
          <Box key={params.key}>
            {params.children}
            {params.group === "pinned" && (
              <Box
                sx={{
                  height: "1px",
                  backgroundColor: colors.dark[700],
                  my: tokens.space.xs,
                }}
              />
            )}
          </Box>
        )}
        renderOption={(props, option) => {
          const { key, ...restProps } = props;
          return (
            <Stack
              component="li"
              key={key}
              direction="row"
              alignItems="center"
              gap={tokens.spacing.sm}
              {...restProps}
              sx={{
                padding: `${menuStyles.padding} !important`,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: colors.dark[800],
                },
                "&.Mui-focused": {
                  backgroundColor: `${colors.dark[800]} !important`,
                },
              }}
            >
              <LanguageFlagIcon
                code={option.code}
                width={menuStyles.flagWidth}
                height={menuStyles.flagHeight}
              />
              {showTextInMenu && (
                <Typography
                  variant={typographyVariantMap[itemVariant]}
                  color={colors.dark[200]}
                  fontWeight={itemVariant === "medium" ? fontWeight.regular : fontWeight.semiBold}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.localizedName}
                </Typography>
              )}
            </Stack>
          );
        }}
        renderInput={(params) => (
          <Stack
            ref={(node) => {
              inputRef.current = node;
              if (params.InputProps.ref) {
                if (typeof params.InputProps.ref === "function") {
                  params.InputProps.ref(node);
                } else {
                  params.InputProps.ref.current = node;
                }
              }
            }}
            direction="row"
            alignItems="center"
            onClick={() => setIsOpen((prev) => !prev)}
            justifyContent={
              compact && showChevron ? "space-between" : compact ? "center" : "flex-start"
            }
            gap={compact ? 0 : 1}
            sx={{
              padding: styles.padding,
              border: `1px solid ${colors.dark[600]}`,
              borderRadius: "4px",
              backgroundColor: "white",
              height: styles.inputHeight,
              boxSizing: "border-box",
              cursor: "pointer",
              "&:hover": {
                borderColor: colors.dark[400],
              },
              "&:focus-within": {
                borderColor: colors.dark[400],
              },
              ...(isArtifactMenu && {
                borderRadius: isOpen ? "4px 4px 0 0" : "4px",
              }),
              ...(!isArtifactMenu &&
                isOpen && {
                  borderRadius: isOpenUp ? "0 0 4px 4px" : "4px 4px 0 0",
                }),
            }}
          >
            {value && (
              <Stack component="span" sx={{ "& img": { border: "none" } }}>
                <LanguageFlagIcon
                  code={value}
                  width={styles.flagWidth}
                  height={styles.flagHeight}
                />
              </Stack>
            )}
            <InputBase
              onClick={(e) => isOpen && e.stopPropagation()}
              inputProps={params.inputProps}
              placeholder={selectedOption ? selectedOption.localizedName : placeholder}
              sx={{
                flex: compact ? 0 : 1,
                width: compact ? 0 : "auto",
                minWidth: compact ? 0 : "auto",
                overflow: compact ? "hidden" : "visible",
                "& .MuiInputBase-input": {
                  padding: 0,
                  fontSize: styles.fontSize,
                  fontWeight: variant === "medium" ? fontWeight.regular : fontWeight.semiBold,
                  color: colors.dark[200],
                  cursor: isOpen ? "auto" : "pointer",
                  "&::placeholder": {
                    color: selectedOption ? colors.dark[200] : colors.dark[500],
                    opacity: 1,
                  },
                },
                ...(inputSx && {
                  ...inputSx,
                }),
              }}
            />
            {showChevron && (
              <ChevronDown
                width={20}
                height={20}
                stroke={colors.dark[400]}
                style={{
                  flexShrink: 0,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  pointerEvents: "none",
                }}
              />
            )}
          </Stack>
        )}
        ListboxProps={{
          sx: {
            maxHeight: menuHeight,
            padding: "8px 0",
            listStyle: "none",
            "& li": {
              listStyle: "none",
            },
          },
        }}
        componentsProps={{
          paper: {
            sx: {
              border: `1px solid ${colors.dark[400]}`,
              borderRadius: isArtifactMenu
                ? "4px 0 4px 4px"
                : isOpenUp
                  ? "4px 4px 0 0"
                  : "0 0 4px 4px",

              marginTop: 0,
              borderTop: isOpenUp ? `1px solid ${colors.dark[400]}` : "none",
              borderBottom: isOpenUp ? "none" : `1px solid ${colors.dark[400]}`,
              ...(isArtifactMenu && {
                transform: "translateX(calc(-100% + 32px)) !important",
                width: 240,
                minWidth: 240,
              }),
            },
          },
        }}
      />
    </Stack>
  );
}
