import { Box, Button, Stack, Typography } from "@mui/material";
import { BackButton } from "@bliro/ui/components/BackButton/BackButton";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { CalendarClock, FileText, Link2, Video } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "react-router";

import type { CalendarEntry } from "@/api/client";
import { Card } from "@/components/playground/Card";
import { ParticipantRow } from "@/components/playground/ParticipantRow";
import { CustomIcon } from "@/components/utils/CustomIcon";
import { formatDateTime, formatDuration } from "@/utils/format";

export const CalendarEntryPage = () => {
  const entry = useLoaderData() as CalendarEntry;
  const navigate = useNavigate();
  const isLink = entry.location?.startsWith("http") ?? false;

  return (
    <>
      <Box sx={{ mb: 2.5 }}>
        <BackButton onClick={() => navigate("/calendar")} />
      </Box>

      <Stack spacing={1} sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography component="h1" variant="pageTitle" sx={{ overflowWrap: "anywhere" }}>
          {entry.title}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarClock size={14} color={colors.dark[400]} />
            <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
              {formatDateTime(entry.startsAt)} · {formatDuration(entry.durationMinutes)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CustomIcon
              icon={entry.provider === "google" ? "GoogleCalendarIcon" : "OutlookIcon"}
              width={14}
              height={14}
            />
            <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
              {entry.provider === "google" ? "Google Calendar" : "Microsoft 365"}
            </Typography>
          </Stack>
          <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
            {entry.isExternal ? "External guests" : "Internal only"}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "stretch", md: "flex-start" }}
      >
        <Stack sx={{ flex: 1, minWidth: 0 }} spacing={2}>
          <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Detail label="Description">
                <Typography variant="normalBody" sx={{ color: colors.dark[200] }}>
                  {entry.description ?? "No description on this invite."}
                </Typography>
              </Detail>

              <Detail label="Location">
                {entry.location ? (
                  <Stack direction="row" alignItems="flex-start" spacing={0.75}>
                    <Box sx={{ display: "flex", pt: "3px", flexShrink: 0 }}>
                      {isLink ? (
                        <Video size={14} color={colors.dark[400]} />
                      ) : (
                        <Link2 size={14} color={colors.dark[400]} />
                      )}
                    </Box>
                    <Typography
                      variant="normalBody"
                      sx={{ color: colors.dark[200], overflowWrap: "anywhere", minWidth: 0 }}
                    >
                      {entry.location}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="normalBody" sx={{ color: colors.dark[400] }}>
                    No location set.
                  </Typography>
                )}
              </Detail>
            </Stack>
          </Card>

          <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={1.5}>
              <SectionLabel>Meeting record</SectionLabel>
              {entry.meetingId ? (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Box sx={{ display: "flex", pt: "3px" }}>
                      <FileText size={16} color={colors.green.dark} />
                    </Box>
                    <Typography variant="normalBody" sx={{ color: colors.dark[200] }}>
                      A meeting record is linked to this calendar entry.
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/meetings/${entry.meetingId}`}
                    sx={{ flexShrink: 0 }}
                  >
                    Open meeting
                  </Button>
                </Stack>
              ) : (
                <Typography variant="normalBody" sx={{ color: colors.dark[400] }}>
                  No meeting record is linked to this calendar entry.
                </Typography>
              )}
            </Stack>
          </Card>
        </Stack>

        <Card sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0, p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={1.75}>
            <Typography
              component="h2"
              variant="normalTitle"
              sx={{ color: colors.dark[100], fontWeight: fontWeight.semiBold }}
            >
              Participants
              <Typography component="span" variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                {` · ${entry.participants.length}`}
              </Typography>
            </Typography>
            {entry.participants.length > 0 ? (
              entry.participants.map((participant) => (
                <ParticipantRow key={participant.id} participant={participant} />
              ))
            ) : (
              <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
                No participants listed.
              </Typography>
            )}
          </Stack>
        </Card>
      </Stack>
    </>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="xSmallBody"
    sx={{ color: colors.dark[400], fontWeight: fontWeight.semiBold }}
  >
    {children}
  </Typography>
);

const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Stack spacing={0.75}>
    <SectionLabel>{label}</SectionLabel>
    {children}
  </Stack>
);
