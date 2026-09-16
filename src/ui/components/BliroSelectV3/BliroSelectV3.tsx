import { FormControl, MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { KeyboardEvent, ReactNode, useRef, useState } from "react";

import { colors } from "../../theme/colors";
import { TruncatedTooltip } from "../TruncatedTooltip/TruncatedTooltip";

export interface BliroSelectV3Option<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface BliroSelectV3Props<T extends string = string> {
  value?: T;
  options: BliroSelectV3Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  size?: "small" | "medium";
}

const MENU_HEIGHT = 280;
const MENU_PADDING = 16;
const BOTTOM_MARGIN_BUFFER = 16;

export const BliroSelectV3 = <T extends string = string>({
  value,
  options,
  onChange,
  placeholder,
  fullWidth = true,
  disabled = false,
  size = "small",
}: BliroSelectV3Props<T>) => {
  const [open, setOpen] = useState(false);
  const [opensUp, setOpensUp] = useState(false);
  const [menuWidth, setMenuWidth] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: SelectChangeEvent<string>) => {
    // MUI's Select is string-based; the rendered value always comes from an option, so it's a T.
    const newValue = event.target.value as T;
    if (newValue !== "") {
      onChange(newValue);
    }
  };

  const handleOpen = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = MENU_HEIGHT + MENU_PADDING + BOTTOM_MARGIN_BUFFER;
      setOpensUp(spaceBelow < menuHeight);
      setMenuWidth(rect.width);
    }
    const currentIndex = options.findIndex((option) => option.value === value);
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!open) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "Enter":
        event.preventDefault();
        event.stopPropagation();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const selectedOption = options[highlightedIndex];
          onChange(selectedOption.value);
          handleClose();
        }
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        handleClose();
        break;
    }
  };

  const currentOption = options.find((option) => option.value === value);

  const getBorderRadius = () => {
    if (!open) return "4px";
    return opensUp ? "0 0 4px 4px" : "4px 4px 0 0";
  };

  const getMenuBorderRadius = () => {
    return opensUp ? "4px 4px 0 0" : "0 0 4px 4px";
  };

  return (
    <FormControl fullWidth={fullWidth} size={size} ref={selectRef}>
      <Select
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        IconComponent={() => null}
        displayEmpty
        sx={{
          backgroundColor: "white",
          borderRadius: getBorderRadius(),
          "&.Mui-disabled": {
            backgroundColor: colors.dark[800],
            cursor: "not-allowed",
            pointerEvents: "auto",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.dark[600],
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.dark[600],
            },
          },
          "&:hover": {
            backgroundColor: "transparent",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: `${colors.dark[400]} !important`,
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: open ? `${colors.dark[400]} !important` : undefined,
            ...(open && {
              [opensUp ? "borderTopColor" : "borderBottomColor"]: "transparent !important",
            }),
          },
          "& .MuiSelect-select": {
            paddingTop: "9px !important",
            paddingBottom: "9px !important",
            paddingLeft: "16px !important",
            paddingRight: "16px !important",
            boxSizing: "border-box",
            height: size === "small" ? "32px" : "auto !important",
          },
        }}
        MenuProps={{
          anchorOrigin: {
            vertical: opensUp ? "top" : "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: opensUp ? "bottom" : "top",
            horizontal: "left",
          },
          onKeyDownCapture: handleKeyDown,
          sx: {
            "& .MuiPaper-root": {
              marginTop: 0,
              p: 0,
              boxShadow: "none",
              borderRadius: getMenuBorderRadius(),
              border: `1px solid ${colors.dark[400]}`,
              maxHeight: `${MENU_HEIGHT}px`,
              ...(menuWidth && { width: `${menuWidth}px` }),
            },
            "& .MuiList-root": {
              padding: "8px 0 !important",
            },
            "& .MuiMenuItem-root": {
              padding: "9px 16px",
              minHeight: "40px",
              height: "auto",
            },
          },
        }}
        renderValue={() => (
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
            flex={1}
            minWidth={0}
          >
            {currentOption?.icon && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ flexShrink: 0 }}
              >
                {currentOption.icon}
              </Stack>
            )}
            <TruncatedTooltip
              text={currentOption?.label ?? placeholder ?? ""}
              typographyProps={{
                color: currentOption ? colors.dark[200] : colors.dark[500],
                variant: "body2",
                sx: {
                  letterSpacing: "-0.02em",
                  lineHeight: "22px",
                  flex: 1,
                },
              }}
            />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ flexShrink: 0 }}
            >
              {open ? (
                <ChevronUpIcon size={20} strokeWidth={2} color={colors.dark[400]} />
              ) : (
                <ChevronDownIcon size={20} strokeWidth={2} color={colors.dark[400]} />
              )}
            </Stack>
          </Stack>
        )}
      >
        {options.map((option, index) => {
          const selected = currentOption?.value === option.value;
          const highlighted = highlightedIndex === index;
          return (
            <MenuItem
              key={`${option.value}-${index}`}
              value={option.value}
              selected={selected}
              onMouseEnter={() => setHighlightedIndex(index)}
              sx={{
                width: "100%",
                marginBottom: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "transparent",
                },
                "&:hover, &.Mui-selected:hover": {
                  backgroundColor: colors.dark[800],
                },
                "&.Mui-focusVisible, &.Mui-selected.Mui-focusVisible": {
                  backgroundColor: "transparent",
                },
                ...(highlighted && {
                  backgroundColor: `${colors.dark[800]} !important`,
                }),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
                width="100%"
                minWidth={0}
              >
                {option.icon && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ flexShrink: 0 }}
                  >
                    {option.icon}
                  </Stack>
                )}
                <Stack direction="column" flex={1} minWidth={0}>
                  <TruncatedTooltip
                    text={option.label}
                    typographyProps={{
                      variant: "xSmallBody",
                      color: colors.dark[200],
                      textTransform: "capitalize",
                    }}
                  />
                  {option.description && (
                    <TruncatedTooltip
                      text={option.description}
                      typographyProps={{ variant: "xSmallBody", color: colors.dark[400] }}
                    />
                  )}
                </Stack>
                {selected && (
                  <CheckIcon size={16} color={colors.dark[200]} style={{ flexShrink: 0 }} />
                )}
              </Stack>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
