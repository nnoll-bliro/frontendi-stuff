import { Box, Typography } from "@mui/material";
import { fontWeight } from "@bliro/ui/theme/fonts";

interface StatusPillProps {
  label: string;
  color: string;
  background: string;
  /** Pulsing dot — used for a meeting that is recording right now. */
  live?: boolean;
}

export const StatusPill = ({ label, color, background, live }: StatusPillProps) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      px: "8px",
      py: "3px",
      borderRadius: "6px",
      backgroundColor: background,
      flexShrink: 0,
    }}
  >
    {live && (
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
          animation: "bliro-pulse 1.4s ease-in-out infinite",
          "@keyframes bliro-pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.25 },
          },
        }}
      />
    )}
    <Typography variant="xxSmallBody" sx={{ color, fontWeight: fontWeight.semiBold }}>
      {label}
    </Typography>
  </Box>
);
