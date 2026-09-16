import { SxProps, Theme } from "@mui/material";
import { ArrowLeftIcon } from "lucide-react";

import { colors } from "../../theme/colors";
import { SquareIconButton } from "../SquareIconButton";

interface BackButtonProps {
  onClick: () => void;
  sx?: SxProps<Theme>;
}

export const BackButton = ({ onClick, sx }: BackButtonProps) => {
  return (
    <SquareIconButton
      sx={{
        color: colors.dark[400],
        "&:hover": { color: colors.dark[300] },
        ...sx,
      }}
      onClick={onClick}
    >
      <ArrowLeftIcon size={20} />
    </SquareIconButton>
  );
};
