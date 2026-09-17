import { Button, Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { ArrowLeft, Bot } from "lucide-react";
import { Link, useLoaderData, useParams } from "react-router";

import type { AgentSession, AgentSessionSummary } from "@/api/client";

import { Card } from "@/components/playground/Card";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";

const SECTIONS = {
  "agent-sessions": {
    title: "Agent Sessions",
    record: "Agent Session",
    description: "Call or chat conversations with the assistant, not customer meetings.",
    Icon: Bot,
    sections: ["Overview", "Conversation", "Company / People", "Related Meeting"],
  },
};

/** Remaining Agent Sessions shell; full list/detail layouts arrive in ticket 6. */
export const CrmRouteShell = ({ section }: { section: keyof typeof SECTIONS }) => {
  const { id } = useParams();
  const config = SECTIONS[section];
  const data = useLoaderData() as AgentSession | AgentSessionSummary[];
  const record = Array.isArray(data) ? null : data;
  const title = record?.title ?? config.title;

  return (
    <>
      {id && (
        <Button
          component={Link}
          to={`/${section}`}
          startIcon={<ArrowLeft size={16} />}
          sx={{ mb: 2 }}
        >
          Back to {config.title}
        </Button>
      )}
      <PageHeader title={title} description={config.description} />
      {id ? (
        <Stack spacing={2}>
          <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
            Read-only prototype · {config.record} ID: {id}. Shared record loaded; full layout coming
            next.
          </Typography>
          {config.sections.map((title) => (
            <Card key={title} sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h4">{title}</Typography>
                <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
                  {title === "Overview"
                    ? record?.overview
                    : title === "Analysis"
                      ? "Future capability — analysis is not available in this prototype."
                      : "Connected data is available; this section's layout will be added in a later ticket."}
                </Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        <EmptyState
          Icon={config.Icon}
          title={`${config.title} directory — coming next`}
          description={`${Array.isArray(data) ? data.length : 0} read-only records loaded from SQLite. Directory layout is coming in a later ticket.`}
        />
      )}
    </>
  );
};
