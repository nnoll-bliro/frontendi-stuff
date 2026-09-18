import { Box, Tab, Tabs } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { Link, Outlet, useLocation } from "react-router";

export const SettingsLayout = () => {
  const { pathname } = useLocation();
  const activeTab = pathname.startsWith("/settings/sharing") ? "sharing" : "account";

  return (
    <>
      <Box
        component="nav"
        aria-label="Settings navigation"
        sx={{ mb: { xs: 3, md: 4 }, borderBottom: `1px solid ${colors.dark[700]}` }}
      >
        <Tabs
          value={activeTab}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Settings sections"
          sx={{ minHeight: 40 }}
        >
          <Tab
            component={Link}
            to="/settings/account"
            value="account"
            label="My Account"
            sx={{ minWidth: "auto", minHeight: 40, px: { xs: 1.5, sm: 2 } }}
          />
          <Tab
            component={Link}
            to="/settings/sharing"
            value="sharing"
            label="Sharing · Future"
            sx={{ minWidth: "auto", minHeight: 40, px: { xs: 1.5, sm: 2 } }}
          />
        </Tabs>
      </Box>
      <Outlet />
    </>
  );
};
