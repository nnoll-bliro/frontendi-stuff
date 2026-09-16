import { SquareIconButton } from "@bliro/ui/components/SquareIconButton";
import { colors } from "@bliro/ui/theme/colors";
import { Tooltip } from "@mui/material";
import { Search, X } from "lucide-react";
import { Ref } from "react";

interface SearchToggleButtonProps {
  /** Whether the search input this button controls is currently open. */
  searchOpen: boolean;
  /** Typically `handleToggleSearch` from `useSearchToggle`. */
  onClick: () => void;
  /** Accessible name and tooltip text while search is closed. */
  openLabel: string;
  /** Accessible name and tooltip text while search is open. */
  closeLabel: string;
  /** Typically `toggleButtonRef` from `useSearchToggle`, so closing search can restore focus here. */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Icon button + tooltip that toggles a `useSearchToggle`-driven search input open/closed,
 * swapping between a search and a close icon. Shared by every section header that pairs
 * with `useSearchToggle` (Groups sidebar, Skills settings) so the button markup, its
 * accessible name, and the icon swap stay defined in one place.
 */
export const SearchToggleButton = ({
  searchOpen,
  onClick,
  openLabel,
  closeLabel,
  ref,
}: SearchToggleButtonProps) => {
  return (
    <Tooltip title={searchOpen ? closeLabel : openLabel}>
      <SquareIconButton
        ref={ref}
        transparent
        size="small"
        aria-label={searchOpen ? closeLabel : openLabel}
        onClick={onClick}
      >
        {searchOpen ? (
          <X size={20} color={colors.dark[400]} />
        ) : (
          <Search size={20} color={colors.dark[400]} />
        )}
      </SquareIconButton>
    </Tooltip>
  );
};
