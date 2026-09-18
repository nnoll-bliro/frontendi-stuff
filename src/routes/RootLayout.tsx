import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { NavMenuItem, NavMenuSectionLabel } from "@bliro/ui/components/NavMenuItem";
import { BliroLogo } from "@bliro/ui/logo";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import { Bot, Building2, CalendarDays, ContactRound, MessagesSquare, Palette, Settings, Users } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { Link, Outlet, useLoaderData, useLocation } from "react-router";

import type { Session } from "@/api/client";
import { initials } from "@/utils/format";

const PRIMARY_NAV = [
  { to: "/companies", label: "Companies", Icon: Building2 },
  { to: "/people", label: "People", Icon: ContactRound },
  { to: "/meetings", label: "Meetings", Icon: MessagesSquare },
  { to: "/agent-sessions", label: "Agent Sessions", Icon: Bot },
  { to: "/calendar", label: "Calendar", Icon: CalendarDays },
];
const WORKSPACE_NAV = [
  { to: "/team", label: "Team", Icon: Users },
  { to: "/settings/account", label: "Settings", Icon: Settings },
];

function isActive(pathname: string, to: string): boolean {
  const base = to.startsWith("/settings") ? "/settings" : to;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export const RootLayout = () => {
  const { user, org } = useLoaderData() as Session;
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const collapsed = useMediaQuery(useTheme().breakpoints.down("md"));
  const currentSection = [...PRIMARY_NAV, ...WORKSPACE_NAV].find(({ to }) => isActive(pathname, to));

  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const navItem = ({ to, label, Icon }: (typeof PRIMARY_NAV)[number]) => (
    <NavMenuItem key={to} label={label} href={to} linkComponent={Link}
      active={isActive(pathname, to)} isCollapsed={collapsed} startIcon={<Icon size={18} />} />
  );

  return (
    <Stack direction="row" sx={{ height: "100%" }}>
      <Stack component="nav" aria-label="Main navigation" sx={{
        width: { xs: 64, md: tokens.layout.sidebar }, flexShrink: 0,
        px: { xs: 1, md: 2 }, py: 3, gap: 3, overflowY: "auto",
        borderRight: `1px solid ${tokens.color.border}`, backgroundColor: tokens.color.surface,
      }}>
        <Box sx={{ px: 1, height: 32, overflow: "hidden", flexShrink: 0 }}>
          <BliroLogo width={110} height={31} />
        </Box>
        <Stack sx={{ flex: 1, gap: 3 }}>
          <Stack spacing={0.5}>
            {!collapsed && <NavMenuSectionLabel label="Relationships" />}
            {PRIMARY_NAV.map(navItem)}
          </Stack>
          <Stack spacing={0.5}>
            {!collapsed && <NavMenuSectionLabel label="Workspace" />}
            {WORKSPACE_NAV.map(navItem)}
          </Stack>
        </Stack>
        <NavMenuItem label="Design system" href="/design-system" linkComponent={Link}
          active={pathname === "/design-system"} isCollapsed={collapsed} startIcon={<Palette size={18} />} />
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{
          pt: 2, px: { xs: 0, md: 1 }, borderTop: `1px solid ${tokens.color.border}`,
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <Avatar title={initials(user.name)} tooltip={user.email} size="small" variant="secondary" />
          {!collapsed && <Stack sx={{ minWidth: 0 }}>
            <Typography variant="xSmallTitle" noWrap sx={{ fontWeight: 500 }}>{user.name}</Typography>
            <Typography variant="xxSmallBody" noWrap>{org.name}</Typography>
          </Stack>}
        </Stack>
      </Stack>

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
          minHeight: 64, px: { xs: 2, md: 5 }, gap: 2, backgroundColor: tokens.color.surface,
          borderBottom: `1px solid ${tokens.color.border}`,
        }}>
          <Typography variant="xSmallBody" noWrap sx={{ color: colors.dark[300] }}>
            {org.name}<Box component="span" sx={{ mx: 1.5, color: colors.dark[600] }}>/</Box>
            {currentSection?.label ?? "Design system"}
          </Typography>
          <Typography variant="xxSmallBody" sx={{ flexShrink: 0 }}>Prototype</Typography>
        </Stack>
        <Box ref={mainRef} id="main-content" component="main" sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <Box sx={{ maxWidth: tokens.layout.content, mx: "auto", px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 5 } }}>
            <Outlet />
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};
