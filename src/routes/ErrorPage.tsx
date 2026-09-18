import { Button, Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

/** Catches loader failures — most usefully a 404 from the mock API. */
export const ErrorPage = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : undefined;
  const message = isRouteErrorResponse(error)
    ? typeof error.data === "string" && error.data
      ? error.data
      : error.statusText || "Request failed"
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <Stack spacing={tokens.spacing.md} alignItems="flex-start" sx={{ px: tokens.space.section, py: tokens.space.section, maxWidth: 560 }}>
      <Typography variant="h3">{status === 404 ? "Not found" : "Something broke"}</Typography>
      <Typography variant="normalBody" sx={{ color: colors.dark[400] }}>
        {message}
      </Typography>
      <Button variant="contained" component={Link} to="/meetings">
        Back to meetings
      </Button>
    </Stack>
  );
};
