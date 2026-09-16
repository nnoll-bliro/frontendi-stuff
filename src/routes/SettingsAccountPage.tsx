import { Box, Button, Stack, Typography } from "@mui/material";
import { Input } from "@bliro/ui/components/Input";
import { BliroSwitch } from "@bliro/ui/components/BliroSwitch";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import type { TranscriptionLanguageCode } from "@bliro/common-types/languages";
import dayjs from "dayjs";
import { AudioLines, Check, ExternalLink, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";

import type { Session } from "@/api/client";
import { DropDownSelect } from "@/components/DropDownSelect";
import { TranscriptionLanguageDropdown } from "@/components/LanguagePicker/TranscriptionLanguageDropdown";
import { Card } from "@/components/playground/Card";
import { SettingsField, SettingsSection } from "@/components/playground/SettingsSection";
import { StatusPill } from "@/components/playground/StatusPill";
import { ConfirmDialog } from "@/components/Reusable/ConfirmDialog";
import {
  DEFAULT_ACCOUNT_SETTINGS,
  PHONE_ASSISTANT,
  PINNED_LANGUAGES,
  TIMEZONES,
  VOICE_ID,
  type AccountSettings,
} from "@/mocks/account";
import { FeatureFlagKey, useFeatureFlag } from "@/mocks/featureFlags";

const HELP_CENTER_URL = "https://help.bliro.io";

const TIMEZONE_ITEMS = TIMEZONES.map((zone) => ({ label: zone, value: zone }));

/** "Niko Noll" -> ["Niko", "Noll"]; the session stores one display name. */
function splitName(name: string): [first: string, last: string] {
  const parts = name.trim().split(/\s+/);
  return [parts[0] ?? "", parts.slice(1).join(" ")];
}

export const SettingsAccountPage = () => {
  const { user } = useLoaderData() as Session;
  const [first, last] = splitName(user.name);

  // Only the name comes from the database — everything below is local mock
  // state, which is why the save button resolves instantly.
  const initial: AccountSettings = {
    firstName: first,
    lastName: last,
    ...DEFAULT_ACCOUNT_SETTINGS,
  };

  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(false);

  const phoneAssistantEnabled = useFeatureFlag(FeatureFlagKey.WebPhoneAgent);
  const voiceIdEnabled = useFeatureFlag(FeatureFlagKey.VoiceID);

  const [assistantOn, setAssistantOn] = useState(PHONE_ASSISTANT.enabled);
  const [voiceEnrolled, setVoiceEnrolled] = useState(VOICE_ID.enrolled);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDirty = (Object.keys(initial) as (keyof AccountSettings)[]).some(
    (key) => settings[key] !== initial[key],
  );

  const update = <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h3">My Account</Typography>
          <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
            Manage your personal details and preferences
          </Typography>
        </Stack>
        <Button
          variant="text"
          component="a"
          href={HELP_CENTER_URL}
          target="_blank"
          rel="noreferrer"
          endIcon={<ExternalLink size={14} />}
          sx={{ flexShrink: 0 }}
        >
          Go to Help Center
        </Button>
      </Stack>

      <Stack spacing={2.5}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Input
                  label="First Name"
                  value={settings.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Input
                  label="Last Name"
                  value={settings.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                />
              </Box>
            </Stack>

            <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <TranscriptionLanguageDropdown
                  label="Primary Conversation Language"
                  value={settings.primaryLanguage}
                  placeholder="Select a language"
                  pinnedLanguageCodes={PINNED_LANGUAGES}
                  // Excluding the other selection keeps the two pickers from
                  // resolving to the same language — same guard the real
                  // Settings/Profile applies.
                  excludeLanguageCodes={[settings.secondaryLanguage]}
                  onChange={(code: TranscriptionLanguageCode) => update("primaryLanguage", code)}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <TranscriptionLanguageDropdown
                  label="Secondary Conversation Language"
                  value={settings.secondaryLanguage}
                  placeholder="Select a language"
                  pinnedLanguageCodes={PINNED_LANGUAGES}
                  excludeLanguageCodes={[settings.primaryLanguage]}
                  onChange={(code: TranscriptionLanguageCode) => update("secondaryLanguage", code)}
                />
              </Box>
            </Stack>

            <SettingsField label="Timezone">
              <Box>
                <DropDownSelect
                  id="timezone"
                  value={{ label: settings.timezone, value: settings.timezone }}
                  items={TIMEZONE_ITEMS}
                  setValue={(item) => update("timezone", item.value)}
                />
              </Box>
            </SettingsField>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ mt: 0.5 }}
            >
              {saved && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Check size={14} color={colors.green.dark} />
                  <Typography variant="xSmallBody" sx={{ color: colors.green.dark }}>
                    Saved
                  </Typography>
                </Stack>
              )}
              <Button
                variant="outlined"
                color="secondary"
                disabled={!isDirty}
                onClick={() => {
                  setSettings(initial);
                  setSaved(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!isDirty}
                onClick={() => setSaved(true)}
                // Nothing is persisted — the mock state already holds the edit,
                // so this only acknowledges it.
              >
                Save changes
              </Button>
            </Stack>
          </Stack>
        </Card>

        {phoneAssistantEnabled && (
          <SettingsSection
            title="Bliro Phone Assistant"
            description="Manage your personal phone assistant."
            action={
              <BliroSwitch
                checked={assistantOn}
                onChange={(_, value) => setAssistantOn(value)}
                inputProps={{ "aria-label": "Enable the Bliro Phone Assistant" }}
              />
            }
          >
            {assistantOn ? (
              <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                  <Phone size={16} color={colors.dark[400]} />
                  <Stack>
                    <Typography
                      variant="smallBody"
                      sx={{ color: colors.dark[100], fontWeight: fontWeight.medium }}
                    >
                      {PHONE_ASSISTANT.number}
                    </Typography>
                    <Typography variant="xxSmallBody" sx={{ color: colors.dark[400] }}>
                      Your assistant answers on this number.
                    </Typography>
                  </Stack>
                </Stack>
                <StatusPill
                  label={PHONE_ASSISTANT.forwardingConfigured ? "Forwarding active" : "Setup needed"}
                  color={
                    PHONE_ASSISTANT.forwardingConfigured ? colors.green.dark : colors.yellow.dark
                  }
                  background={
                    PHONE_ASSISTANT.forwardingConfigured ? colors.green[600] : colors.yellow[600]
                  }
                />
                <Button variant="outlined" color="secondary">
                  Configure
                </Button>
              </Stack>
            ) : (
              <Typography variant="smallBody" sx={{ color: colors.dark[400] }}>
                Turn the assistant on to get a number that answers calls for you.
              </Typography>
            )}
          </SettingsSection>
        )}

        {voiceIdEnabled && (
          <SettingsSection
            title="VoiceID"
            description="With VoiceID, Bliro learns your voice and identifies your voice among other speakers in a meeting."
          >
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <AudioLines size={16} color={voiceEnrolled ? colors.green.dark : colors.dark[400]} />
                <Typography variant="smallBody" sx={{ color: colors.dark[200] }}>
                  {voiceEnrolled
                    ? `Voice profile recorded ${dayjs(VOICE_ID.enrolledAt).format("D MMM YYYY")} · ${VOICE_ID.sampleSeconds}s sample`
                    : "No voice profile yet."}
                </Typography>
              </Stack>
              {voiceEnrolled ? (
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" color="secondary">
                    Re-record
                  </Button>
                  <Button variant="text" color="error" onClick={() => setVoiceEnrolled(false)}>
                    Delete profile
                  </Button>
                </Stack>
              ) : (
                <Button variant="contained" onClick={() => setVoiceEnrolled(true)}>
                  Set up VoiceID
                </Button>
              )}
            </Stack>
          </SettingsSection>
        )}

        <SettingsSection
          destructive
          title="Delete your Bliro account"
          description="This action is permanent and all of your meeting notes will be lost."
          action={
            <Button
              variant="contained"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => setDeleteOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              Delete account
            </Button>
          }
        />
      </Stack>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your Bliro account?"
        message={`This permanently deletes ${user.email}, every meeting you own and all of their notes. It cannot be undone.`}
        acknowledgmentLabel="I understand that my meeting notes will be lost."
        confirmButtonText="Delete account"
        cancelButtonText="Cancel"
        confirmButtonColor="error"
        maxWidth="sm"
        onCancel={() => setDeleteOpen(false)}
        // A mockup should not pretend to destroy the seeded data other pages read.
        onConfirm={() => setDeleteOpen(false)}
      />
    </>
  );
};
