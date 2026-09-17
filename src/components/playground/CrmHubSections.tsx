import { Box, Button, Link as MuiLink, Stack, Typography } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { ArrowLeft, Bot, BookOpen, ContactRound, MessagesSquare } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import type {
  AgentSessionSummary,
  KnowledgeItem,
  MeetingSummary,
  PersonSummary,
} from "@server/types";
import {
  AGENT_CHANNEL_LABEL,
  ARTIFACT_STATUS_LABEL,
  formatDateTime,
  formatDuration,
  initials,
  MEETING_STATUS_TONE,
} from "@/utils/format";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { StatusPill } from "./StatusPill";

export const RecordLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <MuiLink
    component={Link}
    to={to}
    variant="smallBody"
    underline="always"
    sx={{ color: colors.orange.dark, overflowWrap: "anywhere" }}
  >
    {children}
  </MuiLink>
);

export const ListReturn = ({ to, label }: { to: string; label: string }) => (
  <Button
    component={Link}
    to={to}
    startIcon={<ArrowLeft size={16} />}
    sx={{ mb: 2, width: "auto", color: colors.orange.dark, textTransform: "none" }}
  >
    Back to {label}
  </Button>
);

export const HubSection = ({
  id,
  title,
  description,
  count,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  count?: number;
  children: ReactNode;
}) => (
  <Stack component="section" aria-labelledby={`${id}-heading`} spacing={1.5}>
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography id={`${id}-heading`} component="h2" variant="h4">
          {title}
        </Typography>
        {count !== undefined && (
          <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
            {count}
          </Typography>
        )}
      </Stack>
      {description && (
        <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
          {description}
        </Typography>
      )}
    </Stack>
    {children}
  </Stack>
);

export const ContextText = ({ children }: { children: ReactNode }) => (
  <Typography
    component="p"
    variant="smallBody"
    sx={{ color: colors.dark[200], overflowWrap: "anywhere" }}
  >
    {children}
  </Typography>
);

