import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "@bliro/ui/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

// theme.css declares the --bliro-* custom properties and the @font-face rules
// for Inter. The MUI theme covers the sx/Typography side; CSS Modules read the
// same palette through these variables.
import "./i18n/i18n";
import "@bliro/ui/theme.css";
import "./index.css";

import { router } from "./routes/router";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing #root container in index.html");
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
