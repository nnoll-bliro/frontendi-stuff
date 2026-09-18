import { createTheme } from "@mui/material/styles";

import { colors } from "./colors";
import { focusRing, tokens } from "./tokens";

export const fontVariants = {
  pageTitle: "pageTitle",
  sectionTitle: "sectionTitle",
  eyebrow: "eyebrow",
  h0: "h0",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  subtitle0: "subtitle0",
  subtitle1: "subtitle1",
  subtitle2: "subtitle2",
  subtitle3: "subtitle3",
  subtitle4: "subtitle4",
  xxSmallTitle: "xxSmallTitle",
  xSmallTitle: "xSmallTitle",
  smallTitle: "smallTitle",
  normalTitle: "normalTitle",
  largeTitle: "largeTitle",
  xxSmallBody: "xxSmallBody",
  xSmallBody: "xSmallBody",
  smallBody: "smallBody",
  normalBody: "normalBody",
  largeBody: "largeBody",
};

export const fontSizes = {
  xxSmallBody: "11px",
  xSmallBody: "13px",
  smallBody: "14px",
  normalBody: "16px",
  largeBody: "18px",
};

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    pageTitle: true;
    sectionTitle: true;
    eyebrow: true;
    h0: true;
    subtitle0: true;
    subtitle3: true;
    subtitle4: true;
    xxSmallTitle: true;
    xSmallTitle: true;
    smallTitle: true;
    normalTitle: true;
    largeTitle: true;
    xxSmallBody: true;
    xSmallBody: true;
    smallBody: true;
    normalBody: true;
    largeBody: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    icon: true;
  }
}

