import { Box, Stack, Typography } from "@mui/material";
import { useMemo } from "react";

import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/fonts";
import { getAvatarTitle, getParticipantName } from "../../utils";
import { Avatar } from "../Avatar";
import { MarqueeWrapper } from "../MarqueeWrapper";

import styles from "./Participants.module.css";

export interface ISalesforceIds {
  integrationId?: string | null;
  id?: string | null;
  accountId?: string | null;
}

export interface IHubspotIds {
  integrationId?: string | null;
  id?: string | null;
  accountId?: string | null;
}

export interface IExternalIds {
  // googleCalendar?: string | null;
  // slack?: string | null;
  salesforce?: ISalesforceIds | null;
  hubspot?: IHubspotIds | null;
}

export type IOwnerType = "user" | "org";

export interface IParticipantPreview {
  participantId?: string;
  ownerType?: IOwnerType;
  ownerId?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  externalIds?: IExternalIds | null; // external id of the participant (e.g. salesforce id)
  type?: "user" | "lead" | "contact" | "attendee" | null;
}
interface IParticipantsProps {
  title: string;
  participants: IParticipantPreview[] | undefined;
  limit?: number;
  isAvatar?: boolean;
  variant?: "primary" | "secondary";
  size?: "small" | "medium";
}

const LIMIT = 10;

export const Participants = ({
  title,
  participants,
  isAvatar = false,
  limit = LIMIT,
  size = "medium",
  variant = "primary",
}: IParticipantsProps) => {
  const extraNames = useMemo(() => {
    if (participants && participants?.length <= limit) return "";

    const extraNames = participants
      ?.slice(limit, participants.length)
      .map((participant) => participant.name || participant.email || participant.phoneNumber);
    return extraNames ? extraNames?.join(",") : "";
    // TODO: auto fixed - please try to fix
    // oxlint-disable-next-line react/exhaustive-deps
  }, [participants]);

  return (
    <Stack direction="column" gap={0.5}>
      <Typography variant="smallBody" color={colors.dark[500]}>
        {title}
      </Typography>
      {(participants && participants.length >= limit) || (participants && isAvatar) ? (
        <Stack direction="row">
          {participants.slice(0, limit).map((participant, idx) => {
            const participantIdentifier = participant.email || participant.phoneNumber;
            return (
              <Avatar
                key={idx}
                size={size}
                variant={variant}
                title={getAvatarTitle(participant.name, participantIdentifier)}
                tooltip={participant.name || participantIdentifier || "Unknown Participant"}
                overlapped={idx !== 0}
              />
            );
          })}
          {participants.length > limit && (
            <Avatar
              size={size}
              variant={variant}
              isTextTooltip={false}
              title={`+${participants.length - limit}`}
              tooltip={extraNames}
              overlapped
            />
          )}
        </Stack>
      ) : (
        <>
          {participants?.map((participant, idx) => {
            const participantIdentifier = participant.email || participant.phoneNumber;
            const participantName = getParticipantName(participant.name, participantIdentifier);
            // const participantName = "asdfjlasdfjaskldfjaskldfasdf";
            // const participantIdentifier = "asdfasdfasdfasdfasdfasdf";

            return (
              <Box key={idx} className={styles.item}>
                <MarqueeWrapper
                  maxLen={35}
                  textLen={participantName.length + (participantIdentifier?.length || 0)}
                >
                  <Box sx={{ mr: "6px", overflow: "hidden" }}>
                    <Typography
                      variant="smallBody"
                      component="span"
                      color={colors.dark[200]}
                      fontWeight={fontWeight.semiBold}
                    >
                      {participantName}
                    </Typography>
                    <Typography
                      variant="xSmallBody"
                      component="span"
                      color={colors.dark[400]}
                      ml={0.5}
                    >
                      ({participantIdentifier})
                    </Typography>
                  </Box>
                </MarqueeWrapper>
              </Box>
            );
          })}
        </>
      )}
    </Stack>
  );
};
