import logo from "../image/bliro_logo_and_text.svg";

interface IBliroLogoProps {
  width?: number;
  height?: number;
}

export const BliroLogo = ({ width = 143, height = 40 }: IBliroLogoProps) => {
  return <img alt="logo" src={logo} width={width} height={height} />;
};
