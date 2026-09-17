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
      <Box sx={{ mb: 2 }}>
        <BackButton onClick={() => navigate("/calendar")} />
      </Box>

      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h3">{entry.title}</Typography>
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

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Stack sx={{ flex: 1, minWidth: 0 }} spacing={2}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Description
                </Typography>
                <Typography variant="normalBody" sx={{ color: colors.dark[200] }}>
                  {entry.description ?? "No description on this invite."}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                  Location
                </Typography>
                {entry.location ? (
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {isLink ? (
                      <Video size={14} color={colors.dark[400]} />
                    ) : (
                      <Link2 size={14} color={colors.dark[400]} />
                    )}
                    <Typography
                      variant="normalBody"
                      sx={{ color: colors.dark[200], wordBreak: "break-all" }}
                    >
                      {entry.location}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="normalBody" sx={{ color: colors.dark[400] }}>
                    No location set.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                Meeting record
              </Typography>
              {entry.meetingId ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FileText size={16} color={colors.green.dark} />
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

        <Card sx={{ width: 300, flexShrink: 0, p: 2 }}>
          <Stack spacing={1.5}>
            <Typography
              variant="xSmallBody"
              sx={{ color: colors.dark[400], fontWeight: fontWeight.medium }}
            >
              {entry.participants.length} participants
            </Typography>
            {entry.participants.map((participant) => (
              <ParticipantRow key={participant.id} participant={participant} />
            ))}
          </Stack>
        </Card>
      </Stack>
    </>
  );
};
