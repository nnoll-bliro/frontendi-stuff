import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
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
        description="Customer contacts and independent advisers, separate from your internal Team. Read-only examples."
      />
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
          {people.length} {people.length === 1 ? "person" : "people"}
        </Typography>
        <RecordLink to="/team">Looking for colleagues? Go to Team</RecordLink>
      </Stack>
      <PeopleCards people={people} showCompany />
    </>
  );
};
