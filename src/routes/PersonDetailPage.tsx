import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import { useLoaderData } from "react-router";

import type { Person } from "@/api/client";
import { Card } from "@/components/playground/Card";
import {
  AgentSessionsSection,
  ContextText,
  FutureCapabilities,
  HubSection,
  KnowledgeSection,
  ListReturn,
  MeetingsSection,
  RecordLink,
} from "@/components/playground/CrmHubSections";
import { PageHeader } from "@/components/playground/PageHeader";

export const PersonDetailPage = () => {
  const person = useLoaderData() as Person;

  return (
    <>
      <ListReturn to="/people" label="People" />
      <PageHeader
        title={person.name}
        eyebrow="Person"
        description={person.jobTitle}
      />
      <Stack spacing={tokens.spacing.section}>
        <HubSection id="overview" title="Overview">
          <Card sx={{ p: tokens.space.lg }}>
            <Stack spacing={tokens.spacing.md}>
              <Typography
                variant="smallBody"
                sx={{ color: colors.dark[400], overflowWrap: "anywhere" }}
              >
                {person.email}
              </Typography>
              <ContextText>{person.overview}</ContextText>
              <Stack spacing={tokens.spacing.xs}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Company
                </Typography>
                {person.company ? (
                  <RecordLink to={`/companies/${person.company.id}`}>
                    {person.company.name}
                  </RecordLink>
                ) : (
                  <ContextText>
                    No company linked. This contact has an independent history.
                  </ContextText>
                )}
              </Stack>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                {person.meetings.length} {person.meetings.length === 1 ? "meeting / call" : "meetings / calls"} ·{" "}
                {person.agentSessions.length} agent {person.agentSessions.length === 1 ? "session" : "sessions"}
              </Typography>
            </Stack>
          </Card>
        </HubSection>
        <MeetingsSection
          meetings={person.meetings}
          description={`Meetings and calls involving ${person.name}.`}
        />
        <AgentSessionsSection
          sessions={person.agentSessions}
          description={`Your assistant conversations about ${person.name}.`}
        />
        <KnowledgeSection items={person.knowledge} />
        <FutureCapabilities scope="person" name={person.name} />
      </Stack>
    </>
  );
};
