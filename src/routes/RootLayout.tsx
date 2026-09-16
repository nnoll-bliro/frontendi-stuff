import { Box, Stack, Typography } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { NavMenuDivider, NavMenuItem } from "@bliro/ui/components/NavMenuItem";
import { BliroLogo } from "@bliro/ui/logo";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { CalendarDays, Mic, Palette, Settings, Users } from "lucide-react";
import { Link, Outlet, useLoaderData, useLocation } from "react-router";

import type { Session } from "@/api/client";
import { initials } from "@/utils/format";

const NAV = [
  { to: "/meetings", label: "Meetings", Icon: Mic },
  { to: "/calendar", label: "Calendar", Icon: CalendarDays },
  { to: "/team", label: "Team", Icon: Users },
  { to: "/settings/account", label: "Settings", Icon: Settings },
];

const SIDEBAR_WIDTH = 248;

/**
 * Prefix match so a detail route keeps its section lit (/meetings/:id -> Meetings).
 * Settings links straight to a sub-page, so it matches on /settings rather than on
 * its own href.
 */
function isActive(pathname: string, to: string): boolean {
  const base = to.startsWith("/settings") ? "/settings" : to;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export const RootLayout = () => {
  const { user, org } = useLoaderData() as Session;
  const { pathname } = useLocation();

  return (
    <Stack direction="row" sx={{ height: "100%" }}>
      <Stack
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          p: 2,
          gap: 2,
          borderRight: `1px solid ${colors.dark[700]}`,
          backgroundColor: colors.dark[900],
        }}
      >
        <Box sx={{ px: 1, pt: 1 }}>
          <BliroLogo />
        </Box>

        <Stack sx={{ flex: 1, gap: "2px" }}>
          {NAV.map(({ to, label, Icon }) => (
            <NavMenuItem
              key={to}
              label={label}
              href={to}
              linkComponent={Link}
              // Prefix match so /meetings/:id keeps "Meetings" highlighted.
              active={isActive(pathname, to)}
              startIcon={<Icon size={18} />}
            />
          ))}
          <NavMenuDivider />
          <NavMenuItem
            label="Design system"
            href="/design-system"
            linkComponent={Link}
            active={pathname === "/design-system"}
            startIcon={<Palette size={18} />}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            p: 1,
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            border: `1px solid ${colors.dark[700]}`,
          }}
        >
          <Avatar title={initials(user.name)} tooltip={user.email} size="small" />
          <Stack sx={{ minWidth: 0 }}>
            <Typography
              variant="xSmallBody"
              noWrap
              sx={{ color: colors.dark[100], fontWeight: fontWeight.medium }}
            >
              {user.name}
            </Typography>
            <Typography variant="xxSmallBody" noWrap sx={{ color: colors.dark[400] }}>
              {org.name}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Box component="main" sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <Box sx={{ maxWidth: 1040, mx: "auto", px: 5, py: 5 }}>
          <Outlet />
        </Box>
      </Box>
    </Stack>
  );
};
