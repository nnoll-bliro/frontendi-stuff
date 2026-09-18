type IColorType = Record<string | number, string>;

type IColorsType = Record<string, IColorType>;

export const colors = {
  orange: {
    "100": "#F26835",
    "200": "#F9855B",
    "300": "#FAA484",
    "400": "#FCC2AD",
    "500": "#FDE1D6",
    "600": "#FEF0EA",
    "700": "#FFF9F7",
    dark: "#A44725",
  },
  dark: {
    "100": "#131A26",
    "200": "#2B313C",
    "300": "#424852",
    // Muted text: meets AA on white, canvas (900), and subtle surfaces (800).
    "400": "#626870",
    "500": "#A1A3A8",
    "600": "#D0D1D4",
    "700": "#E7E8E9",
    "800": "#EFF0F0",
    "900": "#F7F7F7",
  },
  red: {
    "100": "#F43641",
    "200": "#F65B64",
    "300": "#F9848A",
    "400": "#FBADB1",
    "500": "#FDD6D8",
    "600": "#FEEAEC",
    dark: "#A5252E",
  },
  green: {
    "100": "#00BC8F",
    "200": "#33CAA6",
    "300": "#66D7BC",
    "400": "#80DEC7",
    "500": "#CCF2E9",
    "600": "#E5F8F4",
    dark: "#008164",
  },
  blue: {
    "100": "#1A60E7",
    "200": "#4880EC",
    "300": "#76A0F1",
    "400": "#A3BFF5",
    "500": "#D1DFFA",
    "600": "#E8EFFD",
    dark: "#1242A2",
  },
  yellow: {
    "100": "#F49F21",
    "200": "#F6B24D",
    "300": "#F8C57A",
    "400": "#F9CF90",
    "500": "#FDECD3",
    "600": "#FEF5E9",
    dark: "#A56D17",
  },
} satisfies IColorsType;