/** Shared by the company hub and People directory; links remain separate, real anchors. */
export const PeopleCards = ({
  people,
  showCompany = false,
}: {
  people: PersonSummary[];
  showCompany?: boolean;
}) =>
  people.length === 0 ? (
    <EmptyState
      Icon={ContactRound}
      title="No people linked"
      description="There are no customer contacts in this view."
    />
  ) : (
    <Stack spacing={1.5}>
      {people.map((person) => (
        <Card key={person.id} sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
            <Avatar
              title={initials(person.name)}
              tooltip={person.name}
              size="small"
              variant="secondary"
            />
            <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
              <RecordLink to={`/people/${person.id}`}>{person.name}</RecordLink>
              <Typography
                variant="xSmallBody"
                sx={{ color: colors.dark[400], overflowWrap: "anywhere" }}
              >
                {person.jobTitle} · {person.email}
              </Typography>
              {showCompany &&
                (person.company ? (
                  <RecordLink to={`/companies/${person.company.id}`}>
                    {person.company.name}
                  </RecordLink>
                ) : (
                  <ContextText>No company linked</ContextText>
                ))}
              <ContextText>{person.overview}</ContextText>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );

export const MeetingsSection = ({
  meetings,
  description,
}: {
  meetings: MeetingSummary[];
  description: string;
}) => (
  <HubSection id="meetings" title="Meetings" count={meetings.length} description={description}>
    {meetings.length === 0 ? (
      <EmptyState
        Icon={MessagesSquare}
        title="No meetings linked"
        description="No meeting or call history is linked to this record."
      />
    ) : (
      <Stack spacing={1.5}>
        {meetings.map((meeting) => {
          const tone = MEETING_STATUS_TONE[meeting.status];
          return (
            <Card key={meeting.id} sx={{ p: 2.5 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <RecordLink to={`/meetings/${meeting.id}`}>{meeting.title}</RecordLink>
                  <StatusPill label={tone.label} color={tone.color} background={tone.background} />
                </Stack>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  {meeting.kind === "call" ? "Customer call" : "Meeting"} ·{" "}
                  {formatDateTime(meeting.startedAt)} · {formatDuration(meeting.durationMinutes)}
                </Typography>
                <ContextText>{meeting.overview}</ContextText>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {meeting.people.map((person) => (
                    <RecordLink key={person.id} to={`/people/${person.id}`}>
                      {person.name}
                    </RecordLink>
                  ))}
                </Stack>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  {meeting.transcriptStatus === null
                    ? "No transcript"
                    : `Transcript: ${ARTIFACT_STATUS_LABEL[meeting.transcriptStatus]}`}{" "}
                  · {meeting.hasDocumentation ? "Documentation attached" : "No documentation"}
                </Typography>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    )}
  </HubSection>
);

/** Shared by the Agent Sessions directory and every hub's session list. */
export const AgentSessionCards = ({
  sessions,
  showCompany = false,
}: {
  sessions: AgentSessionSummary[];
  showCompany?: boolean;
}) => (
  <Stack spacing={1.5}>
    {sessions.map((session) => (
      <Card key={session.id} sx={{ p: 2.5 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <RecordLink to={`/agent-sessions/${session.id}`}>{session.title}</RecordLink>
            <StatusPill
              label={AGENT_CHANNEL_LABEL[session.channel]}
              color={colors.dark[300]}
              background={colors.dark[800]}
            />
          </Stack>
          <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
            Assistant conversation · {formatDateTime(session.startedAt)}
          </Typography>
          <ContextText>{session.overview}</ContextText>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {showCompany &&
              (session.company ? (
                <RecordLink to={`/companies/${session.company.id}`}>
                  {session.company.name}
                </RecordLink>
              ) : (
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  No company linked
                </Typography>
              ))}
            {session.people.map((person) => (
              <RecordLink key={person.id} to={`/people/${person.id}`}>
                {person.name}
              </RecordLink>
            ))}
          </Stack>
          {session.meeting ? (
            <Stack spacing={0.5}>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                Related meeting
              </Typography>
              <RecordLink to={`/meetings/${session.meeting.id}`}>
                {session.meeting.title}
              </RecordLink>
            </Stack>
          ) : (
            <ContextText>No related meeting — this session stands on its own.</ContextText>
          )}
        </Stack>
      </Card>
    ))}
  </Stack>
);

export const AgentSessionsSection = ({
  sessions,
  description,
}: {
  sessions: AgentSessionSummary[];
  description: string;
}) => (
  <HubSection
    id="agent-sessions"
    title="Agent Sessions"
    count={sessions.length}
    description={description}
  >
    {sessions.length === 0 ? (
      <EmptyState
        Icon={Bot}
        title="No agent sessions linked"
        description="No assistant conversations are linked to this record."
      />
    ) : (
      <AgentSessionCards sessions={sessions} />
    )}
  </HubSection>
);

/**
 * Seeded documentation may contain light markdown (`**bold**` headings and `-` bullets).
 * Rendering it locally keeps the playground free of a markdown dependency. Shared by the
 * meeting touchpoint and the assistant session that produced the documentation.
 */
export const DocumentationBody = ({ content }: { content: string | null }) =>
  content ? (
    <Stack spacing={1}>
      {content.split("\n").map((line, index) => (
        <DocumentationLine key={index} line={line} />
      ))}
    </Stack>
  ) : (
    <Typography variant="normalBody" sx={{ color: colors.dark[400] }}>
      No documentation content is available.
    </Typography>
  );

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

export const KnowledgeSection = ({ items }: { items: KnowledgeItem[] }) => (
  <HubSection
    id="knowledge"
    title="Knowledge"
    count={items.length}
    description="Seeded relationship context, separate from documentation of individual meetings."
  >
    {items.length === 0 ? (
      <EmptyState
        Icon={BookOpen}
        title="No knowledge added"
        description="No non-meeting notes or context are attached to this record."
      />
    ) : (
      <Stack spacing={1.5}>
        {items.map((item) => (
          <Card key={item.id} sx={{ p: 2.5 }}>
            <Stack spacing={1}>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                {item.kind === "revenue_context"
                  ? "Revenue context · Illustrative only"
                  : "Internal note"}
              </Typography>
              <Typography component="h3" variant="normalTitle">
                {item.title}
              </Typography>
              <ContextText>{item.content}</ContextText>
            </Stack>
          </Card>
        ))}
      </Stack>
    )}
  </HubSection>
);

/**
 * No handlers or policy controls: this describes a scope, not a functional capability.
 * Shared by the company/person hubs and the selected-meeting scope on a touchpoint.
 */
export const SharingPlaceholder = ({ name, note }: { name: string; note?: string }) => (
  <Card sx={{ p: 2.5 }}>
    <Stack spacing={1.5}>
      <ContextText>
        Future capability · Sharing for {name}. No access is granted, changed, or enforced here.
      </ContextText>
      {note && <ContextText>{note}</ContextText>}
      <RecordLink to="/settings/sharing">Organization sharing policies · Future</RecordLink>
    </Stack>
  </Card>
);

/** No handlers or policy controls: these describe scopes, not functional capabilities. */
export const FutureCapabilities = ({
  scope,
  name,
}: {
  scope: "company" | "person";
  name: string;
}) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
    <HubSection id="analysis" title="Analysis">
      <Card sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <ContextText>
            Future capability · {scope === "company" ? "Company" : "Person"}-scoped analysis for{" "}
            {name}. No analysis runs or results are generated in this prototype.
          </ContextText>
          <Button variant="outlined" disabled>
            Analyze this {scope} · Not available
          </Button>
        </Stack>
      </Card>
    </HubSection>
    <HubSection id="sharing" title="Sharing">
      <SharingPlaceholder name={name} />
    </HubSection>
  </Box>
);
