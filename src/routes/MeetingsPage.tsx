import { Stack, Typography } from "@mui/material";
import { Input } from "@bliro/ui/components/Input";
import { SurfaceList } from "@bliro/ui/components/Surface";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  ListFilter,
  type LucideIcon,
  Mic,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";

import { api, type MeetingSummary } from "@/api/client";
import { Card } from "@/components/playground/Card";
import { ContextText, RecordLink } from "@/components/playground/CrmHubSections";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";
import { StatusPill } from "@/components/playground/StatusPill";
import { TabItem } from "@/components/TabItem/TabItem";
import {
  ARTIFACT_STATUS_LABEL,
  formatDateTime,
  formatDuration,
  MEETING_SOURCE_LABEL,
  MEETING_STATUS_TONE,
} from "@/utils/format";

const STATUS_TABS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "all", label: "All", Icon: ListFilter },
  { value: "scheduled", label: "Scheduled", Icon: CalendarClock },
  { value: "in_progress", label: "In progress", Icon: CircleDashed },
  { value: "held", label: "Held", Icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", Icon: XCircle },
];

export const MeetingsPage = () => {
  const initial = useLoaderData() as MeetingSummary[];
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") ?? "all";
  const q = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const [meetings, setMeetings] = useState(initial);

  // The loader covers the first paint; filtering afterwards re-queries SQLite
  // directly so the search box stays responsive without a full navigation.
  useEffect(() => {
    const controller = new AbortController();
    api
      .meetings({ q, status }, controller.signal)
      .then(setMeetings)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error(error);
      });
    return () => controller.abort();
  }, [q, status]);

  // Debounce the URL write, not the request — the address bar stays shareable
  // without a param update on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchParams(
        (params) => {
          if (draft) params.set("q", draft);
          else params.delete("q");
          return params;
        },
        { replace: true },
      );
    }, 200);
    return () => clearTimeout(id);
  }, [draft, setSearchParams]);

  return (
    <>
      <PageHeader
        title="Meetings"
        description="Customer meetings and calls, whether scheduled or added ad hoc."
        action={
          <Input
            aria-label="Search meetings"
            placeholder="Search meetings…"
            startIcon={<Search size={16} color={colors.dark[400]} />}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            wrapperProps={{ sx: { width: { xs: "100%", sm: 260 } } }}
          />
        }
      />

      <Stack direction="row" spacing={tokens.spacing.sm} flexWrap="wrap" useFlexGap sx={{ mb: tokens.space.lg }}>
        {STATUS_TABS.map((tab) => (
          <TabItem
            key={tab.value}
            title={tab.label}
            Icon={tab.Icon}
            isActive={status === tab.value}
            onClick={() =>
              setSearchParams((params) => {
                if (tab.value === "all") params.delete("status");
                else params.set("status", tab.value);
                return params;
              })
            }
          />
        ))}
      </Stack>

      {meetings.length === 0 ? (
        <EmptyState
          Icon={Mic}
          title="No meetings match"
          description="Try a different search term, or switch back to All."
        />
      ) : (
        <SurfaceList>
          {meetings.map((meeting) => {
            const tone = MEETING_STATUS_TONE[meeting.status];
            return (
              <Card key={meeting.id} sx={{ p: tokens.space.lg }}>
                <Stack spacing={tokens.spacing.sm}>
                  <Stack direction="row" alignItems="center" spacing={tokens.spacing.sm} flexWrap="wrap" useFlexGap>
                    <RecordLink to={`/meetings/${meeting.id}`} primary>{meeting.title}</RecordLink>
                    <StatusPill label={tone.label} color={tone.color} background={tone.background} />
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={tokens.spacing.md} flexWrap="wrap" useFlexGap>
                    <Meta>{meeting.kind === "call" ? "Customer call" : "Meeting"}</Meta>
                    <Meta icon={<CalendarClock size={13} />}>
                      {formatDateTime(meeting.startedAt)}
                    </Meta>
                    <Meta>{formatDuration(meeting.durationMinutes)}</Meta>
                    <Meta icon={<Users size={13} />}>{meeting.participantCount}</Meta>
                    <Meta>{MEETING_SOURCE_LABEL[meeting.source]}</Meta>
                    <Meta>{meeting.ownerName}</Meta>
                  </Stack>

                  <ContextText>{meeting.overview}</ContextText>

                  {/* Company and people stand on their own; neither depends on a transcript. */}
                  <Stack direction="row" alignItems="center" spacing={tokens.spacing.sm} flexWrap="wrap" useFlexGap>
                    {meeting.company ? (
                      <RecordLink to={`/companies/${meeting.company.id}`}>
                        {meeting.company.name}
                      </RecordLink>
                    ) : (
                      <Meta>No company linked</Meta>
                    )}
                    {meeting.people.map((person) => (
                      <RecordLink key={person.id} to={`/people/${person.id}`}>
                        {person.name}
                      </RecordLink>
                    ))}
                  </Stack>

                  {/* Artifact availability, kept separate from the touchpoint itself. */}
                  <Meta>
                    {meeting.transcriptStatus === null
                      ? "No transcript"
                      : `Transcript: ${ARTIFACT_STATUS_LABEL[meeting.transcriptStatus]}`}{" "}
                    · {meeting.hasDocumentation ? "Documentation attached" : "No documentation"}
                  </Meta>
                </Stack>
              </Card>
            );
          })}
        </SurfaceList>
      )}
    </>
  );
};

const Meta = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <Stack direction="row" alignItems="center" spacing={tokens.spacing.xs} sx={{ color: colors.dark[400] }}>
    {icon}
    <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
      {children}
    </Typography>
  </Stack>
);
