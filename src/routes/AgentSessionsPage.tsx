import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
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
        description="Your calls and chats with the assistant, separate from customer meetings."
      />
      <Typography component="p" variant="smallBody" sx={{ color: colors.dark[400], mb: tokens.space.md }}>
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
