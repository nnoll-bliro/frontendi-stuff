import { Stack, Typography } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { CalendarClock, FileText, Languages, Users } from "lucide-react";
import { useLoaderData } from "react-router";

import type { Meeting } from "@/api/client";
import { Card } from "@/components/playground/Card";
import {
  AgentSessionsSection,
  ContextText,
  DocumentationBody,
  HubSection,
  ListReturn,
  RecordLink,
  SharingPlaceholder,
} from "@/components/playground/CrmHubSections";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";
import { StatusPill } from "@/components/playground/StatusPill";
import {
  ARTIFACT_STATUS_LABEL,
  artifactStatusTone,
  DOCUMENTATION_SOURCE_LABEL,
  DOCUMENTATION_SOURCE_NOTE,
  formatDateTime,
  formatDuration,
  formatOffset,
  initials,
  MEETING_SOURCE_LABEL,
  MEETING_STATUS_TONE,
} from "@/utils/format";

export const MeetingDetailPage = () => {
  const meeting = useLoaderData() as Meeting;

  const tone = MEETING_STATUS_TONE[meeting.status];
  const entry = meeting.calendarEntry;
  const transcript = meeting.transcript;
  const kindLabel = meeting.kind === "call" ? "Customer call" : "Meeting";

  return (
    <>
      <ListReturn to="/meetings" label="Meetings" />
      <PageHeader
        title={meeting.title}
        description={`${kindLabel} · ${formatDateTime(meeting.startedAt)} · Read-only example`}
        action={<StatusPill label={tone.label} color={tone.color} background={tone.background} />}
      />

      <Stack spacing={4}>
        <HubSection id="overview" title="Overview">
          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <ContextText>{meeting.overview}</ContextText>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Meta icon={<CalendarClock size={14} />}>{formatDateTime(meeting.startedAt)}</Meta>
                <Meta>{formatDuration(meeting.durationMinutes)}</Meta>
                <Meta icon={<Users size={14} />}>{meeting.participantCount} participants</Meta>
                <Meta>{MEETING_SOURCE_LABEL[meeting.source]}</Meta>
                <Meta>Owner: {meeting.ownerName}</Meta>
              </Stack>
            </Stack>
          </Card>
        </HubSection>

        <HubSection
          id="participants"
          title="Company and people"
          description="Who this touchpoint was with. These links exist whether or not the meeting was transcribed."
        >
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.75}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Company
                </Typography>
                {meeting.company ? (
                  <RecordLink to={`/companies/${meeting.company.id}`}>
                    {meeting.company.name}
                  </RecordLink>
                ) : (
                  <ContextText>
                    No company linked — this touchpoint is with an individual contact.
                  </ContextText>
                )}
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Participants ({meeting.participants.length})
                </Typography>
                {meeting.participants.length ? (
                  meeting.participants.map((participant) => (
                    <Stack
                      key={participant.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      useFlexGap
                    >
                      <Avatar
                        title={initials(participant.name)}
                        tooltip={participant.email}
                        variant={participant.userId ? "primary" : "secondary"}
                        size="small"
                      />
                      <Stack sx={{ minWidth: 0 }} spacing={0.25}>
                        {/* Only customer contacts are records; internal users are not. */}
                        {participant.personId ? (
                          <RecordLink to={`/people/${participant.personId}`}>
                            {participant.name}
                          </RecordLink>
                        ) : (
                          <Typography variant="smallBody" sx={{ color: colors.dark[100] }}>
                            {participant.name}
                            {participant.userId ? " · Internal" : ""}
                          </Typography>
                        )}
                        <Typography
                          variant="xxSmallBody"
                          sx={{ color: colors.dark[400], overflowWrap: "anywhere" }}
                        >
                          {participant.email}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))
                ) : (
                  <ContextText>No participants are attached to this touchpoint.</ContextText>
                )}
              </Stack>
            </Stack>
          </Card>
        </HubSection>

        <HubSection
          id="documentation"
          title="Documentation"
          count={meeting.documentation.length}
          description="What was written up about this touchpoint, and where it came from."
        >
          <DocumentationPanel meeting={meeting} />
        </HubSection>

        <HubSection
          id="transcript"
          title="Transcript"
          description="An optional artifact. A touchpoint without one is still a complete record."
        >
          {transcript ? (
            <TranscriptPanel transcript={transcript} />
          ) : (
            <Card sx={{ p: 2.5 }}>
              <ContextText>
                No transcript — this {kindLabel.toLowerCase()} was not transcribed. Nothing is
                processing or missing.
              </ContextText>
            </Card>
          )}
        </HubSection>

        <AgentSessionsSection
          sessions={meeting.agentSessions}
          description="Assistant conversations related to this touchpoint. An assistant call is its own conversation, not a recording of this meeting."
        />

        <HubSection
          id="calendar"
          title="Calendar entry"
          description="Scheduling metadata that supports this touchpoint. The invite is not a second meeting record."
        >
          <Card sx={{ p: 2.5 }}>
            {entry ? (
              <Stack spacing={1}>
                <RecordLink to={`/calendar/${entry.id}`}>{entry.title}</RecordLink>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  {formatDateTime(entry.startsAt)} · {formatDuration(entry.durationMinutes)} ·{" "}
                  {entry.provider === "google" ? "Google Calendar" : "Microsoft 365"} ·{" "}
                  {entry.isExternal ? "External guests" : "Internal only"}
                </Typography>
                {entry.location && (
                  <Typography
                    variant="xSmallBody"
                    sx={{ color: colors.dark[400], overflowWrap: "anywhere" }}
                  >
                    {entry.location}
                  </Typography>
                )}
              </Stack>
            ) : (
              <ContextText>
                Not linked — this touchpoint was added independently of the calendar.
              </ContextText>
            )}
          </Card>
        </HubSection>

        <HubSection id="sharing" title="Sharing">
          <SharingPlaceholder
            name={meeting.title}
            note="Selected-meeting scope: sharing a single touchpoint would be configured here. Nothing is shared in this prototype."
          />
        </HubSection>
      </Stack>
    </>
  );
};

