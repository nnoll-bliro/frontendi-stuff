import { Stack, Tooltip, Typography } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { colors } from "@bliro/ui/theme/colors";
import { Crown } from "lucide-react";

import type { CalendarParticipant } from "@/api/client";
import { initials, RSVP_TONE } from "@/utils/format";

import { StatusPill } from "./StatusPill";

interface ParticipantRowProps {
  participant: CalendarParticipant;
}

/** Colleagues render in the primary avatar variant, external guests secondary. */
export const ParticipantRow = ({ participant }: ParticipantRowProps) => {
  const tone = RSVP_TONE[participant.response];
  const isInternal = participant.userId !== null;

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar
        title={initials(participant.name)}
        tooltip={participant.email}
        variant={isInternal ? "primary" : "secondary"}
        size="small"
      />
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="smallBody" noWrap sx={{ color: colors.dark[100] }}>
            {participant.name}
          </Typography>
          {participant.isOrganizer && (
            <Tooltip title="Organiser">
              <Crown size={12} color={colors.yellow[100]} />
            </Tooltip>
          )}
        </Stack>
        <Typography variant="xxSmallBody" noWrap sx={{ color: colors.dark[400] }}>
          {participant.company ?? participant.email}
        </Typography>
      </Stack>
      <StatusPill label={tone.label} color={tone.color} background={tone.background} />
    </Stack>
  );
};
