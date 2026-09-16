import { IconColor } from "@bliro/common-types/icon/IconColor";
import { colors } from "@bliro/ui/theme/colors";

export const iconColors = [
  IconColor.Grey,
  IconColor.Black,
  IconColor.Orange,
  IconColor.Green,
  IconColor.Blue,
  IconColor.Yellow,
  IconColor.Red,
  IconColor.Purple,
];

export function getIconColor(color: IconColor) {
  switch (color) {
    case IconColor.Grey:
      return colors.dark[400];
    case IconColor.Black:
      return colors.dark[200];
    case IconColor.Orange:
      return colors.orange[100];
    case IconColor.Green:
      return colors.green[100];
    case IconColor.Blue:
      return colors.blue[100];
    case IconColor.Yellow:
      return colors.yellow[100];
    case IconColor.Red:
      return "#E32E7C";
    case IconColor.Purple:
      return "#8F43E6";
    default:
      return "currentColor";
  }
}
