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
  /**
   * One spacing scale in two forms, because MUI needs both.
   *
   * `space` is px, for `sx` values, CSS and anything taking a length.
   * `spacing` is the same steps as multipliers of MUI's 8px base, for the
   * `spacing` and `gap` props — those reject a "16px" string, which is why
   * the scale went unused at 200 call sites before this existed.
   *
   *   <Stack spacing={tokens.spacing.md}>   // 16px
   *   <Box sx={{ padding: tokens.space.md }} />
   *
   * Keep the two in step: `space.X` must always equal `spacing.X * 8` px.
   *
   * NESTING RULE — along a given axis, a child's gap is at most half its
   * parent's. Below 2:1 the children stop reading as separate things and the
   * group collapses into one blob. A row of icon+label controls at `xs` spaced
   * by `sm` is exactly that failure. Either open the parent up to `lg`, or give
   * each child a bounded box of its own, the way `TabItem` does.
   */
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", section: "40px" },
  spacing: { xs: 0.5, sm: 1, md: 2, lg: 3, xl: 4, section: 5 },
  layout: { sidebar: 232, content: 1200, reading: 760 },
} as const;

export const focusRing = {
  outline: `2px solid ${tokens.color.focus}`,
  outlineOffset: "3px",
};
