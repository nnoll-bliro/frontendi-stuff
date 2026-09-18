import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { FileText, MessagesSquare } from "lucide-react";
import { useLoaderData } from "react-router";

import type { AgentSession, AgentSessionDocumentation } from "@/api/client";
import { Card } from "@/components/playground/Card";
import {
  ContextText,
  DocumentationBody,
  HubSection,
  ListReturn,
  RecordLink,
} from "@/components/playground/CrmHubSections";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";
import { StatusPill } from "@/components/playground/StatusPill";
import {
  AGENT_CHANNEL_LABEL,
  ARTIFACT_STATUS_LABEL,
  artifactStatusTone,
  DOCUMENTATION_SOURCE_LABEL,
  formatDateTime,
} from "@/utils/format";

const CHANNEL_NOTE = {
  call: "You spoke to the assistant by phone. This is your conversation with it, not a recording of a customer.",
  chat: "You worked with the assistant in chat. Nothing here was said by a customer.",
} as const;

export const AgentSessionDetailPage = () => {
  const session = useLoaderData() as AgentSession;
  const channelLabel = AGENT_CHANNEL_LABEL[session.channel];

  return (
    <>
      <ListReturn to="/agent-sessions" label="Agent Sessions" />
      <PageHeader
        title={session.title}
        eyebrow="Agent session"
        description={formatDateTime(session.startedAt)}
        action={
          <StatusPill label={channelLabel} color={colors.dark[300]} background={colors.dark[800]} />
        }
      />

      <Stack spacing={5}>
        <HubSection id="overview" title="Overview">
          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <ContextText>{session.overview}</ContextText>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                {channelLabel} with the assistant · {formatDateTime(session.startedAt)}
              </Typography>
              <ContextText>{CHANNEL_NOTE[session.channel]}</ContextText>
            </Stack>
          </Card>
        </HubSection>

        <HubSection
          id="conversation"
          title="Conversation"
          count={session.messages.length}
          description="Your conversation with the assistant, not a customer transcript."
        >
          {session.messages.length === 0 ? (
            <EmptyState
              Icon={MessagesSquare}
              title="No conversation content"
              description="No messages are stored for this assistant session."
            />
          ) : (
            <Card sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                {session.messages.map((message) => (
                  <Stack key={message.id} spacing={1} sx={{
                    p: 2.5, borderRadius: "8px",
                    backgroundColor: message.role === "user" ? colors.dark[900] : "transparent",
                    borderLeft: `2px solid ${message.role === "user" ? colors.dark[600] : colors.orange[400]}`,
                  }}>
                    <Typography
                      variant="xSmallBody"
                      sx={{ color: colors.dark[300], fontWeight: fontWeight.semiBold }}
                    >
                      {message.role === "user" ? "You" : "Assistant"}
                    </Typography>
                    <Typography variant="normalBody" sx={{ color: colors.dark[100] }}>
                      {message.text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          )}
        </HubSection>

        <HubSection
          id="documentation"
          title="Documentation produced"
          count={session.documentation.length}
          description="Notes created here and attached to the related touchpoint."
        >
          {session.documentation.length === 0 ? (
            <EmptyState
              Icon={FileText}
              title="No documentation produced"
              description="This conversation did not document a touchpoint."
            />
          ) : (
            <Stack spacing={1.5}>
              {session.documentation.map((documentation) => (
                <DocumentationCard key={documentation.id} documentation={documentation} />
              ))}
            </Stack>
          )}
        </HubSection>

        <HubSection
          id="context"
          title="Company and people"
          description="The contacts and company this session is about."
        >
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.75}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Company
                </Typography>
                {session.company ? (
                  <RecordLink to={`/companies/${session.company.id}`}>
                    {session.company.name}
                  </RecordLink>
                ) : (
                  <ContextText>No company linked to this session.</ContextText>
                )}
              </Stack>
              <Stack spacing={0.75}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  People ({session.people.length})
                </Typography>
                {session.people.length ? (
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    {session.people.map((person) => (
                      <RecordLink key={person.id} to={`/people/${person.id}`}>
                        {person.name}
                      </RecordLink>
                    ))}
                  </Stack>
                ) : (
                  <ContextText>No people linked to this session.</ContextText>
                )}
              </Stack>
            </Stack>
          </Card>
        </HubSection>

        <HubSection
          id="meeting"
          title="Related meeting"
          description="The touchpoint discussed in this session, if linked."
        >
          <Card sx={{ p: 2.5 }}>
            {session.meeting ? (
              <Stack spacing={1}>
                <RecordLink to={`/meetings/${session.meeting.id}`}>
                  {session.meeting.title}
                </RecordLink>
                <ContextText>
                  This session is about that touchpoint. Whatever transcript the meeting has is a
                  separate artifact from the conversation above.
                </ContextText>
              </Stack>
            ) : (
              <ContextText>
                No related meeting — this session stands on its own and is not a customer
                touchpoint.
              </ContextText>
            )}
          </Card>
        </HubSection>
      </Stack>
    </>
  );
};

const DocumentationCard = ({ documentation }: { documentation: AgentSessionDocumentation }) => {
  const tone = artifactStatusTone(documentation.status);
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography component="h3" variant="smallTitle" sx={{ color: colors.dark[100] }}>
            {documentation.title}
          </Typography>
          <StatusPill
            label={ARTIFACT_STATUS_LABEL[documentation.status]}
            color={tone.color}
            background={tone.background}
          />
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
            Source: {DOCUMENTATION_SOURCE_LABEL[documentation.source]}
          </Typography>
          <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
            Attached to
          </Typography>
          <RecordLink to={`/meetings/${documentation.meeting.id}`}>
            {documentation.meeting.title}
          </RecordLink>
        </Stack>
        <DocumentationBody content={documentation.content} />
      </Stack>
    </Card>
  );
};
