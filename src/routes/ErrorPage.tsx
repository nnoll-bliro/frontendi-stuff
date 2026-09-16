import { Button, Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { Link, useRouteError } from "react-router";

/** Catches loader failures — most usefully a 404 from the mock API. */
export const ErrorPage = () => {
  const error = useRouteError();
  const status = error instanceof Response ? error.status : undefined;
  const message =
    error instanceof Response
      ? error.statusText || "Request failed"
      : error instanceof Error
        ? error.message
        : "Something went wrong.";

  return (
    <Stack spacing={2} alignItems="flex-start" sx={{ px: 5, py: 8, maxWidth: 560 }}>
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
