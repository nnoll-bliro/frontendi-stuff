import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, Stack, Typography } from "@mui/material";
import { Emoji } from "emoji-picker-react";
import { ReactElement, ReactNode } from "react";

export interface TemplateCardBaseProps {
  /** Template title */
  title: string;
  /** Template description */
  description: string;
  /** Emoji unified code (e.g., "270f-fe0f") */
  emoji?: string;
  /** Custom icon element (overrides emoji if provided) */
  icon?: ReactElement;
  /** Whether the card is highlighted (selected/active state) */
  isHighlighted?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Actions to render on the right side of the card */
  actions?: ReactNode;
  /** Custom class name for the container */
  className?: string;
}

export const TemplateCardBase = ({
  title,
  description,
  emoji,
  icon,
  isHighlighted = false,
  onClick,
  actions,
  className,
}: TemplateCardBaseProps) => {
  const showIcon = icon || emoji;
  return (
    <Box
      onClick={onClick}
      className={className}
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "white",
        border: `1px solid ${isHighlighted ? colors.orange[100] : colors.dark[700]}`,
        borderRadius: "8px",
        boxShadow: "0px 1px 1px 0px rgba(19, 26, 38, 0.08)",
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        transition: "border-color 0.15s ease-in-out",
        "&:hover": onClick
          ? {
              borderColor: colors.orange[100],
              "& .template-card-title": {
                color: colors.orange[100],
              },
              "& .template-card-icon": {
                color: colors.orange[100],
              },
            }
          : {},
      }}
    >
      <Stack direction="row" alignItems="start" flex={1} minWidth={0} gap={1}>
        {showIcon && (
          <Box
            className="template-card-icon"
            sx={{
              flexShrink: 0,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isHighlighted ? colors.orange[100] : colors.dark[400],
              transition: "color 0.15s ease-in-out",
            }}
          >
            {icon || (emoji && <Emoji unified={emoji} size={20} />)}
          </Box>
        )}
        <Stack direction="column" gap={0.5} minWidth={0} flex={1}>
          <Typography
            className="template-card-title"
            sx={{
              fontSize: "16px",
              fontWeight: fontWeight.semiBold,
              color: isHighlighted ? colors.orange[100] : colors.dark[200],
              lineHeight: "24px",
              letterSpacing: "-0.32px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "color 0.15s ease-in-out",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: fontWeight.regular,
              color: colors.dark[400],
              lineHeight: "22px",
              letterSpacing: "-0.28px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {description}
          </Typography>
        </Stack>
        {actions && (
          <Stack direction="row" alignItems="center" gap={2} sx={{ flexShrink: 0 }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
