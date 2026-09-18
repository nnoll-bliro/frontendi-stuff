import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { useLoaderData } from "react-router";

import type { Company } from "@/api/client";
import { Card } from "@/components/playground/Card";
import {
  AgentSessionsSection,
  ContextText,
  FutureCapabilities,
  HubSection,
  KnowledgeSection,
  ListReturn,
  MeetingsSection,
  PeopleCards,
} from "@/components/playground/CrmHubSections";
import { PageHeader } from "@/components/playground/PageHeader";

export const CompanyDetailPage = () => {
  const company = useLoaderData() as Company;

  return (
    <>
      <ListReturn to="/companies" label="Companies" />
      <PageHeader
        title={company.name}
        eyebrow="Company"
        description={company.domain}
      />
      <Stack spacing={5}>
        <HubSection id="overview" title="Overview">
          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <ContextText>{company.overview}</ContextText>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                {company.people.length} {company.people.length === 1 ? "person" : "people"} ·{" "}
                {company.meetings.length} {company.meetings.length === 1 ? "meeting / call" : "meetings / calls"} ·{" "}
                {company.agentSessions.length} agent {company.agentSessions.length === 1 ? "session" : "sessions"}
              </Typography>
            </Stack>
          </Card>
        </HubSection>
        <HubSection
          id="people"
          title="People"
          count={company.people.length}
          description="Your contacts at this company."
        >
          <PeopleCards people={company.people} />
        </HubSection>
        <MeetingsSection
          meetings={company.meetings}
          description="Customer meetings and calls."
        />
        <AgentSessionsSection
          sessions={company.agentSessions}
          description="Your assistant conversations about this company."
        />
        <KnowledgeSection items={company.knowledge} />
        <FutureCapabilities scope="company" name={company.name} />
      </Stack>
    </>
  );
};
