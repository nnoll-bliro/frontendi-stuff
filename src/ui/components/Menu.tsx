import {
  CircularProgress,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  MenuProps as MuiMenuProps,
  Tooltip,
  Typography,
} from "@mui/material";
import { LucideProps } from "lucide-react";
import { ComponentType } from "react";

import { colors } from "../theme/colors";
import { fontWeight } from "../theme/fonts";

export enum MenuItemVariant {
  Default = "default",
  Danger = "danger",
}

export type MenuItemPayload =
  | {
      type: "item";
      Icon: ComponentType<LucideProps>;
      onClick: () => void;
      text: string;
      variant?: MenuItemVariant;
      disabled?: boolean;
      loading?: boolean;
      // Why the item cannot be used. A disabled item is otherwise just grey with
      // no reason given, so set this whenever `disabled` is conditional.
      disabledReason?: string;
    }
  | {
      type: "divider";
    };

export interface MenuProps extends Omit<MuiMenuProps, "slotProps"> {
  items: MenuItemPayload[];
  offset?: string;
}

export function Menu({ items, offset = "2px", ...props }: MenuProps) {
  return (
    <MuiMenu
      {...props}
      // The gap lives on the list, not on a wrapper: MUI's MenuList manages
      // focus over its DIRECT children, so anything between the ul and the
      // items (a Stack, a Tooltip span) receives the list's tabIndex/autoFocus
      // and arrow-key traversal dies for the whole menu.
      //
      // `disabledItemsFocusable`, or arrow keys skip a disabled item and its
      // `disabledReason` tooltip — which also opens on focus — stays
      // mouse-only. Activation is still inert: a disabled item has no onClick.
      MenuListProps={{
        disabledItemsFocusable: true,
        sx: { display: "flex", flexDirection: "column", gap: 0.5 },
      }}
      slotProps={{
        paper: {
          sx: {
            marginTop: offset,
            padding: "8px !important",
          },
        },
      }}
    >
      {items.map((item, index) => {
        return <MenuItem key={index} item={item} />;
      })}
    </MuiMenu>
  );
}

function MenuItem({ item }: { item: MenuItemPayload }) {
  switch (item.type) {
    case "item": {
      const isDisabled = item.disabled || item.loading;
      const { iconColor, hoverBackgroundColor, textColor } = getMenuItemColors(
        item.variant,
        isDisabled,
      );
      const Icon = item.Icon;

      // Disabled by aria and a guarded onClick, never by the `disabled` prop:
      // that prop turns off pointer events, so the disabledReason tooltip could
      // only listen on a wrapper element — which, as a direct child of the
      // MenuList, breaks its focus management (see the MenuListProps note).
      // This way the item stays a real, hoverable, keyboard-focusable menuitem;
      // the tooltip attaches to it directly (Tooltip clones, no extra DOM) and
      // opens on focus too, so the reason is reachable without a mouse.
      const content = (
        <MuiMenuItem
          onClick={isDisabled ? undefined : item.onClick}
          aria-disabled={isDisabled || undefined}
          disableRipple={isDisabled}
          sx={{
            borderRadius: "4px",
            padding: "4px 8px !important",
            cursor: isDisabled ? "default" : "pointer",
            "&:hover": {
              backgroundColor: isDisabled ? "transparent" : hoverBackgroundColor,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: "28px !important" }}>
            {item.loading ? (
              <CircularProgress size={20} sx={{ color: colors.orange[100] }} />
            ) : Icon ? (
              <Icon size={20} color={iconColor} />
            ) : null}
          </ListItemIcon>
          <ListItemText>
            <Typography variant="xSmallBody" fontWeight={fontWeight["semiBold"]} color={textColor}>
              {item.text}
            </Typography>
          </ListItemText>
        </MuiMenuItem>
      );

      return isDisabled && item.disabledReason ? (
        <Tooltip title={item.disabledReason} placement="left">
          {content}
        </Tooltip>
      ) : (
        content
      );
    }
    case "divider":
      return (
        <Divider
          sx={{
            borderColor: colors["dark"][700],
            margin: "4px 16px !important",
          }}
        />
      );
  }
}
function getMenuItemColors(variant = MenuItemVariant.Default, isDisabled = false) {
  if (isDisabled) {
    return {
      iconColor: colors["dark"][600],
      textColor: colors["dark"][600],
      hoverBackgroundColor: "transparent",
    };
  }

  switch (variant) {
    case MenuItemVariant.Default:
      return {
        iconColor: colors["dark"][400],
        textColor: colors["dark"][200],
        hoverBackgroundColor: colors["dark"][800],
      };
    case MenuItemVariant.Danger:
      return {
        iconColor: colors["red"][100],
        textColor: colors["red"][100],
        hoverBackgroundColor: colors["red"][600],
      };
  }
}