export const theme = createTheme({
  shape: { borderRadius: 6 },
  palette: {
    background: { default: tokens.color.canvas, paper: tokens.color.surface },
    text: { primary: tokens.color.text, secondary: tokens.color.muted },
    divider: tokens.color.border,
    primary: {
      main: colors.orange[100],
      dark: colors.orange.dark,
    },
    secondary: {
      main: "#fff",
      dark: colors.dark[800],
      contrastText: colors.dark[200],
    },
    error: {
      main: colors.red[100],
      dark: colors.red.dark,
      contrastText: "#fff",
    },
    success: {
      main: colors.green[100],
      dark: colors.green.dark,
      contrastText: "#fff",
    },
    warning: {
      main: colors.yellow[100],
      dark: colors.yellow.dark,
      contrastText: "#fff",
    },
    info: {
      main: colors.blue[100],
      dark: colors.blue.dark,
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: "Inter",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": focusRing,
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          fontFamily: "Inter",
          color: colors.dark[100],
          ...(ownerState.variant === "pageTitle" && {
            fontSize: "28px", fontWeight: 600, lineHeight: "36px", letterSpacing: "-0.7px",
          }),
          ...(ownerState.variant === "sectionTitle" && {
            fontSize: "16px", fontWeight: 600, lineHeight: "24px", letterSpacing: "-0.2px",
          }),
          ...(ownerState.variant === "eyebrow" && {
            fontSize: "11px", fontWeight: 600, lineHeight: "16px", letterSpacing: "0.8px",
            textTransform: "uppercase", color: colors.dark[400],
          }),
          ...(ownerState.variant === "h0" && {
            fontSize: "56px",
            fontWeight: 700,
            lineHeight: "72px",
            letterSpacing: "-1.12px",
          }),
          ...(ownerState.variant === "h1" && {
            fontSize: "48px",
            fontWeight: 700,
            lineHeight: "64px",
            letterSpacing: "-0.96px",
          }),
          ...(ownerState.variant === "h2" && {
            fontSize: "40px",
            fontWeight: 600,
            lineHeight: "56px",
            letterSpacing: "-0.8px",
          }),
          ...(ownerState.variant === "h3" && {
            fontSize: "36px",
            fontWeight: 600,
            lineHeight: "48px",
            letterSpacing: "-0.72px",
          }),
          ...(ownerState.variant === "h4" && {
            fontSize: "32px",
            fontWeight: 600,
            lineHeight: "40px",
            letterSpacing: "-0.64px",
          }),
          ...(ownerState.variant === "subtitle0" && {
            fontSize: "24px",
            fontWeight: 600,
            lineHeight: "36px",
            letterSpacing: "-0.48px",
            color: colors.dark[500],
            textTransform: "uppercase",
          }),
          ...(ownerState.variant === "subtitle1" && {
            fontSize: "24px",
            fontWeight: 600,
            lineHeight: "36px",
            letterSpacing: "-0.48px",
          }),
          ...(ownerState.variant === "subtitle2" && {
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "30px",
            letterSpacing: "-0.4px",
          }),
          ...(ownerState.variant === "subtitle3" && {
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: "24px",
            letterSpacing: "-0.16px",
          }),
          ...(ownerState.variant === "subtitle4" && {
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: "18px",
            letterSpacing: "-0.13px",
          }),
          ...(ownerState.variant === "xxSmallTitle" && {
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "16px",
            letterSpacing: "-0.11px",
          }),
          ...(ownerState.variant === "xSmallTitle" && {
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "18px",
            letterSpacing: "-0.13px",
          }),
          ...(ownerState.variant === "smallTitle" && {
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "22px",
            letterSpacing: "-0.28px",
          }),
          ...(ownerState.variant === "normalTitle" && {
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "-0.32px",
          }),
          ...(ownerState.variant === "largeTitle" && {
            fontSize: "18px",
            fontWeight: 400,
            lineHeight: "26px",
            letterSpacing: "-0.36px",
          }),
          ...(ownerState.variant === "xxSmallBody" && {
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "16px",
            letterSpacing: "-0.11px",
            color: colors.dark[400],
          }),
          ...(ownerState.variant === "xSmallBody" && {
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "18px",
            letterSpacing: "-0.13px",
            color: colors.dark[400],
          }),
          ...(ownerState.variant === "smallBody" && {
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "22px",
            letterSpacing: "-0.28px",
            color: colors.dark[400],
          }),
          ...(ownerState.variant === "normalBody" && {
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "-0.32px",
            color: colors.dark[400],
          }),
          ...(ownerState.variant === "largeBody" && {
            fontSize: "18px",
            fontWeight: 400,
            lineHeight: "26px",
            letterSpacing: "-0.36px",
            color: colors.dark[400],
          }),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          WebkitAppRegion: "no-drag",
          display: "flex",
          alignItems: "center",
          boxShadow: "none",
          borderRadius: tokens.radius.control,
          textTransform: "none",
          fontSize: "13px",
          fontWeight: 500,
          "&:focus-visible": focusRing,
          "&:hover": {
            boxShadow: "none",
          },
          "& > .MuiButton-icon": {
            marginLeft: 0,
            "& > svg": {
              width: "20px",
              height: "20px",
            },
          },
          "& .MuiButton-startIcon": {
            marginLeft: "0 !important",
          },
          ...(ownerState.size === "small" && {
            height: "32px",
            padding: "0 12px",
          }),
          ...(ownerState.size === "medium" && {
            height: "40px",
            padding: "0 16px",
          }),
          ...(ownerState.size === "large" && {
            height: "48px",
            padding: "0 16px",
          }),
          ...(ownerState.variant === "outlined" &&
            ownerState.color === "primary" && {
              color: colors.orange[100],
              borderColor: colors.orange[400],
              backgroundColor: colors.orange[600],
              "&:hover": {
                borderColor: colors.orange[200],
                backgroundColor: colors.orange[500],
              },
            }),
          ...(ownerState.variant === "outlined" &&
            ownerState.color === "secondary" && {
              color: colors.dark[200],
              borderColor: colors.dark[600],
              backgroundColor: "#fff",
              "&:hover": {
                borderColor: colors.dark[400],
                backgroundColor: colors.dark[800],
              },
            }),
          ...(ownerState.variant === "text" &&
            ownerState.color === "secondary" && {
              color: colors.dark[200],
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: colors.dark[800],
              },
            }),
          ...(ownerState.variant === "icon" &&
            ownerState.color === "secondary" && {
              minWidth: 0,
              padding: 6,
              color: colors.dark[200],
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: colors.dark[800],
              },
              "& > .MuiButton-icon": {
                margin: 0,
                "& > svg": {
                  width: "20px",
                  height: "20px",
                },
              },
            }),
          "&:disabled": {
            color: colors.dark[500],
            borderColor: colors.dark[700],
            backgroundColor: colors.dark[700],
            "&:hover": {
              borderColor: colors.dark[700],
              backgroundColor: colors.dark[700],
            },
          },
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === "success" && {
            backgroundColor: colors.green[600],
            color: colors.green.dark,
          }),
          ...(ownerState.severity === "info" && {
            backgroundColor: colors.dark[800],
            color: colors.dark[200],
          }),
          ...(ownerState.severity === "warning" && {
            backgroundColor: colors.yellow[600],
            color: colors.yellow.dark,
          }),
          ...(ownerState.severity === "error" && {
            backgroundColor: colors.orange[600],
            color: colors.red[100],
          }),
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: () => ({
          borderColor: tokens.color.border,
        }),
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: () => ({
          padding: 0,
          "&:not(.Mui-checked) .MuiSvgIcon-root": {
            color: colors.dark[600],
          },
        }),
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: () => ({
          padding: 0,
          "&:not(.Mui-checked) .MuiSvgIcon-root": {
            color: colors.dark[600],
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: () => ({
          height: "auto",
          padding: "4px 8px",
          borderRadius: "4px",
          backgroundColor: "#F2F2F2",
          border: "1px solid #E0E0E0",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          "& .MuiChip-label": {
            padding: 0,
          },
          "& .MuiChip-deleteIcon": {
            margin: 0,
          },
          "& .MuiChip-icon": {
            marginRight: 4,
          },
        }),
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        asterisk: {
          color: "#db3131",
          "&$error": {
            color: "#db3131",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          WebkitAppRegion: "no-drag",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          WebkitAppRegion: "no-drag",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          "& .MuiPaper-root": {
            borderRadius: 4,
            border: `1px solid ${colors.dark[700]}`,
            padding: "16px 8px",
            boxSizing: "border-box",
            "& .MuiMenu-list": {
              margin: 0,
              padding: 0,
              "& > .MuiList-root": {
                margin: 0,
                padding: 0,
                gap: "4px",
              },
            },
            "& .MuiMenuItem-root": {
              marginTop: 0,
              marginBottom: 0,
              "& .MuiSvgIcon-root": {
                marginRight: 1,
              },
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          WebkitAppRegion: "no-drag",
          padding: "8px 8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          WebkitAppRegion: "no-drag",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            padding: 0,
            transition: "all 0.2s",
          },
          "& .MuiSelect-select": {
            padding: "8px 16px",
            height: "32px !important",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiSelect-icon": {
            top: "calc(50% - 0.7em)",
            right: "16px",
          },
          "& fieldset": {
            border: `1px solid ${colors.dark[600]}`,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: `1px solid ${colors.dark[600]} !important`,
          },

          "&:hover": {
            backgroundColor: `#F6F6F6`,
          },
        },
      },
    },
  },
});
