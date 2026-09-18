import { Box, Stack, Typography } from "@mui/material";
import { SurfaceList } from "@bliro/ui/components/Surface";
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
      <PageHeader title="Companies" description="Your customers, prospects, and the relationships behind them." />
      <Typography component="p" variant="xSmallBody" sx={{ mb: 2 }}>
        {companies.length} {companies.length === 1 ? "company" : "companies"}
      </Typography>
      {companies.length === 0 ? (
        <EmptyState Icon={Building2} title="No companies" description="No company examples are available in this directory." />
      ) : (
        <SurfaceList>
          <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "minmax(240px, 0.85fr) 1.3fr", gap: 4, px: 3, py: 1.5, borderBottom: `1px solid ${colors.dark[700]}` }}>
            <Typography variant="eyebrow">Company</Typography>
            <Typography variant="eyebrow">Relationship overview</Typography>
          </Box>
          {companies.map((company) => (
            <Card key={company.id} sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 0.85fr) 1.3fr" }, alignItems: "center", gap: { xs: 2, md: 4 } }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 40, height: 40, display: "grid", placeItems: "center", flexShrink: 0, border: `1px solid ${colors.dark[700]}`, borderRadius: "8px", backgroundColor: "white" }}>
                  <Building2 size={18} color={colors.dark[400]} aria-hidden="true" />
                </Box>
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <RecordLink to={`/companies/${company.id}`} primary>{company.name}</RecordLink>
                  <Typography variant="xSmallBody" sx={{ overflowWrap: "anywhere" }}>{company.domain}</Typography>
                </Stack>
              </Stack>
              <ContextText>{company.overview}</ContextText>
            </Card>
          ))}
        </SurfaceList>
      )}
    </>
  );
};
