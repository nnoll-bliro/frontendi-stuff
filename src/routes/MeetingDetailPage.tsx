import { Box, Stack, Typography } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { BackButton } from "@bliro/ui/components/BackButton/BackButton";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { CalendarClock, ExternalLink, FileText, Languages, Users } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";

import type { ArtifactStatus, Meeting, MeetingDocumentation } from "@/api/client";
import { Card } from "@/components/playground/Card";
import { EmptyState } from "@/components/playground/EmptyState";
import { StatusPill } from "@/components/playground/StatusPill";
import { TabItem } from "@/components/TabItem/TabItem";
import {
  formatDateTime,
  formatDuration,
  formatOffset,
  initials,
  MEETING_SOURCE_LABEL,
  MEETING_STATUS_TONE,
} from "@/utils/format";

type Tab = "documentation" | "transcript";

const DOCUMENTATION_SOURCE_LABEL: Record<MeetingDocumentation["source"], string> = {
  meeting_summary: "Meeting summary",
  phone_assistant: "Phone Assistant",
  voice_memo: "Voice memo",
};

const ARTIFACT_STATUS_LABEL: Record<ArtifactStatus, string> = {
  collecting: "Collecting",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

export const MeetingDetailPage = () => {
  const meeting = useLoaderData() as Meeting;
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(
    meeting.documentation.length ? "documentation" : "transcript",
  );

  const tone = MEETING_STATUS_TONE[meeting.status];
  const entry = meeting.calendarEntry;
  const transcript = meeting.transcript;

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <BackButton onClick={() => navigate("/meetings")} />
      </Box>

      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h3">{meeting.title}</Typography>
          <StatusPill label={tone.label} color={tone.color} background={tone.background} />
        </Stack>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Meta icon={<CalendarClock size={14} />}>{formatDateTime(meeting.startedAt)}</Meta>
          <Meta>{formatDuration(meeting.durationMinutes)}</Meta>
          <Meta icon={<Users size={14} />}>{meeting.participantCount} participants</Meta>
          {transcript && (
            <Meta icon={<Languages size={14} />}>{transcript.language.toUpperCase()}</Meta>
          )}
          <Meta>{MEETING_SOURCE_LABEL[meeting.source]}</Meta>
          <Meta>Owner: {meeting.ownerName}</Meta>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Stack sx={{ flex: 1, minWidth: 0 }} spacing={2}>
          <Stack direction="row" spacing={1}>
            <TabItem
              title={`Documentation (${meeting.documentation.length})`}
              Icon={FileText}
              isActive={tab === "documentation"}
              onClick={() => setTab("documentation")}
            />
            <TabItem
              title={`Transcript (${transcript?.segments.length ?? 0})`}
              Icon={Users}
              isActive={tab === "transcript"}
              onClick={() => setTab("transcript")}
            />
          </Stack>

          {tab === "documentation" ? (
            <DocumentationPanel meeting={meeting} />
          ) : (
            <TranscriptPanel meeting={meeting} />
          )}
        </Stack>

        <Stack sx={{ width: 300, flexShrink: 0 }} spacing={2}>
          {entry ? (
            <Card sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Calendar entry
                </Typography>
                <Stack
                  component={Link}
                  to={`/calendar/${entry.id}`}
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="smallBody"
                    sx={{ color: colors.orange[100], fontWeight: fontWeight.medium }}
                  >
                    {entry.title}
                  </Typography>
                  <ExternalLink size={13} color={colors.orange[100]} />
                </Stack>
                <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                  {formatDateTime(entry.startsAt)} · {formatDuration(entry.durationMinutes)} ·{" "}
                  {entry.provider === "google" ? "Google Calendar" : "Microsoft 365"}
                </Typography>
              </Stack>
            </Card>
          ) : (
            <Card sx={{ p: 2 }}>
              <Stack spacing={0.5}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Calendar entry
                </Typography>
                <Typography variant="smallBody" sx={{ color: colors.dark[300] }}>
                  Not linked — this meeting was added independently.
                </Typography>
              </Stack>
            </Card>
          )}

          <Card sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                Participants
              </Typography>
              {meeting.participants.length ? (
                meeting.participants.map((participant) => (
                  <Stack key={participant.id} direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      title={initials(participant.name)}
                      tooltip={participant.email}
                      variant={participant.userId ? "primary" : "secondary"}
                      size="small"
                    />
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography variant="smallBody" noWrap sx={{ color: colors.dark[100] }}>
                        {participant.name}
                      </Typography>
                      <Typography variant="xxSmallBody" noWrap sx={{ color: colors.dark[400] }}>
                        {participant.email}
                      </Typography>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
                  No participants are attached to this meeting.
                </Typography>
              )}
            </Stack>
          </Card>
        </Stack>
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
        description="No documentation is attached to this meeting."
      />
    );
  }

  return (
    <Stack spacing={2}>
      {meeting.documentation.map((documentation) => {
        const statusTone = artifactStatusTone(documentation.status);
        return (
          <Card key={documentation.id} sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Typography variant="smallTitle" sx={{ color: colors.dark[100] }}>
                  {documentation.title}
                </Typography>
                <StatusPill
                  label={ARTIFACT_STATUS_LABEL[documentation.status]}
                  color={statusTone.color}
                  background={statusTone.background}
                />
              </Stack>

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Meta>Source: {DOCUMENTATION_SOURCE_LABEL[documentation.source]}</Meta>
                {documentation.agentSessionId && (
                  <Typography
                    component={Link}
                    to={`/agent-sessions/${documentation.agentSessionId}`}
                    variant="xSmallBody"
                    sx={{ color: colors.orange[100], textDecoration: "none" }}
                  >
                    Provenance: assistant session
                  </Typography>
                )}
              </Stack>

              {documentation.content ? (
                <Stack spacing={1}>
                  {documentation.content.split("\n").map((line, index) => (
                    <DocumentationLine key={index} line={line} />
                  ))}
                </Stack>
              ) : (
                <Typography variant="normalBody" sx={{ color: colors.dark[400] }}>
                  No documentation content is available.
                </Typography>
              )}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};

/**
 * Seeded documentation may contain light markdown (`**bold**` headings and `-` bullets).
 * Rendering it locally keeps the playground free of a markdown dependency.
 */
const DocumentationLine = ({ line }: { line: string }) => {
  if (!line.trim()) return <Box sx={{ height: 4 }} />;

  const heading = line.match(/^\*\*(.+)\*\*$/);
  if (heading) {
    return (
      <Typography
        variant="smallTitle"
        sx={{ color: colors.dark[100], fontWeight: fontWeight.semiBold, mt: 1 }}
      >
        {heading[1]}
      </Typography>
    );
  }

  if (line.startsWith("- ")) {
    return (
      <Stack direction="row" spacing={1}>
        <Typography variant="normalBody" sx={{ color: colors.orange[100] }}>
          •
        </Typography>
        <Typography variant="normalBody" sx={{ color: colors.dark[200] }}>
          {renderInline(line.slice(2))}
        </Typography>
      </Stack>
    );
  }

  return (
    <Typography variant="normalBody" sx={{ color: colors.dark[200] }}>
      {renderInline(line)}
    </Typography>
  );
};

/** Inline `**bold**` only — everything else is plain text. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <Box key={index} component="strong" sx={{ fontWeight: fontWeight.semiBold }}>
        {part.slice(2, -2)}
      </Box>
    ) : (
      part
    ),
  );
}

const TranscriptPanel = ({ meeting }: { meeting: Meeting }) => {
  const transcript = meeting.transcript;
  if (!transcript) {
    return (
      <EmptyState
        Icon={Users}
        title="No transcript"
        description="No transcript is attached to this meeting."
      />
    );
  }

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

function artifactStatusTone(status: ArtifactStatus) {
  if (status === "ready") {
    return { color: colors.green.dark, background: colors.green[600] };
  }
  if (status === "failed") {
    return { color: colors.red.dark, background: colors.red[600] };
  }
  return { color: colors.yellow.dark, background: colors.yellow[600] };
}

const Meta = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: colors.dark[400] }}>
    {icon}
    <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
      {children}
    </Typography>
  </Stack>
);
