import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { Bot } from "lucide-react";
import { useLoaderData } from "react-router";

import type { AgentSessionSummary } from "@/api/client";
import { AgentSessionCards } from "@/components/playground/CrmHubSections";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";

export const AgentSessionsPage = () => {
  const sessions = useLoaderData() as AgentSessionSummary[];
  const calls = sessions.filter((session) => session.channel === "call").length;

  return (
    <>
      <PageHeader
        title="Agent Sessions"
        description="Your Call and Chat conversations with the assistant. A session can be about a customer meeting, but it is never itself a customer touchpoint."
      />
      <Typography component="p" variant="smallBody" sx={{ color: colors.dark[400], mb: 2 }}>
        {sessions.length} {sessions.length === 1 ? "session" : "sessions"} · {calls}{" "}
        {calls === 1 ? "call" : "calls"} · {sessions.length - calls}{" "}
        {sessions.length - calls === 1 ? "chat" : "chats"}
      </Typography>
      {sessions.length === 0 ? (
        <EmptyState
          Icon={Bot}
          title="No agent sessions"
          description="No assistant conversations are available in this directory."
        />
      ) : (
        <AgentSessionCards sessions={sessions} showCompany />
      )}
    </>
  );
};
