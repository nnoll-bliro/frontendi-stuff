import { Box, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { createElement, ElementType, MouseEvent, ReactNode, Ref, useId, useRef } from "react";

import { colors } from "../theme/colors";
import { fontWeight } from "../theme/fonts";
import { focusRing, tokens } from "../theme/tokens";
import { TruncatedTooltip } from "./TruncatedTooltip/TruncatedTooltip";

interface NavMenuItemSharedProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  isRemove?: boolean;
  /** Visually de-emphasised (gray text) but still interactive — for items not yet connected/active. */
  inactive?: boolean;
  /**
   * The caller can reach this item but doesn't currently have access to it (e.g. a
   * license-gated route) — fully clickable, unlike `disabled`. Dims icon/text like
   * `disabled` when not `active`; when `active`, keeps the usual active (orange) treatment
   * instead, since an active-but-locked item (its own locked page currently open) should
   * still read as "here", not "unavailable". Also makes `endIcon` always visible instead
   * of the default hover-reveal, since a lock indicator that only appears on hover
   * defeats its purpose.
   */
  locked?: boolean;
  /**
   * Announced as an accessible *description* (via `aria-describedby`), not folded into
   * the accessible name — `endIcon` renders as a sibling of the link inside the
   * surrounding menuitem, so giving the icon its own `aria-label` would concatenate into
   * the enclosing menuitem's computed name instead of describing the element a screen
   * reader user actually focuses. Attaches to the link when this item has one (the actual
   * focus target there), or to the enclosing menuitem itself when it doesn't (an
   * onClick-only item, where the menuitem is the only focusable element).
   */
  lockedDescription?: string;
  ref?: Ref<HTMLDivElement>;
}

interface NavMenuItemFullBase extends NavMenuItemSharedProps {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  description?: string;
  /** Size (px) of the startIcon container. Defaults to 20. Use larger values for image logos. */
  startIconSize?: number;
  /** Collapsed sidebar mode — show only the icon, centered, without label. */
  isCollapsed?: boolean;
}

/** Full variant — either a navigable link (to) or an action item (onClick). */
type NavMenuItemFull =
  | (NavMenuItemFullBase & {
      href: string;
      linkComponent?: ElementType;
      target?: string;
      rel?: string;
      onClick?: never;
    })
  | (NavMenuItemFullBase & { href?: never; linkComponent?: never; onClick?: () => void });

export type NavMenuItemProps = NavMenuItemFull;

interface ResolveIconColorOptions {
  active?: boolean;
  disabled?: boolean;
  isRemove?: boolean;
  locked?: boolean;
}

// Options objects, not positional booleans: both this and `resolveTextColor` take the
// same set of optional flags, so a transposed positional call would type-check.
function resolveIconColor({ active, disabled, isRemove, locked }: ResolveIconColorOptions): string {
  if (disabled) return colors.dark[500];
  if (isRemove) return colors.red[100];
  if (active) return colors.orange.dark;
  if (locked) return colors.dark[500];
  return colors.dark[100];
}

interface ResolveTextColorOptions {
  disabled?: boolean;
  isRemove?: boolean;
  inactive?: boolean;
  locked?: boolean;
  active?: boolean;
}

function resolveTextColor({
  disabled,
  isRemove,
  inactive,
  locked,
  active,
}: ResolveTextColorOptions): string {
  if (disabled || inactive) return colors.dark[500];
  if (isRemove) return colors.red[100];
  if (locked && !active) return colors.dark[500];
  if (active) return colors.orange.dark;
  return colors.dark[300];
}

function resolveHoverBg(active?: boolean, isRemove?: boolean): string {
  if (isRemove) return colors.red[600];
  if (active) return colors.orange[600];
  return colors.dark[900];
}

