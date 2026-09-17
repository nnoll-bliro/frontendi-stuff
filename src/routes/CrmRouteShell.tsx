import { Button, Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { ArrowLeft, Bot, Building2, ContactRound } from "lucide-react";
import { Link, useParams } from "react-router";

import { Card } from "@/components/playground/Card";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";

const SECTIONS = {
  companies: {
    title: "Companies",
    record: "Company",
    description: "Customer organizations and their relationship history.",
    Icon: Building2,
    sections: ["Overview", "People", "Meetings", "Agent Sessions", "Knowledge", "Analysis"],
  },
  people: {
    title: "People",
    record: "Person",
    description: "Customer contacts, separate from your internal Team members.",
    Icon: ContactRound,
    sections: ["Overview", "Company", "Meetings", "Agent Sessions", "Knowledge", "Analysis"],
  },
  "agent-sessions": {
    title: "Agent Sessions",
    record: "Agent Session",
    description: "Call or chat conversations with the assistant, not customer meetings.",
    Icon: Bot,
    sections: ["Overview", "Conversation", "Company / People", "Related Meeting"],
  },
};

/** Navigation-only shells; shared records and loaders arrive with the model ticket. */
export const CrmRouteShell = ({ section }: { section: keyof typeof SECTIONS }) => {
  const { id } = useParams();
  const config = SECTIONS[section];

  return (
    <>
      {id && (
        <Button component={Link} to={`/${section}`} startIcon={<ArrowLeft size={16} />} sx={{ mb: 2 }}>
          Back to {config.title}
        </Button>
      )}
      <PageHeader
        title={id ? `${config.record} details` : config.title}
        description={config.description}
      />
      {id ? (
        <Stack spacing={2}>
          <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
            Prototype route shell · Record ID: {id}. Record data is not connected yet.
          </Typography>
          {config.sections.map((title) => (
            <Card key={title} sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h4">{title}</Typography>
                <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
                  {title === "Analysis"
                    ? "Future capability — analysis is not available in this prototype."
                    : "Read-only example content will appear here once shared records are connected."}
                </Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        <EmptyState
          Icon={config.Icon}
          title={`${config.title} directory — coming next`}
          description="Navigation shell only. Connected, read-only examples will be added with the shared concept model."
        />
      )}
    </>
  );
};
