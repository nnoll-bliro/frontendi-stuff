import { Box, Stack, Typography } from "@mui/material";
import { BackButton } from "@bliro/ui/components/BackButton/BackButton";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { CalendarClock, ExternalLink, FileText, Languages, Users } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";

import type { Meeting } from "@/api/client";
import { Card } from "@/components/playground/Card";
import { EmptyState } from "@/components/playground/EmptyState";
import { ParticipantRow } from "@/components/playground/ParticipantRow";
import { StatusPill } from "@/components/playground/StatusPill";
import { TabItem } from "@/components/TabItem/TabItem";
import {
  formatDateTime,
  formatDuration,
  formatOffset,
  MEETING_SOURCE_LABEL,
  MEETING_STATUS_TONE,
} from "@/utils/format";

type Tab = "summary" | "transcript";

export const MeetingDetailPage = () => {
  const meeting = useLoaderData() as Meeting;
  const navigate = useNavigate();
  // Land on whichever tab actually has content — a meeting that is still
  // recording has a growing transcript and no summary at all.
  const [tab, setTab] = useState<Tab>(meeting.summary ? "summary" : "transcript");

  const tone = MEETING_STATUS_TONE[meeting.status];
  const entry = meeting.calendarEntry;

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <BackButton onClick={() => navigate("/meetings")} />
      </Box>

      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h3">{meeting.title}</Typography>
          <StatusPill
            label={tone.label}
            color={tone.color}
            background={tone.background}
            live={meeting.status === "recording"}
          />
        </Stack>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Meta icon={<CalendarClock size={14} />}>{formatDateTime(meeting.startedAt)}</Meta>
          <Meta>{formatDuration(meeting.durationMinutes)}</Meta>
          <Meta icon={<Users size={14} />}>{meeting.participantCount} participants</Meta>
          <Meta icon={<Languages size={14} />}>{meeting.language.toUpperCase()}</Meta>
          <Meta>{MEETING_SOURCE_LABEL[meeting.source]}</Meta>
          <Meta>Owner: {meeting.ownerName}</Meta>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Stack sx={{ flex: 1, minWidth: 0 }} spacing={2}>
          <Stack direction="row" spacing={1}>
            <TabItem
              title="Summary"
              Icon={FileText}
              isActive={tab === "summary"}
              onClick={() => setTab("summary")}
            />
            <TabItem
              title={`Transcript (${meeting.transcript.length})`}
              Icon={Users}
              isActive={tab === "transcript"}
              onClick={() => setTab("transcript")}
            />
          </Stack>

          {tab === "summary" ? <SummaryPanel meeting={meeting} /> : <TranscriptPanel meeting={meeting} />}
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
                  Not linked — this one was started ad hoc.
                </Typography>
              </Stack>
            </Card>
          )}

          <Card sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                Participants
              </Typography>
              {entry ? (
                entry.participants.map((participant) => (
                  <ParticipantRow key={participant.id} participant={participant} />
                ))
              ) : (
                <Stack spacing={1}>
                  {speakersOf(meeting).map((speaker) => (
                    <Typography key={speaker} variant="smallBody" sx={{ color: colors.dark[200] }}>
                      {speaker}
                    </Typography>
                  ))}
                  <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                    Detected from the transcript — there were no invitees to match against.
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </>
  );
};

/** Distinct speakers in transcript order — the stand-in for an ad-hoc guest list. */
function speakersOf(meeting: Meeting): string[] {
  return [...new Set(meeting.transcript.map((segment) => segment.speaker))];
}

const SummaryPanel = ({ meeting }: { meeting: Meeting }) => {
  if (!meeting.summary) {
    return (
      <EmptyState
        Icon={FileText}
        title={meeting.status === "recording" ? "Still recording" : "Summary is being generated"}
        description={
          meeting.status === "recording"
            ? "The summary is written once the meeting ends."
            : "This usually takes a couple of minutes after the meeting ends."
        }
      />
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={1}>
        {meeting.summary.split("\n").map((line, index) => (
          <SummaryLine key={index} line={line} />
        ))}
      </Stack>
    </Card>
  );
};

/**
 * The seeded summaries are light markdown (`**bold**` headings, `-` bullets).
 * Rendering them by hand keeps the playground free of a markdown dependency the
 * real app resolves differently.
 */
const SummaryLine = ({ line }: { line: string }) => {
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
  if (meeting.transcript.length === 0) {
    return (
      <EmptyState
        Icon={Users}
        title="No transcript yet"
        description="Bliro is still processing the audio for this meeting."
      />
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        {meeting.transcript.map((segment) => (
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
        ))}
        {meeting.status === "recording" && (
          <Typography variant="xSmallBody" sx={{ color: colors.red[100] }}>
            Live — new lines appear as the meeting continues.
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
