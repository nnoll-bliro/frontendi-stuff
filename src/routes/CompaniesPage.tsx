import { Stack, Typography } from "@mui/material";
import { colors } from "@bliro/ui/theme/colors";
import { Building2 } from "lucide-react";
import { useLoaderData } from "react-router";

import type { CompanySummary } from "@/api/client";
import { Card } from "@/components/playground/Card";
import { ContextText, RecordLink } from "@/components/playground/CrmHubSections";
import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";

export const CompaniesPage = () => {
  const companies = useLoaderData() as CompanySummary[];

  return (
    <>
      <PageHeader
        title="Companies"
        description="Customer and prospect organizations, their people, and relationship history. Read-only examples."
      />
      <Typography component="p" variant="smallBody" sx={{ color: colors.dark[400], mb: 2 }}>
        {companies.length} {companies.length === 1 ? "company" : "companies"}
      </Typography>
      {companies.length === 0 ? (
        <EmptyState
          Icon={Building2}
          title="No companies"
          description="No company examples are available in this directory."
        />
      ) : (
        <Stack spacing={1.5}>
          {companies.map((company) => (
            <Card key={company.id} sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Building2
                  size={20}
                  color={colors.dark[400]}
                  style={{ flexShrink: 0 }}
                  aria-hidden="true"
                />
                <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                  <RecordLink to={`/companies/${company.id}`}>{company.name}</RecordLink>
                  <Typography
                    variant="xSmallBody"
                    sx={{ color: colors.dark[400], overflowWrap: "anywhere" }}
                  >
                    {company.domain}
                  </Typography>
                  <ContextText>{company.overview}</ContextText>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
};
