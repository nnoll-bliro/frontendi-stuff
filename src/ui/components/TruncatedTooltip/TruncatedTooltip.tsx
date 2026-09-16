import { Tooltip, TooltipProps, Typography, TypographyProps } from "@mui/material";
import { ReactNode, useRef, useState } from "react";
export interface TruncatedTooltipProps {
  /** The text content to display */
  text: string;
  /** Props to pass to the underlying Typography component */
  typographyProps?: Omit<TypographyProps, "children" | "ref">;
  /** Props to pass to the underlying Tooltip component */
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  /** Custom content to render instead of text. If provided, text is only used for tooltip */
  children?: ReactNode;
}

/**
 * A Typography component wrapped in a Tooltip that only appears when the text is truncated.
 * Uses text-overflow: ellipsis and checks if the content overflows before showing the tooltip.
 */
export const TruncatedTooltip = ({
  text,
  typographyProps,
  tooltipProps,
  children,
}: TruncatedTooltipProps) => {
  const textRef = useRef<HTMLElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    const element = textRef.current;
    if (element) {
      setShowTooltip(element.scrollWidth > element.clientWidth);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <Tooltip
      title={text}
      {...tooltipProps}
      open={showTooltip}
      onClose={handleMouseLeave}
      disableHoverListener
    >
      <Typography
        ref={textRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...typographyProps}
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...typographyProps?.sx,
        }}
      >
        {children ?? text}
      </Typography>
    </Tooltip>
  );
};
