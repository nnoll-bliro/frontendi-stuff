import { Box, Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { focusRing } from "@bliro/ui/theme/tokens";
import { fontWeight } from "@bliro/ui/theme/fonts";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Clock,
  type LucideIcon,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";

import { api, type CalendarEntry, type CalendarRange as Range } from "@/api/client";
import { Card } from "@/components/playground/Card";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";
import { StatusPill } from "@/components/playground/StatusPill";
import { CustomIcon } from "@/components/utils/CustomIcon";
import { TabItem } from "@/components/TabItem/TabItem";
import { formatDayLabel, formatDuration, formatTime } from "@/utils/format";

const RANGES = [
  { value: "upcoming", label: "Upcoming", Icon: CalendarClock },
  { value: "past", label: "Past", Icon: CalendarDays },
  { value: "all", label: "All", Icon: CalendarRange },
] as const satisfies readonly { value: Range; label: string; Icon: LucideIcon }[];

export const CalendarPage = () => {
  const initial = useLoaderData() as CalendarEntry[];
  const [searchParams, setSearchParams] = useSearchParams();

  const range = (searchParams.get("range") ?? "upcoming") as Range;
  const [entries, setEntries] = useState(initial);

  useEffect(() => {
    const controller = new AbortController();
    api
      .calendar(range, controller.signal)
      .then(setEntries)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error(error);
      });
    return () => controller.abort();
  }, [range]);

  const days = groupByDay(entries);

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Calendar entries from Google and Microsoft, with linked meeting records when available."
      />

      <Box component="nav" aria-label="Calendar range" sx={{ mb: 3, overflowX: "auto" }}>
        <Stack direction="row" spacing={1} sx={{ minWidth: "max-content" }}>
          {RANGES.map((option) => (
            <TabItem
              key={option.value}
              title={option.label}
              Icon={option.Icon}
              isActive={range === option.value}
              onClick={() =>
                setSearchParams((params) => {
                  params.set("range", option.value);
                  return params;
                })
              }
            />
          ))}
        </Stack>
      </Box>

      {days.length === 0 ? (
        <EmptyState
          Icon={CalendarDays}
          title="Nothing here"
          description="No calendar entries in this range."
        />
      ) : (
        <Stack spacing={{ xs: 3, md: 4 }}>
          {days.map(([day, dayEntries]) => (
            <Stack key={day} spacing={1.25}>
              <Typography
                variant="xSmallBody"
                sx={{ color: colors.dark[400], fontWeight: fontWeight.semiBold }}
              >
                {day}
              </Typography>
              {dayEntries.map((entry) => (
                <Card key={entry.id} interactive>
                  <Box
                    component={Link}
                    to={`/calendar/${entry.id}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "52px 3px minmax(0, 1fr)",
                        sm: "64px 3px minmax(0, 1fr) auto",
                      },
                      gap: { xs: 1.5, sm: 2 },
                      alignItems: "center",
                      p: { xs: 2, sm: 2.5 },
                      color: "inherit",
                      textDecoration: "none",
                      borderRadius: "inherit",
                      "&:focus-visible": focusRing,
                    }}
                  >
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography
                        variant="normalTitle"
                        sx={{ color: colors.dark[100], fontWeight: fontWeight.semiBold }}
                      >
                        {formatTime(entry.startsAt)}
                      </Typography>
                      <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                        {formatDuration(entry.durationMinutes)}
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        width: 3,
                        alignSelf: "stretch",
                        gridRow: { xs: "1 / span 2", sm: "auto" },
                        borderRadius: "2px",
                        backgroundColor: entry.isExternal ? colors.orange[100] : colors.blue[300],
                      }}
                    />

                    <Stack sx={{ minWidth: 0 }} spacing={0.5}>
                      <Typography
                        variant="normalTitle"
                        noWrap
                        sx={{ color: colors.dark[100], fontWeight: fontWeight.medium }}
                      >
                        {entry.title}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <CustomIcon
                          icon={entry.provider === "google" ? "GoogleCalendarIcon" : "OutlookIcon"}
                          width={13}
                          height={13}
                        />
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Users size={13} color={colors.dark[400]} />
                          <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                            {entry.participants.length}
                          </Typography>
                        </Stack>
                        <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                          {entry.isExternal ? "External" : "Internal"}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Box sx={{ gridColumn: { xs: "3", sm: "auto" }, justifySelf: "start" }}>
                      {entry.meetingId ? (
                        <StatusPill
                          label="Meeting record"
                          color={colors.green.dark}
                          background={colors.green[600]}
                        />
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Clock size={13} color={colors.dark[500]} />
                          <Typography variant="xxSmallBody" sx={{ color: colors.dark[500] }}>
                            No meeting record
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
};

/** Entries arrive already ordered, so grouping preserves the API's sort. */
function groupByDay(entries: CalendarEntry[]): [string, CalendarEntry[]][] {
  const days = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    const label = formatDayLabel(entry.startsAt);
    const bucket = days.get(label);
    if (bucket) bucket.push(entry);
    else days.set(label, [entry]);
  }
  return [...days.entries()];
}
