import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import { useLoaderData } from "react-router";

import type { PersonSummary } from "@/api/client";
import { PeopleCards, RecordLink } from "@/components/playground/CrmHubSections";
import { PageHeader } from "@/components/playground/PageHeader";

export const PeoplePage = () => {
  const people = useLoaderData() as PersonSummary[];

  return (
    <>
      <PageHeader
        title="People"
        description="The people behind your customer relationships."
      />
      <Stack direction="row" spacing={tokens.spacing.md} flexWrap="wrap" useFlexGap sx={{ mb: tokens.space.md }}>
        <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
          {people.length} {people.length === 1 ? "person" : "people"}
        </Typography>
        <RecordLink to="/team">Looking for colleagues? Go to Team</RecordLink>
      </Stack>
      <PeopleCards people={people} showCompany />
    </>
  );
};
