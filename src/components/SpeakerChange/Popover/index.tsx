import { Input } from "@bliro/ui/components/Input";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, Button, Popover, Stack, Typography } from "@mui/material";
import { CheckIcon } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./Popover.module.css";

interface SpeakerChangePopoverProps {
  speaker: string;
  anchorEl: HTMLElement | null;
  onChangeSpeaker: (newSpeaker: string) => void;
  onClose: () => void;
}

export const SpeakerChangePopover = ({
  anchorEl,
  speaker,
  onChangeSpeaker,
  onClose,
}: SpeakerChangePopoverProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = Boolean(anchorEl);
  const [newSpeaker, setNewSpeaker] = useState(speaker);

  const handleUpdateNewSpeaker = (event: ChangeEvent<HTMLInputElement>) => {
    setNewSpeaker(event.target.value);
  };

  useEffect(() => {
    if (isOpen) {
      setNewSpeaker(speaker);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isOpen, speaker]);

  const isSpeakerChanged = speaker !== newSpeaker;

  const handleSaveSpeaker = () => {
    if (isSpeakerChanged) {
      onChangeSpeaker(newSpeaker);
      onClose();
    }
  };

  return (
    <Popover
      open={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      className={styles.popover}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Stack direction="row" gap={1} alignItems="flex-end" className={styles.container}>
        <Stack gap={0.5} direction="column">
          <Typography variant="smallBody" color={colors.dark[200]} fontWeight={fontWeight.semiBold}>
            {t("speakers.name")}
          </Typography>
          <Box className={styles.input}>
            <Input
              autoFocus
              ref={inputRef}
              value={newSpeaker}
              placeholder={t("speakers.placeholder")}
              onChange={handleUpdateNewSpeaker}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                  if (isSpeakerChanged) handleSaveSpeaker();
                }
              }}
            />
          </Box>
        </Stack>
        <Button
          variant="contained"
          size="medium"
          className={styles.button}
          disabled={!isSpeakerChanged}
          onClick={handleSaveSpeaker}
        >
          <CheckIcon size={20} color="white" />
        </Button>
      </Stack>
    </Popover>
  );
};
