import { Box, Button, Stack, Typography } from "@mui/material";
import { Avatar } from "@bliro/ui/components/Avatar";
import { PageHeader } from "@bliro/ui/components/PageHeader";
import { SectionHeader } from "@bliro/ui/components/SectionHeader";
import { Surface, SurfaceList } from "@bliro/ui/components/Surface";
import { tokens } from "@bliro/ui/theme/tokens";
import { BliroCheckBox } from "@bliro/ui/components/BliroCheckBox";
import { BliroSwitch } from "@bliro/ui/components/BliroSwitch";
import { Input } from "@bliro/ui/components/Input";
import { SquareIconButton } from "@bliro/ui/components/SquareIconButton";
import { IconColor } from "@bliro/common-types/icon/IconColor";
import { Icon } from "@/components/Icon";
import { PanelWarning } from "@/components/PanelWarning";
import { Divider } from "@/components/Reusable/Divider";
import { LoadingIcon } from "@/components/Reusable/LoadingIcon";
import { WarningBanner } from "@/components/Reusable/WarningBanner/WarningBanner";
import { TabItem } from "@/components/TabItem/TabItem";
import { CustomIcon } from "@/components/utils/CustomIcon";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Calendar, Home, Search, Settings, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

/**
 * Live reference for the design system, kept as its own route at
 * `/design-system`. The mock product pages are the ones next to this file.
 */
export const DesignSystemPage = () => {
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Home");

  return (
    <Box>
      <Stack spacing={tokens.spacing.section}>
        <PageHeader title="Design system" eyebrow="Bliro foundations" description="Clear hierarchy. Useful space. Color with purpose. Shared patterns for a focused B2B workspace." />

        <Section title="Product patterns">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
            <Surface sx={{ p: tokens.space.lg }}>
              <Stack spacing={tokens.spacing.md}>
                <SectionHeader component="h3" title="One surface, one purpose" description="Use a quiet border, not a shadow, to group related information." />
                <Typography variant="smallBody">28px page titles · 16px section headings · 14px body text. Keep large display typography for marketing, not record pages.</Typography>
                <Typography variant="smallBody">Orange signals selection and primary actions. Neutral links and secondary controls keep the content in focus.</Typography>
              </Stack>
            </Surface>
            <Stack spacing={tokens.spacing.md}>
              <SectionHeader component="h3" title="Grouped records" count={2} description="Use dividers for repeated records, not a stack of floating cards." />
              <SurfaceList>
                {["Customer relationship", "Meeting and call history"].map((label) => (
                  <Surface key={label} sx={{ p: tokens.space.md }}>
                    <Typography variant="smallTitle" sx={{ fontWeight: 600 }}>{label}</Typography>
                    <Typography component="p" variant="xSmallBody">A clear title, then supporting context.</Typography>
                  </Surface>
                ))}
              </SurfaceList>
            </Stack>
          </Box>
        </Section>

        <Section title="Spacing">
          <Stack direction="row" spacing={tokens.spacing.lg} flexWrap="wrap" useFlexGap>
            {Object.entries(tokens.space).map(([name, value]) => (
              <Stack key={name} spacing={tokens.spacing.sm} sx={{ minWidth: 64 }}>
                <Box sx={{ width: value, height: 24, borderRadius: "2px", backgroundColor: colors.orange[400] }} />
                <Typography variant="xSmallBody">{name} · {value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Section>

        <Section title="Colors">
          <Stack spacing={tokens.spacing.md}>
            {Object.entries(colors).map(([name, ramp]) => (
              <Stack key={name} direction="row" spacing={tokens.spacing.sm} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="xSmallBody"
                  sx={{ width: 64, color: colors.dark[400], fontWeight: fontWeight["medium"] }}
                >
                  {name}
                </Typography>
                {Object.entries(ramp).map(([shade, value]) => (
                  <Box
                    key={shade}
                    title={`colors.${name}[${shade}] · ${value}`}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "8px",
                      backgroundColor: value,
                      border: `1px solid ${colors.dark[700]}`,
                    }}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        </Section>

        <Section title="Typography">
          <Stack spacing={tokens.spacing.sm}>
            {(["pageTitle", "sectionTitle", "eyebrow", "normalTitle", "normalBody", "xSmallBody"] as const).map(
              (variant) => (
                <Typography key={variant} variant={variant}>
                  {variant} — The quick brown fox
                </Typography>
              ),
            )}
          </Stack>
        </Section>

        <Section title="Buttons">
          <Stack direction="row" spacing={tokens.spacing.md} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
            <Button variant="contained" color="error">
              Destructive
            </Button>
            <Button variant="contained" startIcon={<Sparkles size={16} />}>
              With icon
            </Button>
            <SquareIconButton border onClick={() => undefined} aria-label="Delete">
              <Trash2 size={16} color={colors.dark[300]} />
            </SquareIconButton>
          </Stack>
        </Section>

        <Section title="Icons">
          <Stack spacing={tokens.spacing.md}>
            <Stack direction="row" spacing={tokens.spacing.md} alignItems="center">
              {(["calendar", "users", "phone", "mail", "star", "zap"] as const).map((name) => (
                <Icon key={name} name={name} color={IconColor.Black} size={24} />
              ))}
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                Icon — the 600+ name registry from common-types
              </Typography>
            </Stack>
            <Stack direction="row" spacing={tokens.spacing.md} alignItems="center">
              {(
                [
                  "GoogleCalendarIcon",
                  "MicrosoftLogo",
                  "HubspotIcon",
                  "SalesforceIcon",
                  "SlackIcon",
                  "TeamsIcon",
                ] as const
              ).map((icon) => (
                <CustomIcon key={icon} icon={icon} width={24} height={24} />
              ))}
              <Typography variant="xSmallBody" sx={{ color: colors.dark[400] }}>
                CustomIcon — brand and integration logos
              </Typography>
            </Stack>
          </Stack>
        </Section>

        <Section title="Form controls">
          <Stack direction="row" spacing={tokens.spacing.lg} alignItems="flex-end" flexWrap="wrap" useFlexGap>
            <Input
              label="Search"
              placeholder="Type to search…"
              startIcon={<Search size={16} color={colors.dark[400]} />}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              wrapperProps={{ sx: { width: 280, maxWidth: "100%" } }}
            />
            <BliroCheckBox checked={checked} onChange={setChecked} aria-label="Toggle checkbox" />
            <BliroSwitch
              checked={enabled}
              onChange={(_, value) => setEnabled(value)}
              inputProps={{ "aria-label": "Toggle switch" }}
            />
            <Avatar title="NN" tooltip="Niko Noll" />
          </Stack>
        </Section>

        <Section title="App components">
          <Stack spacing={tokens.spacing.lg}>
            <Stack direction="row" spacing={tokens.spacing.sm}>
              {[
                { title: "Home", icon: Home },
                { title: "Calendar", icon: Calendar },
                { title: "Settings", icon: Settings },
              ].map(({ title, icon }) => (
                <TabItem
                  key={title}
                  title={title}
                  Icon={icon}
                  isActive={tab === title}
                  onClick={() => setTab(title)}
                />
              ))}
            </Stack>
            <Divider dir="horizontal" />
            <WarningBanner message="Your org policy blocks recording for this meeting." />
            <PanelWarning
              title="Nothing to show yet"
              description="Meetings will appear here once Bliro has joined one."
            />
            <LoadingIcon />
          </Stack>
        </Section>
      </Stack>
    </Box>
  );
};

interface ISectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: ISectionProps) => (
  <Stack spacing={tokens.spacing.md}>
    <SectionHeader title={title} />
    {children}
  </Stack>
);
