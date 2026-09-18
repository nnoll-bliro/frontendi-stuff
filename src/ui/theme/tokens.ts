import { colors } from "./colors";

/** Semantic product tokens. Keep the brand palette separate from its application. */
export const tokens = {
  color: {
    canvas: colors.dark[900],
    surface: "#FFFFFF",
    border: colors.dark[700],
    text: colors.dark[100],
    muted: colors.dark[400],
    accent: colors.orange.dark,
    selected: colors.orange[600],
    focus: colors.blue[100],
  },
  radius: { control: "6px", surface: "8px" },
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", section: "40px" },
  layout: { sidebar: 232, content: 1200, reading: 760 },
} as const;

export const focusRing = {
  outline: `2px solid ${tokens.color.focus}`,
  outlineOffset: "3px",
};
