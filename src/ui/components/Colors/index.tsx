import { Box, Stack, Typography } from "@mui/material";

import { fontWeight } from "../../theme/fonts";

interface IColorProps {
  colorKey: string;
  colorIdx: string;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  colors: any;
}

const Color = ({ colorKey, colorIdx, colors }: IColorProps) => {
  return (
    <Box
      sx={{
        width: 100,
        height: 100,
        backgroundColor: colors[colorKey][colorIdx],
        padding: 1,
        display: "flex",
        justifyContent: "start",
        alignItems: "flex-end",
      }}
      key={colorIdx}
    >
      <Typography
        sx={{ color: "white", textTransform: "capitalize" }}
        variant="subtitle3"
        fontWeight={fontWeight.bold}
      >
        {colorKey}
        <br />
        {colorIdx}
        <br />
        {colors[colorKey][colorIdx]}
      </Typography>
    </Box>
  );
};

interface IColorsProps {
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  colors: any;
}

export const Colors = ({ colors }: IColorsProps) => {
  return (
    <Stack direction="column" gap={0}>
      {Object.keys(colors).map((colorKey: string) => {
        return (
          <Stack direction="row" key={colorKey} gap={0}>
            {Object.keys(colors[colorKey]).map((colorIdx) => {
              return (
                <Color
                  key={`${colorKey}-${colorIdx}`}
                  colors={colors}
                  colorKey={colorKey}
                  colorIdx={colorIdx}
                />
              );
            })}
          </Stack>
        );
      })}
    </Stack>
  );
};
