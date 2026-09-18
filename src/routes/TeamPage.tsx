import { Box, Stack, Typography } from "@mui/material";
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
      <PageHeader
        title="Team"
        description={`Members and calendar connections for ${org.name}.`}
      />

      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            columnGap: 3,
            rowGap: 2.5,
          }}
        >
          <Fact label="Organisation" value={org.name} />
          <Fact label="Domain" value={org.domain} />
          <Fact label="Plan" value={org.plan[0].toUpperCase() + org.plan.slice(1)} />
          <Fact label="Members" value={String(users.length)} />
          <Fact label="Customer since" value={formatDate(org.createdAt)} />
        </Box>
      </Card>

      <Stack spacing={1.5}>
        {users.map((user) => {
          const tone = ROLE_TONE[user.role];
          return (
            <Card key={user.id} sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "auto minmax(0, 1fr) auto",
                    md: "auto minmax(180px, 1fr) auto auto",
                  },
                  alignItems: "center",
                  columnGap: { xs: 1.25, sm: 2 },
                  rowGap: 1.25,
                }}
              >
                <Avatar title={initials(user.name)} tooltip={user.email} />

                <Stack sx={{ minWidth: 0 }} spacing={0.125}>
                  <Typography
                    variant="normalTitle"
                    noWrap
                    sx={{ color: colors.dark[100], fontWeight: fontWeight.medium }}
                  >
                    {user.name}
                  </Typography>
                  <Typography variant="xxSmallBody" noWrap sx={{ color: colors.dark[400] }}>
                    {user.jobTitle ?? "No job title"}
                  </Typography>
                  <Typography variant="xxSmallBody" noWrap sx={{ color: colors.dark[400] }}>
                    {user.email}
                  </Typography>
                </Stack>

                <Box sx={{ display: { xs: "block", md: "none" }, justifySelf: "end" }}>
                  <StatusPill
                    label={user.role[0].toUpperCase() + user.role.slice(1)}
                    color={tone.color}
                    background={tone.background}
                  />
                </Box>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{
                    gridColumn: { xs: "2 / -1", md: "auto" },
                    minWidth: 0,
                    justifySelf: { xs: "start", md: "end" },
                  }}
                >
                  {user.provider ? (
                    <>
                      <CustomIcon
                        icon={user.provider === "google" ? "GoogleCalendarIcon" : "MicrosoftLogo"}
                        width={14}
                        height={14}
                      />
                      <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                        Calendar connected
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="xxSmallBody" sx={{ color: colors.yellow.dark }}>
                      No calendar connected
                    </Typography>
                  )}
                </Stack>

                <Box sx={{ display: { xs: "none", md: "block" }, justifySelf: "end" }}>
                  <StatusPill
                    label={user.role[0].toUpperCase() + user.role.slice(1)}
                    color={tone.color}
                    background={tone.background}
                  />
                </Box>
              </Box>
            </Card>
          );
        })}
      </Stack>
    </>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0.375} sx={{ minWidth: 0 }}>
    <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
      {label}
    </Typography>
    <Typography
      variant="normalTitle"
      sx={{ color: colors.dark[100], overflowWrap: "anywhere" }}
    >
      {value}
    </Typography>
  </Stack>
);
