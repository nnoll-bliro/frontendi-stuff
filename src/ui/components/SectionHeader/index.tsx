import { Stack, Typography } from "@mui/material";
import { tokens } from "../../theme/tokens";
import { colors } from "../../theme/colors";

export interface SectionHeaderProps {
  id?: string;
  title: string;
  description?: string;
  count?: number;
  component?: "h2" | "h3" | "h4";
}

export const SectionHeader = ({ id, title, description, count, component = "h2" }: SectionHeaderProps) => (
  <Stack spacing={tokens.spacing.xs}>
    <Stack direction="row" alignItems="center" spacing={tokens.spacing.sm}>
      <Typography id={id} component={component} variant="sectionTitle">{title}</Typography>
      {count !== undefined && (
        <Typography variant="xxSmallBody" sx={{ px: 0.75, py: 0.125, borderRadius: tokens.radius.control, backgroundColor: colors.dark[800], fontVariantNumeric: "tabular-nums" }}>
          {count}
        </Typography>
      )}
    </Stack>
    {description && <Typography component="p" variant="smallBody">{description}</Typography>}
  </Stack>
);
