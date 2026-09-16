import { Stack, Typography } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { useLoaderData } from "react-router";

import type { Session, User } from "@/api/client";
import { Card } from "@/components/playground/Card";
import { PageHeader } from "@/components/playground/PageHeader";
import { StatusPill } from "@/components/playground/StatusPill";
import { CustomIcon } from "@/components/utils/CustomIcon";
import { formatDate, initials } from "@/utils/format";

export interface TeamData {
  session: Session;
  users: User[];
}

const ROLE_TONE = {
  owner: { color: colors.orange.dark, background: colors.orange[600] },
  admin: { color: colors.blue.dark, background: colors.blue[600] },
  member: { color: colors.dark[400], background: colors.dark[800] },
} as const;

export const TeamPage = () => {
  const { session, users } = useLoaderData() as TeamData;
  const { org } = session;

  return (
    <>
      <PageHeader title="Team" description={`${org.name} · ${org.domain}`} />

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
          <Fact label="Organisation" value={org.name} />
          <Fact label="Domain" value={org.domain} />
          <Fact label="Plan" value={org.plan.toUpperCase()} />
          <Fact label="Members" value={String(users.length)} />
          <Fact label="Customer since" value={formatDate(org.createdAt)} />
        </Stack>
      </Card>

      <Stack spacing={1.5}>
        {users.map((user) => {
          const tone = ROLE_TONE[user.role];
          return (
            <Card key={user.id} sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar title={initials(user.name)} tooltip={user.email} />
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="normalTitle"
                    noWrap
                    sx={{ color: colors.dark[100], fontWeight: fontWeight.medium }}
                  >
                    {user.name}
                  </Typography>
                  <Typography variant="xxSmallBody" noWrap sx={{ color: colors.dark[400] }}>
                    {user.jobTitle ?? "—"} · {user.email}
                  </Typography>
                </Stack>

                {user.provider ? (
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <CustomIcon
                      icon={user.provider === "google" ? "GoogleCalendarIcon" : "MicrosoftLogo"}
                      width={14}
                      height={14}
                    />
                    <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                      Calendar connected
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="xxSmallBody" sx={{ color: colors.yellow.dark }}>
                    No calendar connected
                  </Typography>
                )}

                <StatusPill
                  label={user.role[0].toUpperCase() + user.role.slice(1)}
                  color={tone.color}
                  background={tone.background}
                />
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </>
  );
};

// Stack, not Box: the theme's custom Typography variants fall outside MUI's
// variantMapping and render as inline <span>, so a plain Box runs the label and
// the value together on one line.
const Fact = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0.25}>
    <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
      {label}
    </Typography>
    <Typography variant="normalTitle" sx={{ color: colors.dark[100] }}>
      {value}
    </Typography>
  </Stack>
);