export const NavMenuItem = ({
  ref,
  label,
  active,
  disabled,
  isRemove,
  inactive,
  locked,
  lockedDescription,
  onClick,
  ...props
}: NavMenuItemProps) => {
  const iconColor = resolveIconColor({ active, disabled, isRemove, locked });
  const textColor = resolveTextColor({ disabled, isRemove, inactive, locked, active });
  const hoverBg = resolveHoverBg(active, isRemove);
  const activeBg = active ? colors.orange[600] : "transparent";
  const handleClick = disabled ? undefined : onClick;
  const linkRef = useRef<HTMLElement>(null);
  const lockedDescriptionId = useId();

  const isCollapsed = !!props.isCollapsed;
  // Use uniform 8px padding when the icon is larger than the standard 20px
  // (e.g. 40px integration logos), matching the Figma spec for those items.
  const py = props.startIconSize && props.startIconSize > 20 ? "8px" : "9px";

  // Collapsed mode hides the label and the endIcon slot entirely (see endIconNode below),
  // so a lock indicator would otherwise be invisible whenever the sidebar is collapsed —
  // a common case (PR #3442 round 2 review finding), not a rare edge case. Reuses whatever
  // endIcon content the caller already passed, as a small badge over the start icon,
  // instead of the shared library taking on a lock-icon dependency of its own.
  const collapsedLockBadge = isCollapsed && locked && props.endIcon !== undefined && (
    <Box
      sx={{
        position: "absolute",
        bottom: -3,
        right: -3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 14,
        height: 14,
        borderRadius: "50%",
        backgroundColor: colors.dark[900],
        color: iconColor,
        "& svg": { width: 9, height: 9 },
      }}
    >
      {props.endIcon}
    </Box>
  );

  const startIconNode = props.startIcon !== undefined && (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: props.startIconSize ?? 20,
        height: props.startIconSize ?? 20,
        color: iconColor,
        "& svg": { flexShrink: 0 },
      }}
    >
      {props.startIcon}
      {collapsedLockBadge}
    </Box>
  );

  const labelNode = !isCollapsed && (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <TruncatedTooltip
        text={label}
        typographyProps={{
          variant: "smallBody",
          sx: { display: "block", fontWeight: fontWeight.medium, color: textColor },
        }}
      />
      {props.description && (
        <Typography
          variant="xxSmallBody"
          sx={{
            display: "block",
            color: disabled || inactive ? colors.dark[500] : colors.dark[400],
          }}
        >
          {props.description}
        </Typography>
      )}
    </Box>
  );

  const endIconNode = !isCollapsed && props.endIcon !== undefined && (
    <Box
      className="menu-item-end-icon"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "4px",
        color: iconColor,
        // A locked indicator that only appears on hover defeats its purpose — always show
        // it. Other endIcon consumers (e.g. a per-row "..." quick-actions menu) keep the
        // existing hover-reveal behavior.
        opacity: locked ? 1 : 0,
        transition: "opacity 0.15s",
        pointerEvents: "none",
        "&:hover": { backgroundColor: colors.dark[700] },
        "& > *": { pointerEvents: "auto" },
      }}
    >
      {props.endIcon}
    </Box>
  );

  const linkHref = "href" in props ? props.href : undefined;
  const linkComponent = "linkComponent" in props ? props.linkComponent : undefined;
  const linkTarget = "target" in props ? props.target : undefined;
  const linkRel = "rel" in props ? props.rel : undefined;
  // The link is the actual keyboard-focus target when it exists — most screen readers
  // announce aria-describedby relative to whichever element currently holds focus, so the
  // description has to live there, not on the enclosing (non-focusable) container. When
  // there's no link at all (an onClick-only item, e.g. a nav action with no destination
  // route), the outer MenuItem below is the only focusable/interactive element, so it
  // takes the description instead — round 4 review finding: the href-only wiring left an
  // onClick-based locked item (and a lock icon rendered outside NavMenuItem entirely)
  // with no accessible description at all.
  const isLinkVariant = !!linkHref && !disabled;

  const linkStyle = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  };
  const contentArea = isLinkVariant ? (
    createElement(
      linkComponent ?? "a",
      linkComponent
        ? {
            to: linkHref,
            target: linkTarget,
            rel: linkRel,
            style: linkStyle,
            ref: linkRef,
            "aria-describedby": lockedDescription ? lockedDescriptionId : undefined,
            // The collapsed-mode Tooltip below clones and labels only its direct
            // child (the outer MenuItem) — it never reaches this nested link, which
            // is the actual focus target here, so it needs its own explicit name
            // once the visible label is hidden.
            "aria-current": active ? "page" : undefined,
            "aria-label": isCollapsed ? label : undefined,
          }
        : {
            href: linkHref,
            target: linkTarget,
            rel: linkRel,
            style: linkStyle,
            ref: linkRef,
            "aria-describedby": lockedDescription ? lockedDescriptionId : undefined,
            "aria-current": active ? "page" : undefined,
            "aria-label": isCollapsed ? label : undefined,
          },
      startIconNode,
      labelNode,
    )
  ) : (
    <>
      {startIconNode}
      {labelNode}
    </>
  );

  const handleDeadZoneClick = isLinkVariant
    ? (e: MouseEvent) => {
        if (!(e.target as Element).closest("a")) linkRef.current?.click();
      }
    : handleClick;

  const box = (
    <MenuItem
      ref={ref}
      component="div"
      role={isLinkVariant ? "presentation" : "menuitem"}
      tabIndex={isLinkVariant || disabled ? -1 : 0}
      disableRipple
      onClick={handleDeadZoneClick}
      // `component="div"` means the native `disabled` attribute does not apply, so a
      // disabled item would otherwise be inert to a pointer (no handler, not-allowed
      // cursor) while still announcing as an ordinary menuitem. State the refusal.
      aria-disabled={disabled || undefined}
      aria-describedby={!isLinkVariant && lockedDescription ? lockedDescriptionId : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        px: isCollapsed ? "10px" : "8px",
        py: isCollapsed ? "10px" : py,
        minHeight: 0,
        ...(isCollapsed && { justifyContent: "center" }),
        borderRadius: tokens.radius.control,
        "&:focus-within": { ...focusRing, outlineOffset: "-2px" },
        "& > a:focus-visible": { outline: "none" },
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        backgroundColor: activeBg,
        transition: "background-color 0.15s",
        ...(disabled
          ? {}
          : { "&:hover": { backgroundColor: hoverBg, "& .menu-item-end-icon": { opacity: 1 } } }),
      }}
    >
      {contentArea}
      {endIconNode}
      {lockedDescription && (
        // aria-hidden keeps this out of the enclosing menuitem's own name-from-content
        // computation (which would otherwise concatenate it onto the visible label) —
        // aria-describedby still reads a hidden target's text per spec, so the link
        // itself is unaffected and still gets the description.
        <Box component="span" id={lockedDescriptionId} aria-hidden="true" sx={visuallyHidden}>
          {lockedDescription}
        </Box>
      )}
    </MenuItem>
  );

  if (isCollapsed) {
    return (
      <Tooltip title={label} placement="right">
        {box}
      </Tooltip>
    );
  }

  return box;
};

export interface NavMenuSectionLabelProps {
  label: string;
  action?: ReactNode;
}

export function NavMenuSectionLabel({ label, action }: NavMenuSectionLabelProps) {
  return (
    <Stack direction="row" alignItems="center" sx={{ height: "32px", px: "8px", flexShrink: 0 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="eyebrow">
          {label}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

export function NavMenuDivider() {
  return (
    <Box sx={{ px: "8px", py: "4px" }}>
      <Box sx={{ height: "1px", backgroundColor: colors.dark[700] }} />
    </Box>
  );
}