const DocumentationPanel = ({ meeting }: { meeting: Meeting }) => {
  if (meeting.documentation.length === 0) {
    return (
      <EmptyState
        Icon={FileText}
        title="No documentation"
        description="No documentation is attached to this touchpoint."
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {meeting.documentation.map((documentation) => {
        const statusTone = artifactStatusTone(documentation.status);
        return (
          <Card key={documentation.id} sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Typography component="h3" variant="smallTitle" sx={{ color: colors.dark[100] }}>
                  {documentation.title}
                </Typography>
                <StatusPill
                  label={ARTIFACT_STATUS_LABEL[documentation.status]}
                  color={statusTone.color}
                  background={statusTone.background}
                />
              </Stack>

              <Stack spacing={0.5}>
                <Meta>Source: {DOCUMENTATION_SOURCE_LABEL[documentation.source]}</Meta>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  {DOCUMENTATION_SOURCE_NOTE[documentation.source]}
                </Typography>
                {documentation.agentSessionId && (
                  <RecordLink to={`/agent-sessions/${documentation.agentSessionId}`}>
                    Captured in this assistant session
                  </RecordLink>
                )}
              </Stack>

              <DocumentationBody content={documentation.content} />
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};

const TranscriptPanel = ({ transcript }: { transcript: NonNullable<Meeting["transcript"]> }) => {
  const statusTone = artifactStatusTone(transcript.status);
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Meta icon={<Languages size={14} />}>{transcript.language.toUpperCase()}</Meta>
          <StatusPill
            label={ARTIFACT_STATUS_LABEL[transcript.status]}
            color={statusTone.color}
            background={statusTone.background}
          />
        </Stack>

        {transcript.segments.length ? (
          transcript.segments.map((segment) => (
            <Stack key={segment.id} direction="row" spacing={2}>
              <Typography
                variant="xxSmallBody"
                sx={{ color: colors.dark[500], width: 40, flexShrink: 0, pt: "3px" }}
              >
                {formatOffset(segment.startMs)}
              </Typography>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography
                  variant="xSmallBody"
                  sx={{ color: colors.dark[300], fontWeight: fontWeight.semiBold }}
                >
                  {segment.speaker}
                </Typography>
                <Typography variant="normalBody" sx={{ color: colors.dark[100] }}>
                  {segment.text}
                </Typography>
              </Stack>
            </Stack>
          ))
        ) : (
          <Typography variant="normalBody" sx={{ color: colors.dark[400] }}>
            No transcript segments are available.
          </Typography>
        )}
      </Stack>
    </Card>
  );
};

const Meta = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: colors.dark[400] }}>
    {icon}
    <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
      {children}
    </Typography>
  </Stack>
);
