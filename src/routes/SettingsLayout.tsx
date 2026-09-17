import { Box, Tab, Tabs } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router";

export const SettingsLayout = () => {
  const { pathname } = useLocation();

  return (
    <>
      <Box component="nav" aria-label="Settings navigation" sx={{ mb: 3 }}>
        <Tabs value={pathname === "/settings/sharing" || pathname === "/settings/sharing/" ? "sharing" : "account"}>
          <Tab component={Link} to="/settings/account" value="account" label="My Account" />
          <Tab component={Link} to="/settings/sharing" value="sharing" label="Sharing · Future" />
        </Tabs>
      </Box>
      <Outlet />
    </>
  );
};
